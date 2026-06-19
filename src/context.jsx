import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const LEVEL_THRESHOLDS = [0, 1200, 2800, 5000, 8000];

function getLevel(xp) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, LEVEL_THRESHOLDS.length);
}

function getXpForLevel(level) {
  return LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)];
}

function getNextLevelXp(level) {
  return LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)];
}

const initialState = {
  page: 'progress',
  xp: 975,
  questStatus: {
    'introduction':       'complete',
    'emergency-codes':    'complete',
    'infection-control':  'complete',
    'fluid-volume':       'unlocked',
    'avg-avf':            'locked',
    'cvc':                'locked',
    'intradialytic-fluid':'unlocked',
    'bloodwork-values':   'unlocked',
    'medication-admin':   'locked',
    'potassium-protocol': 'locked',
    'complications':      'locked',
    'renal-insight':      'locked',
    'cerner':      'locked',
  },
  questTaskProgress: {
    'fluid-volume': {},
    'bloodwork-values': {},
    'intradialytic-fluid': {},
  },
  pendingXP: {
    'introduction': 600,
  },
  // Dismissible notification cards (replace old activityFeed)
  notifications: [
    // { id: 'n-initial-journal', type: 'journal', text: 'New pages added to your Journal', dismissed: false, ts: Date.now() - 5000000 },
    { id: 'n-initial-xp', type: 'xp', questId: 'introduction', questTitle: 'Introduction', amount: 600, dismissed: false, ts: Date.now() - 7200000 },
  ],
  // Tab badges — cleared when user visits the tab
  badges: {
    tasks: false,
    journal: false,
    assessments: false,
  },
  // Quest IDs whose reading tasks have been completed (unlocks journal content)
  journalEntries: [],
  // Quest IDs recently unlocked, not yet opened by the user
  recentlyUnlocked: [],

  // Journal overlay
  journalOpen: false,
  journalTarget: null, // { tab: 'glossary', termSlug: 'dry-weight' } | null

  aiChatOpen: false,
  aiMessages: [],
  selectedQuestId: null,
  assessmentActive: false,
  assessmentScore: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'NAV': {
      const newBadges = { ...state.badges };
      if (action.page === 'tasks') newBadges.tasks = false;
      if (action.page === 'assessments') newBadges.assessments = false;
      return { ...state, page: action.page, selectedQuestId: null, assessmentActive: false, badges: newBadges };
    }

    case 'SELECT_QUEST': return { ...state, selectedQuestId: action.questId };

    case 'COMPLETE_TASK': {
      const { questId, taskKey } = action;
      const prev = state.questTaskProgress[questId] || {};
      const updated = { ...prev, [taskKey]: true };
      const questData = action.questData;
      const q = questData[questId];
      const completedCount = Object.values(updated).filter(Boolean).length;
      const isNowComplete = completedCount >= q.taskCount;

      let newQuestStatus = { ...state.questStatus };
      if (isNowComplete) {
        newQuestStatus[questId] = 'complete';
        Object.values(questData).forEach(qd => {
          if (qd.prereqs.includes(questId) && newQuestStatus[qd.id] === 'locked') {
            const prereqsMet = qd.prereqs.every(p => newQuestStatus[p] === 'complete');
            if (prereqsMet) newQuestStatus[qd.id] = 'unlocked';
          }
        });
      } else if (state.questStatus[questId] === 'unlocked') {
        newQuestStatus[questId] = 'in-progress';
      }

      let newPending = { ...state.pendingXP };
      let newNotifications = [...state.notifications];
      let newBadges = { ...state.badges };
      let newJournalEntries = [...state.journalEntries];

      if (isNowComplete && !state.pendingXP[questId] && state.questStatus[questId] !== 'complete') {
        newPending[questId] = q.xp;
        newNotifications = [
          { id: `n-xp-${Date.now()}`, type: 'xp', questId, questTitle: q.title, amount: q.xp, dismissed: false, ts: Date.now() },
          ...newNotifications,
        ];
        // Badge the appropriate tab when a new quest unlocks
        Object.values(questData).forEach(qd => {
          if (newQuestStatus[qd.id] === 'unlocked' && state.questStatus[qd.id] === 'locked') {
            if (qd.type === 'assessment') newBadges.assessments = true;
            else newBadges.tasks = true;
          }
        });
      }

      // Track newly unlocked quests for per-quest "New" badges
      const newlyUnlockedIds = Object.values(questData)
        .filter(qd => newQuestStatus[qd.id] === 'unlocked' && state.questStatus[qd.id] === 'locked')
        .map(qd => qd.id);
      const newRecentlyUnlocked = [...new Set([...state.recentlyUnlocked, ...newlyUnlockedIds])];

      // Reading task completion unlocks journal content
      if (taskKey === 'reading' && !state.journalEntries.includes(questId)) {
        newJournalEntries = [...newJournalEntries, questId];
        newNotifications = [
          { id: `n-journal-${Date.now()}`, type: 'journal', questId, text: `New pages added to your Journal`, dismissed: false, ts: Date.now() },
          ...newNotifications,
        ];
        newBadges.journal = true;
      }

      return {
        ...state,
        questTaskProgress: { ...state.questTaskProgress, [questId]: updated },
        questStatus: newQuestStatus,
        pendingXP: newPending,
        notifications: newNotifications,
        badges: newBadges,
        journalEntries: newJournalEntries,
        recentlyUnlocked: newRecentlyUnlocked,
      };
    }

    case 'COLLECT_XP': {
      const { questId } = action;
      const amount = state.pendingXP[questId] || 0;
      if (!amount) return state;
      const newXP = state.xp + amount;
      const newPending = { ...state.pendingXP };
      delete newPending[questId];
      // Auto-dismiss XP notification for this quest
      const newNotifications = state.notifications.map(n =>
        n.type === 'xp' && n.questId === questId ? { ...n, dismissed: true } : n
      );
      return { ...state, xp: newXP, pendingXP: newPending, notifications: newNotifications };
    }

    case 'DISMISS_NOTIFICATION': {
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.notifId ? { ...n, dismissed: true } : n
        ),
      };
    }

    case 'COMPLETE_ASSESSMENT': {
      const { questId, score, passed, questData } = action;
      let newQuestStatus = { ...state.questStatus };
      if (passed) {
        newQuestStatus[questId] = 'complete';
        Object.values(questData).forEach(qd => {
          if (qd.prereqs.includes(questId) && newQuestStatus[qd.id] === 'locked') {
            const prereqsMet = qd.prereqs.every(p => newQuestStatus[p] === 'complete');
            if (prereqsMet) newQuestStatus[qd.id] = 'unlocked';
          }
        });
      }
      const q = questData[questId];
      let newPending = { ...state.pendingXP };
      let newNotifications = [...state.notifications];
      let newBadges = { ...state.badges };
      if (passed && !state.pendingXP[questId] && state.questStatus[questId] !== 'complete') {
        newPending[questId] = q.xp;
        newNotifications = [
          { id: `n-xp-${Date.now()}`, type: 'xp', questId, questTitle: q.title, amount: q.xp, dismissed: false, ts: Date.now() },
          ...newNotifications,
        ];
        Object.values(questData).forEach(qd => {
          if (newQuestStatus[qd.id] === 'unlocked' && state.questStatus[qd.id] === 'locked') {
            if (qd.type === 'assessment') newBadges.assessments = true;
            else newBadges.tasks = true;
          }
        });
      }
      const newlyUnlockedAssessIds = Object.values(questData)
        .filter(qd => newQuestStatus[qd.id] === 'unlocked' && state.questStatus[qd.id] === 'locked')
        .map(qd => qd.id);

      return {
        ...state,
        questStatus: newQuestStatus,
        pendingXP: newPending,
        notifications: newNotifications,
        badges: newBadges,
        recentlyUnlocked: [...new Set([...state.recentlyUnlocked, ...newlyUnlockedAssessIds])],
        assessmentScore: { score, passed },
      };
    }

    case 'RESET_ASSESSMENT': return { ...state, assessmentScore: null };

    case 'MARK_QUEST_SEEN':
      return { ...state, recentlyUnlocked: state.recentlyUnlocked.filter(id => id !== action.questId) };

    case 'JOURNAL_OPEN':
      return {
        ...state,
        journalOpen: true,
        journalTarget: action.target || null,
        badges: { ...state.badges, journal: false },
      };

    case 'JOURNAL_CLOSE':
      return { ...state, journalOpen: false, journalTarget: null };

    case 'CLEAR_BADGE':
      return { ...state, badges: { ...state.badges, [action.tab]: false } };

    case 'AI_OPEN': return { ...state, aiChatOpen: true };
    case 'AI_CLOSE': return { ...state, aiChatOpen: false };
    case 'AI_TOGGLE': return { ...state, aiChatOpen: !state.aiChatOpen };

    case 'AI_MESSAGE': return { ...state, aiMessages: [...state.aiMessages, action.msg] };

    case 'RESET_PROGRESS': return { ...initialState, aiMessages: [] };

    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const level = getLevel(state.xp);
  const levelXp = getXpForLevel(level);
  const nextXp = getNextLevelXp(level);
  const xpInLevel = state.xp - levelXp;
  const xpToNext = nextXp - levelXp;
  const xpPct = xpToNext === 0 ? 100 : Math.min(100, Math.round((xpInLevel / xpToNext) * 100));

  return (
    <AppContext.Provider value={{ state, dispatch, level, levelXp, nextXp, xpInLevel, xpToNext, xpPct }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

export { LEVEL_THRESHOLDS };
