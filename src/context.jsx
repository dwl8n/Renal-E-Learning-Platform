import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const LEVEL_THRESHOLDS = [0, 850, 1600, 2500, 3500];

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

// ─── Mock user database ────────────────────────────────────────────────────────
export const MOCK_USERS = [
  { id: 8, username: 'master',  password: 'master123', role: 'admin',  fullName: 'Master Administrator', title: 'Full platform access', master: true },
  { id: 1, username: 'admin',   password: 'admin123', role: 'admin',   fullName: 'Dr. Sarah Mitchell', title: 'Charge Nurse' },
  { id: 2, username: 'jpatel',  password: 'admin456', role: 'admin',   fullName: 'Dr. James Patel',    title: 'Unit Manager' },
  { id: 3, username: 'msantos', password: 'admin789', role: 'admin',   fullName: 'Maria Santos',       title: 'Clinical Educator' },
  { id: 4, username: 'emma',    password: 'student1', role: 'student', fullName: 'Emma Thompson',  cohort: '2026-Spring' },
  { id: 5, username: 'liam',    password: 'student2', role: 'student', fullName: 'Liam Okafor',    cohort: '2026-Spring' },
  { id: 6, username: 'priya',   password: 'student3', role: 'student', fullName: 'Priya Nair',     cohort: '2026-Winter' },
  { id: 7, username: 'noah',    password: 'student4', role: 'student', fullName: 'Noah Williams',  cohort: '2026-Summer' },
];

// ─── Pre-baked student progress snapshots ─────────────────────────────────────
export const STUDENT_SNAPSHOTS = {
  emma: {
    xp: 750,
    questStatus: {
      'introduction':               'complete',
      'emergency-codes':            'complete',
      'infection-control':          'complete',
      'vascular-access-pa':         'unlocked',
      'patient-care-fluids-pa':     'complete',
      'avg-avf':                    'locked',
      'cvc':                        'locked',
      'fluid-volume':               'in-progress',
      'intradialytic-fluid':        'unlocked',
      'medication-admin':           'locked',
      'patient-care-assessment-pa': 'unlocked',
      'bloodwork-values':           'unlocked',
      'potassium-protocol':         'locked',
      'complications':              'locked',
      'software-pa':                'locked',
      'renal-insight':              'locked',
    },
    questTaskProgress: {
      'introduction': { 'pre-assessment': true },
      'infection-control': { reading: true, 'ppe-lab': true, 'station-safety': true, 'isolation-cases': true },
      'patient-care-fluids-pa': { 'pre-assessment': true },
      'fluid-volume': { reading: true, scenario1: true },
      'bloodwork-values': {},
      'intradialytic-fluid': {},
    },
    pendingXP: { 'introduction': 150 },
    assessmentScoreRecord: {},
    preAssessmentResults: {
      'renal-dialysis': { score: 5, band: 'experienced' },
    },
    modulePreAssessments: {
      'm-introduction': { done: true, score: 3, answers: [1, 1, 2, 1, 1, 3] },
    },
    courseRequests: [],
    courseEnrollments: ['renal-dialysis', 'hospital-policy'],
    notifications: [
      { id: 'n-initial-xp', type: 'xp', questId: 'introduction', questTitle: 'Starting Assessment', amount: 150, dismissed: false, ts: Date.now() - 7200000 },
    ],
    journalEntries: [],
  },
  liam: {
    xp: 150,
    questStatus: {
      'introduction':               'complete',
      'emergency-codes':            'unlocked',
      'infection-control':          'unlocked',
      'vascular-access-pa':         'unlocked',
      'patient-care-fluids-pa':     'complete',
      'avg-avf':                    'locked',
      'cvc':                        'locked',
      'fluid-volume':               'unlocked',
      'intradialytic-fluid':        'locked',
      'medication-admin':           'locked',
      'patient-care-assessment-pa': 'unlocked',
      'bloodwork-values':           'unlocked',
      'potassium-protocol':         'locked',
      'complications':              'locked',
      'software-pa':                'locked',
      'renal-insight':              'locked',
    },
    questTaskProgress: {
      'introduction': { 'pre-assessment': true },
      'infection-control': { reading: true },
      'patient-care-fluids-pa': { 'pre-assessment': true },
      'fluid-volume': {},
      'bloodwork-values': {},
      'intradialytic-fluid': {},
    },
    pendingXP: {},
    assessmentScoreRecord: {},
    preAssessmentResults: {
      'renal-dialysis': { score: 2, band: 'novice' },
    },
    courseRequests: [],
    courseEnrollments: ['renal-dialysis', 'hospital-policy'],
    notifications: [],
    journalEntries: [],
  },
  priya: {
    xp: 2950,
    questStatus: {
      'introduction':               'complete',
      'emergency-codes':            'complete',
      'infection-control':          'complete',
      'vascular-access-pa':         'complete',
      'patient-care-fluids-pa':     'complete',
      'avg-avf':                    'complete',
      'cvc':                        'complete',
      'fluid-volume':               'complete',
      'intradialytic-fluid':        'complete',
      'medication-admin':           'complete',
      'patient-care-assessment-pa': 'complete',
      'bloodwork-values':           'complete',
      'potassium-protocol':         'complete',
      'complications':              'unlocked',
      'software-pa':                'complete',
      'renal-insight':              'unlocked',
    },
    questTaskProgress: {
      'introduction': { 'pre-assessment': true },
      'infection-control': { reading: true, 'ppe-lab': true, 'station-safety': true, 'isolation-cases': true },
      'vascular-access-pa': { 'pre-assessment': true },
      'patient-care-fluids-pa': { 'pre-assessment': true },
      'patient-care-assessment-pa': { 'pre-assessment': true },
      'software-pa': { 'pre-assessment': true },
      'fluid-volume': {},
      'bloodwork-values': {},
      'intradialytic-fluid': {},
    },
    pendingXP: {},
    assessmentScoreRecord: {
      'bloodwork-values': { score: 22, passed: true },
    },
    preAssessmentResults: {
      'renal-dialysis': { score: 4, band: 'developing' },
    },
    modulePreAssessments: {
      'm-introduction':         { done: true, score: 5, answers: [1, 1, 2, 1, 1, 3] },
      'm-vascular-access':      { done: true, score: 4, answers: [0, 1, 2, 1] },
      'm-patient-care-fluids':  { done: true, score: 3, answers: [1, 0, 1, 2] },
      'm-patient-care-assessment': { done: true, score: 4, answers: [1, 1, 0, 2] },
    },
    courseRequests: [],
    courseEnrollments: ['renal-dialysis', 'hospital-policy'],
    notifications: [],
    journalEntries: ['introduction', 'fluid-volume', 'bloodwork-values', 'intradialytic-fluid'],
  },
  // ─── Noah: QA / testing account ─────────────────────────────────────────────
  // Not a realistic persona like the others — every module and every module
  // pre-assessment is left UNLOCKED with fresh (empty) progress, so a tester can
  // reach and exercise all content, including check-ins that show their questions
  // only when not yet complete. Login: noah / student4.
  noah: {
    xp: 0,
    questStatus: {
      'introduction':               'unlocked',
      'emergency-codes':            'unlocked',
      'infection-control':          'unlocked',
      'vascular-access-pa':         'unlocked',
      'patient-care-fluids-pa':     'unlocked',
      'avg-avf':                    'unlocked',
      'cvc':                        'unlocked',
      'fluid-volume':               'unlocked',
      'intradialytic-fluid':        'unlocked',
      'medication-admin':           'unlocked',
      'patient-care-assessment-pa': 'unlocked',
      'bloodwork-values':           'unlocked',
      'potassium-protocol':         'unlocked',
      'complications':              'unlocked',
      'software-pa':                'unlocked',
      'renal-insight':              'unlocked',
    },
    questTaskProgress: {},
    pendingXP: {},
    assessmentScoreRecord: {},
    preAssessmentResults: {
      'renal-dialysis': { score: 5, band: 'experienced' },
    },
    modulePreAssessments: {},
    courseRequests: [],
    courseEnrollments: ['renal-dialysis', 'hospital-policy'],
    notifications: [],
    journalEntries: [],
  },
};

// ─── Base state template ───────────────────────────────────────────────────────
const FRESH_QUEST_STATUS = {
  'introduction':               'unlocked',
  'emergency-codes':            'locked',
  'infection-control':          'locked',
  'vascular-access-pa':         'locked',
  'patient-care-fluids-pa':     'locked',
  'avg-avf':                    'locked',
  'cvc':                        'locked',
  'fluid-volume':               'locked',
  'intradialytic-fluid':        'locked',
  'medication-admin':           'locked',
  'patient-care-assessment-pa': 'locked',
  'bloodwork-values':           'locked',
  'potassium-protocol':         'locked',
  'complications':              'locked',
  'software-pa':                'locked',
  'renal-insight':              'locked',
};

const BASE_PROGRESS = {
  page: 'catalogue',
  xp: 0,
  questStatus: { ...FRESH_QUEST_STATUS },
  questTaskProgress: {
    'infection-control': {},
    'fluid-volume': {},
    'bloodwork-values': {},
    'intradialytic-fluid': {},
  },
  pendingXP: {},
  notifications: [],
  badges: { tasks: false, journal: false, assessments: false },
  journalEntries: [],
  recentlyUnlocked: [],
  journalOpen: false,
  journalTarget: null,
  aiChatOpen: false,
  aiMessages: [],
  selectedCourseId: 'renal-dialysis',
  activeCourseId: null,
  selectedQuestId: null,
  selectedModuleId: null,
  assessmentActive: false,
  assessmentScore: null,
  assessmentScoreRecord: {},
  preAssessmentResults: {},
  modulePreAssessments: {},
  courseRequests: [],
  courseEnrollments: ['renal-dialysis'],
  mapFocusQuestId: null,
};

const initialState = {
  currentUser: null,
  ...BASE_PROGRESS,
};

function reducer(state, action) {
  switch (action.type) {
    // ─── Auth ────────────────────────────────────────────────────────────────
    case 'LOGIN': {
      const { user } = action;
      if (user.role === 'student') {
        const snap = STUDENT_SNAPSHOTS[user.username] || {};
        return {
          ...BASE_PROGRESS,
          currentUser: user,
          xp:                    snap.xp                    ?? 0,
          questStatus:           snap.questStatus           ?? { ...FRESH_QUEST_STATUS },
          questTaskProgress:     snap.questTaskProgress     ?? BASE_PROGRESS.questTaskProgress,
          pendingXP:             snap.pendingXP             ?? {},
          assessmentScoreRecord: snap.assessmentScoreRecord ?? {},
          preAssessmentResults:  snap.preAssessmentResults  ?? {},
          modulePreAssessments:  snap.modulePreAssessments  ?? {},
          courseRequests:        snap.courseRequests        ?? [],
          courseEnrollments:     snap.courseEnrollments     ?? BASE_PROGRESS.courseEnrollments,
          notifications:         snap.notifications         ?? [],
          journalEntries:        snap.journalEntries        ?? [],
        };
      }
      // admin — no personal progress state needed
      return { ...BASE_PROGRESS, currentUser: user };
    }

    case 'LOGOUT':
      return { ...initialState };

    // ─── Navigation ──────────────────────────────────────────────────────────
    case 'NAV': {
      const newBadges = { ...state.badges };
      if (action.page === 'tasks') newBadges.tasks = false;
      if (action.page === 'assessments') newBadges.assessments = false;
      return { ...state, page: action.page, selectedQuestId: null, assessmentActive: false, badges: newBadges };
    }

    case 'SELECT_QUEST': return { ...state, selectedQuestId: action.questId };

    case 'SELECT_MODULE': return { ...state, selectedModuleId: action.moduleId, selectedQuestId: null };

    // Navigates to the Progress page's course map, pre-scrolled/highlighted to
    // a specific quest — used by the "Show in map" row menu action.
    case 'FOCUS_MAP_QUEST':
      return { ...state, page: 'progress', selectedQuestId: null, assessmentActive: false, mapFocusQuestId: action.questId };

    case 'CLEAR_MAP_FOCUS':
      return { ...state, mapFocusQuestId: null };

    case 'SELECT_COURSE':
      return { ...state, selectedCourseId: action.courseId, page: 'catalogue', selectedQuestId: null };

    case 'ENTER_COURSE':
      return {
        ...state,
        activeCourseId: action.courseId,
        selectedCourseId: action.courseId,
        selectedModuleId: null,
        selectedQuestId: null,
        page: 'catalogue',
      };

    case 'EXIT_COURSE':
      return {
        ...state,
        activeCourseId: null,
        selectedModuleId: null,
        selectedQuestId: null,
        page: 'catalogue',
      };

    case 'ENROLL_COURSE':
      return {
        ...state,
        selectedCourseId: action.courseId,
        page: 'catalogue',
        courseEnrollments: state.courseEnrollments.includes(action.courseId)
          ? state.courseEnrollments
          : [...state.courseEnrollments, action.courseId],
        notifications: [
          { id: `n-course-${Date.now()}`, type: 'course', text: 'Course added to your learner catalogue.', dismissed: false, ts: Date.now() },
          ...state.notifications,
        ],
      };

    case 'REQUEST_COURSE_ACCESS':
      if (state.courseRequests.includes(action.courseId)) return state;
      return {
        ...state,
        courseRequests: [...state.courseRequests, action.courseId],
        notifications: [
          { id: `n-request-${Date.now()}`, type: 'course', text: 'Access request saved for trainer review.', dismissed: false, ts: Date.now() },
          ...state.notifications,
        ],
      };

    case 'COMPLETE_PRE_ASSESSMENT':
      return {
        ...state,
        preAssessmentResults: {
          ...state.preAssessmentResults,
          [action.courseId]: { score: action.score, band: action.band },
        },
      };

    case 'COMPLETE_MODULE_PRE_ASSESSMENT':
      return {
        ...state,
        modulePreAssessments: {
          ...state.modulePreAssessments,
          [action.moduleId]: { done: true, score: action.score, answers: action.answers },
        },
      };

    // ─── Task completion ─────────────────────────────────────────────────────
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
        Object.values(questData).forEach(qd => {
          if (newQuestStatus[qd.id] === 'unlocked' && state.questStatus[qd.id] === 'locked') {
            if (qd.type === 'assessment') newBadges.assessments = true;
            else newBadges.tasks = true;
          }
        });
      }

      const newlyUnlockedIds = Object.values(questData)
        .filter(qd => newQuestStatus[qd.id] === 'unlocked' && state.questStatus[qd.id] === 'locked')
        .map(qd => qd.id);
      const newRecentlyUnlocked = [...new Set([...state.recentlyUnlocked, ...newlyUnlockedIds])];

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

    // ─── XP collection ───────────────────────────────────────────────────────
    case 'COLLECT_XP': {
      const { questId } = action;
      const amount = state.pendingXP[questId] || 0;
      if (!amount) return state;
      const newXP = state.xp + amount;
      const newPending = { ...state.pendingXP };
      delete newPending[questId];
      const newNotifications = state.notifications.map(n =>
        n.type === 'xp' && n.questId === questId ? { ...n, dismissed: true } : n
      );
      return { ...state, xp: newXP, pendingXP: newPending, notifications: newNotifications };
    }

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.notifId ? { ...n, dismissed: true } : n
        ),
      };

    // ─── Assessment ──────────────────────────────────────────────────────────
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
      const newlyUnlockedIds = Object.values(questData)
        .filter(qd => newQuestStatus[qd.id] === 'unlocked' && state.questStatus[qd.id] === 'locked')
        .map(qd => qd.id);

      return {
        ...state,
        questStatus: newQuestStatus,
        pendingXP: newPending,
        notifications: newNotifications,
        badges: newBadges,
        recentlyUnlocked: [...new Set([...state.recentlyUnlocked, ...newlyUnlockedIds])],
        assessmentScore: { score, passed },
        // persist score per quest so the admin dashboard can read it
        assessmentScoreRecord: {
          ...state.assessmentScoreRecord,
          [questId]: { score, passed },
        },
      };
    }

    case 'RESET_ASSESSMENT': return { ...state, assessmentScore: null };

    case 'MARK_QUEST_SEEN':
      return { ...state, recentlyUnlocked: state.recentlyUnlocked.filter(id => id !== action.questId) };

    // ─── Journal ─────────────────────────────────────────────────────────────
    case 'ADD_TO_JOURNAL': {
      if (state.journalEntries.includes(action.questId)) return state;
      const newJournalEntries = [...state.journalEntries, action.questId];
      const newNotifications = [
        ...state.notifications,
        { id: `n-journal-${Date.now()}`, type: 'journal', questId: action.questId, text: 'New pages added to your Journal', dismissed: false, ts: Date.now() },
      ];
      return { ...state, journalEntries: newJournalEntries, notifications: newNotifications, badges: { ...state.badges, journal: true } };
    }

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

    // ─── AI chat ─────────────────────────────────────────────────────────────
    case 'AI_OPEN':    return { ...state, aiChatOpen: true };
    case 'AI_CLOSE':   return { ...state, aiChatOpen: false };
    case 'AI_TOGGLE':  return { ...state, aiChatOpen: !state.aiChatOpen };
    case 'AI_MESSAGE': return { ...state, aiMessages: [...state.aiMessages, action.msg] };

    // ─── Reset ───────────────────────────────────────────────────────────────
    case 'RESET_PROGRESS':
      return { ...BASE_PROGRESS, currentUser: state.currentUser, aiMessages: [] };

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
