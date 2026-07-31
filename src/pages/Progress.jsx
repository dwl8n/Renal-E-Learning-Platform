import { useEffect, useState } from 'react';
import { useApp } from '../context';
import { QUESTS, QUEST_POSITIONS, QUEST_EDGES } from '../data';
import { LEVEL_THRESHOLDS } from '../context';
import './Progress.css';

const NODE_R = 34;
const NODE_PA_R = 46; // larger radius for pre-assessment nodes

// Horizontal zebra bands — one per module tier
const MODULE_BANDS = [
  { label: 'Introduction',              y: 20,   height: 315, shade: false },
  { label: 'Machine & Access / Fluids', y: 335,  height: 400, shade: true  },
  { label: 'Software',                  y: 735,  height: 230, shade: false },
  { label: 'Patient Care: Assessment',  y: 965,  height: 345, shade: true  },
];

const STATUS_COLOR = {
  complete: 'var(--green-500)',
  'in-progress': 'var(--amber-500)',
  unlocked: 'var(--teal-500)',
  locked: 'var(--grey-400)',
};
const STATUS_LABEL = {
  complete: 'Complete',
  'in-progress': 'In Progress',
  unlocked: 'Available',
  locked: 'Locked',
};
const TYPE_LABEL = {
  task: 'Task',
  mixed: 'Practice',
  assessment: 'Assessment',
};

export default function Progress() {
  const { state, dispatch, level, xpInLevel, xpToNext, xpPct } = useApp();
  const [treeView, setTreeView] = useState(false);
  const [hoveredQuest, setHoveredQuest] = useState(null);

  const totalXP = state.xp;
  const pendingCount = Object.keys(state.pendingXP).length;

  // "Show in map" row-menu action lands here with mapFocusQuestId set — open
  // the tree view, scroll/highlight that node, then consume the focus request.
  useEffect(() => {
    const questId = state.mapFocusQuestId;
    if (!questId) return;
    setTreeView(true);
    const timer = setTimeout(() => {
      document.getElementById(`quest-node-${questId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHoveredQuest(questId);
      dispatch({ type: 'CLEAR_MAP_FOCUS' });
    }, 60);
    return () => clearTimeout(timer);
  }, [state.mapFocusQuestId]);

  const activeQuests = Object.values(QUESTS).filter(q => {
    const s = state.questStatus[q.id];
    return s === 'unlocked' || s === 'in-progress';
  });
  activeQuests.sort((a, b) => {
    const order = { 'in-progress': 0, unlocked: 1 };
    return (order[state.questStatus[a.id]] ?? 2) - (order[state.questStatus[b.id]] ?? 2);
  });

  const xpQuests = Object.values(QUESTS).filter(q => state.pendingXP[q.id]);
  const journalNotifications = state.notifications.filter(n => !n.dismissed && n.type === 'journal');

  return (
    <div className="page progress-page fade-in">
      {/* Pinned level bar */}
      <div className="progress-header-wrap">
        <div className="page-inner">
          <div className="progress-header card">
            <div className="progress-header__avatar">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="var(--teal-200)"/>
                {/* <circle cx="24" cy="20" r="10" fill="var(--teal-300)"/>
                <path d="M6 44c2-10 7.2-16 18-16s18 6 18 16" fill="var(--teal-200)"/> */}
              </svg>
            </div>
            <div className="progress-header__info">
              <div className="progress-header__level-badge">
                <span className="progress-header__level-num">Level {level}</span>
                <span className="progress-header__level-label">/ {LEVEL_THRESHOLDS.length - 1}</span>
              </div>
              <div className="progress-bar-wrap" style={{height:18, marginTop:6, marginBottom:4}}>
                <div className="progress-bar-fill" style={{width:`${xpPct}%`, height:'100%'}} />
              </div>
              <div className="progress-header__xp">
                <span className="progress-header__xp-val">{totalXP.toLocaleString()} / {(totalXP - xpInLevel + xpToNext).toLocaleString()} points</span>
                {pendingCount > 0 && (
                  <span className="badge badge--amber" style={{fontSize:11}}>{pendingCount} uncollected</span>
                )}
              </div>
            </div>
            <button
              className={`quest-tree-btn ${treeView ? 'quest-tree-btn--active' : ''}`}
              onClick={() => setTreeView(v => !v)}
              title={treeView ? 'Hide course map' : 'Show course map'}
              aria-label="Toggle course map"
            >
              <MapIcon />
            </button>
          </div>
          {hoveredQuest && (
            <QuestTooltip questId={hoveredQuest} questStatus={state.questStatus} pendingXP={state.pendingXP} />
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="progress-body">
        <div className="page-inner">
          {treeView ? (
            <div className="quest-tree-wrap">
              <QuestTree
                questStatus={state.questStatus}
                pendingXP={state.pendingXP}
                hovered={hoveredQuest}
                onHover={setHoveredQuest}
                onNodeClick={(questId) => handleNodeClick(questId, state, dispatch)}
              />
            </div>
          ) : (
            <div className="pquest-list">
              {journalNotifications.map(n => (
                <JournalNotif key={n.id} notif={n} dispatch={dispatch} />
              ))}
              {xpQuests.map(q => (
                <XPQuestCard
                  key={q.id}
                  quest={q}
                  taskProgress={state.questTaskProgress[q.id] || {}}
                  pendingXP={state.pendingXP[q.id]}
                  dispatch={dispatch}
                />
              ))}
              {activeQuests.map(q => (
                <ActiveQuestCard
                  key={q.id}
                  quest={q}
                  status={state.questStatus[q.id]}
                  taskProgress={state.questTaskProgress[q.id] || {}}
                  isNew={state.recentlyUnlocked.includes(q.id)}
                  dispatch={dispatch}
                />
              ))}
              {xpQuests.length === 0 && activeQuests.length === 0 && journalNotifications.length === 0 && (
                <div style={{textAlign:'center', padding:'40px 0', color:'var(--text-300)', fontSize:14}}>
                  All tasks complete. Check the course map for upcoming content.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function handleNodeClick(questId, state, dispatch) {
  const status = state.questStatus[questId];
  if (status === 'locked') return;
  dispatch({ type: 'NAV', page: 'tasks' });
  dispatch({ type: 'SELECT_QUEST', questId });
  dispatch({ type: 'MARK_QUEST_SEEN', questId });
}

// ─── Card components ──────────────────────────────────────────────────────────

function JournalNotif({ notif, dispatch }) {
  return (
    <div
      className="pquest-card pquest-card--journal"
      onClick={() => {
        dispatch({ type: 'JOURNAL_OPEN' });
        dispatch({ type: 'DISMISS_NOTIFICATION', notifId: notif.id });
      }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && dispatch({ type: 'JOURNAL_OPEN' })}
    >
      <div className="pquest-card__header">
        <span className="pquest-card__title">📖 {notif.text}</span>
        <button
          className="notif-card__dismiss"
          onClick={e => { e.stopPropagation(); dispatch({ type: 'DISMISS_NOTIFICATION', notifId: notif.id }); }}
          aria-label="Dismiss"
        >×</button>
      </div>
      <span className="pquest-card__hint">Tap to open Journal</span>
    </div>
  );
}

function ActiveQuestCard({ quest, status, taskProgress, isNew, dispatch }) {
  const completedTasks = Object.values(taskProgress).filter(Boolean).length;
  const progress = Math.round((completedTasks / quest.taskCount) * 100);

  function open() {
    dispatch({ type: 'NAV', page: 'tasks' });
    dispatch({ type: 'SELECT_QUEST', questId: quest.id });
    dispatch({ type: 'MARK_QUEST_SEEN', questId: quest.id });
  }

  return (
    <div
      className={`pquest-card pquest-card--active ${status === 'in-progress' ? 'pquest-card--inprogress' : ''}`}
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && open()}
    >
      <div className="pquest-card__header">
        <span className="pquest-card__title">{quest.title}</span>
        <div className="pquest-card__tags">
          {isNew && <span className="badge badge--teal" style={{fontSize:10}}>New</span>}
          <span className={`tag tag--${quest.type}`}>{TYPE_LABEL[quest.type] || 'Task'}</span>
        </div>
      </div>
      <p className="pquest-card__desc">{quest.description}</p>
      <div className="pquest-card__footer">
        <div className="progress-bar-wrap" style={{flex:1, height:6}}>
          <div className="progress-bar-fill" style={{width:`${progress}%`, height:'100%'}} />
        </div>
        <span className="pquest-card__count">{completedTasks}/{quest.taskCount}</span>
        <button
          className="btn btn--primary btn--sm pquest-card__action"
          onClick={e => { e.stopPropagation(); open(); }}
        >
          {status === 'in-progress' ? 'Continue' : 'Start'}
        </button>
      </div>
    </div>
  );
}

function XPQuestCard({ quest, pendingXP, dispatch }) {
  const total = quest.taskCount;

  function collect() {
    dispatch({ type: 'COLLECT_XP', questId: quest.id });
  }

  return (
    <div
      className="pquest-card pquest-card--xp"
      onClick={collect}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && collect()}
    >
      <div className="pquest-card__header">
        <span className="pquest-card__title">{quest.title}</span>
        <div className="pquest-card__tags">
          <span className={`tag tag--${quest.type}`}>{TYPE_LABEL[quest.type] || 'Task'}</span>
          <span className="pquest-card__xp-badge">⭐ {pendingXP} pts</span>
        </div>
      </div>
      <p className="pquest-card__desc">{quest.description}</p>
      <div className="pquest-card__footer">
        <div className="progress-bar-wrap" style={{flex:1, height:6}}>
          <div className="progress-bar-fill progress-bar-fill--complete" style={{width:'100%', height:'100%'}} />
        </div>
        <span className="pquest-card__count">{total}/{total}</span>
        <span className="pquest-card__collect-hint">Tap to collect</span>
      </div>
    </div>
  );
}

// ─── SVG Course Map ───────────────────────────────────────────────────────────
function QuestTree({ questStatus, pendingXP, hovered, onHover, onNodeClick }) {
  return (
    <div style={{overflowX:'auto'}}>
      <svg viewBox="0 0 900 1310" style={{width:'100%', minWidth:600, display:'block'}}>
        {/* Zebra module bands */}
        {MODULE_BANDS.map((band) =>
          band.shade ? (
            <rect key={band.label} x={0} y={band.y} width={900} height={band.height}
              fill="var(--grey-50, #f8f8f8)" rx={0} />
          ) : null
        )}
        {MODULE_BANDS.map((band) => (
          <text key={`lbl-${band.label}`} x={14} y={band.y + 18} fontSize={10}
            fill="var(--grey-400, #bbb)" fontFamily="var(--font-body)" fontWeight="600"
            letterSpacing="0.06em">
            {band.label.toUpperCase()}
          </text>
        ))}

        {QUEST_EDGES.map(([from, to]) => {
          const f = QUEST_POSITIONS[from];
          const t = QUEST_POSITIONS[to];
          const toStatus = questStatus[to];
          const color = STATUS_COLOR[toStatus] || 'var(--grey-200)';
          return (
            <g key={`${from}-${to}`}>
              <line
                x1={f.x} y1={f.y}
                x2={t.x} y2={t.y}
                stroke={color}
                strokeWidth={3}
                strokeOpacity={toStatus === 'locked' ? 0.3 : 0.7}
                strokeDasharray={toStatus === 'locked' ? '6 4' : undefined}
              />
            </g>
          );
        })}

        {Object.values(QUESTS).map(q => {
          const pos = QUEST_POSITIONS[q.id];
          const status = questStatus[q.id];
          const color = STATUS_COLOR[status];
          const isHovered = hovered === q.id;
          const hasPending = !!pendingXP[q.id];
          const completedLabel = status === 'complete' && !hasPending ? '✓' : status === 'locked' ? '🔒' : '';
          const isPA = q.type === 'pre-assessment';
          const r = isPA ? NODE_PA_R : NODE_R;

          return (
            <g
              key={q.id}
              id={`quest-node-${q.id}`}
              transform={`translate(${pos.x},${pos.y})`}
              style={{cursor: status !== 'locked' ? 'pointer' : 'default'}}
              onMouseEnter={() => onHover(q.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onNodeClick(q.id)}
            >
              {isHovered && <circle r={r + 8} fill={color} fillOpacity={.15} />}
              <circle r={r} fill={status === 'locked' ? 'var(--grey-100)' : 'var(--surface)'} stroke={color} strokeWidth={isHovered ? 3.5 : 2.5} />

              {status === 'in-progress' && (
                <circle r={r - 4} fill="none" stroke={color} strokeWidth={4} strokeOpacity={.3}
                  strokeDasharray={`${2 * Math.PI * (r - 4) * 0.6} ${2 * Math.PI * (r - 4)}`}
                  transform="rotate(-90)" />
              )}

              {hasPending && <circle r={r + 4} fill="none" stroke="var(--amber-400)" strokeWidth={2} strokeOpacity={0.8} strokeDasharray="4 3" />}

              <foreignObject x={-14} y={-16} width={28} height={28}>
                <TypeShape type={q.type} locked={status === 'locked'} />
              </foreignObject>

              {hasPending && <text y={isPA ? 18 : 14} textAnchor="middle" fontSize={13} fontFamily="system-ui">⭐</text>}
              {!hasPending && completedLabel && <text y={isPA ? 18 : 14} textAnchor="middle" fontSize={14} fontFamily="system-ui">{completedLabel}</text>}

              <text y={r + 14} textAnchor="middle" fontSize={11} fill={status === 'locked' ? 'var(--grey-400)' : 'var(--text-700)'}
                fontWeight={isHovered ? '600' : '400'} fontFamily="var(--font-body)">
                {q.title.length > 14 ? q.title.slice(0, 14) + '…' : q.title}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function QuestTooltip({ questId, questStatus, pendingXP }) {
  const q = QUESTS[questId];
  const status = questStatus[questId];
  if (!q) return null;
  const hasPending = !!pendingXP[questId];

  return (
    <div className="quest-tooltip">
      <div className="quest-tooltip__top">
        <span className={`tag tag--${q.type}`}>{TYPE_LABEL[q.type] || 'Task'}</span>
        <span className="quest-card__xp">{q.xp} pts</span>
      </div>
      <h3 className="quest-tooltip__title">{q.title}</h3>
      <p className="quest-tooltip__desc">{q.description}</p>
      <div className="quest-tooltip__status">
        <span className={`badge badge--${status === 'complete' ? 'green' : status === 'in-progress' ? 'amber' : status === 'unlocked' ? 'teal' : 'grey'}`}>
          {STATUS_LABEL[status]}
        </span>
        {hasPending && <span className="badge badge--amber">Points ready</span>}
        {status !== 'locked' && (
          <span style={{fontSize:12, color:'var(--text-300)'}}>
            {status === 'complete' ? 'Click to review' : status === 'in-progress' ? 'Click to continue' : 'Click to start'}
          </span>
        )}
      </div>
    </div>
  );
}

function TypeShape({ type, locked }) {
  const isPA = type === 'pre-assessment';
  const color = locked ? 'var(--grey-200)'
    : isPA ? 'var(--teal-50)'
    : type === 'task' ? 'var(--teal-100)'
    : type === 'assessment' ? 'var(--red-100)'
    : 'var(--amber-100)';
  const iconColor = locked ? 'var(--grey-400)'
    : isPA ? 'var(--teal-500)'
    : type === 'task' ? 'var(--teal-600)'
    : type === 'assessment' ? 'var(--red-500)'
    : 'var(--amber-600)';
  return (
    <div style={{width:32,height:32,background:color,borderRadius:isPA?'6px':type==='task'?'50%':type==='assessment'?'4px':'8px',display:'flex',alignItems:'center',justifyContent:'center',color:iconColor}}>
      {isPA && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>}
      {type === 'task' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
      {type === 'assessment' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
      {type === 'mixed' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="2" width="20" height="20" rx="4"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>}
    </div>
  );
}

function MapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  );
}
