import { useEffect } from 'react';
import { useApp } from '../context';
import { QUESTS } from '../data';
import InfectionControlModule from '../modules/InfectionControlModule';
import FluidModule from '../modules/FluidModule';
import FluidRemovalModule from '../modules/FluidRemovalModule';
import './Tasks.css';

const TASK_QUESTS = Object.values(QUESTS).filter(q => q.type === 'task' || q.type === 'mixed');

export default function Tasks() {
  const { state, dispatch } = useApp();
  const { selectedQuestId, questStatus, questTaskProgress, recentlyUnlocked } = state;

  const selected = selectedQuestId && TASK_QUESTS.find(q => q.id === selectedQuestId);

  // Clear the tab badge as soon as the Tasks page mounts
  useEffect(() => {
    dispatch({ type: 'CLEAR_BADGE', tab: 'tasks' });
  }, []);

  function handleTaskComplete(questId, taskKey) {
    dispatch({ type: 'COMPLETE_TASK', questId, taskKey, questData: QUESTS });
  }

  function openQuest(questId) {
    dispatch({ type: 'MARK_QUEST_SEEN', questId });
    dispatch({ type: 'SELECT_QUEST', questId });
  }

  return (
    <div className="tasks-page fade-in" style={{display:'flex',height:'100%',overflow:'hidden'}}>
      {/* Quest Selector sidebar */}
      <div className="tasks-sidebar">
        <div className="tasks-sidebar__header">
          <h2>Task Quests</h2>
          <p>Select a quest to begin or continue.</p>
        </div>
        <div className="tasks-quest-list">
          {TASK_QUESTS.map(q => {
            const status = questStatus[q.id];
            const prog = questTaskProgress[q.id] || {};
            const done = Object.values(prog).filter(Boolean).length;
            const isLocked = status === 'locked';
            const isNew = recentlyUnlocked.includes(q.id);
            return (
              <button
                key={q.id}
                className={`tasks-quest-item ${selectedQuestId === q.id ? 'tasks-quest-item--active' : ''} ${isLocked ? 'tasks-quest-item--locked' : ''}`}
                onClick={() => !isLocked && openQuest(q.id)}
                disabled={isLocked}
              >
                <div className="tasks-quest-item__top">
                  <span className={`tag tag--${q.type}`}>{q.type}</span>
                  {isNew && <span className="badge badge--teal" style={{fontSize:10}}>New</span>}
                  {!isNew && status === 'complete' && <span className="badge badge--green" style={{fontSize:10}}>✓ Done</span>}
                  {!isNew && status === 'in-progress' && <span className="badge badge--amber" style={{fontSize:10}}>In Progress</span>}
                  {isLocked && <span className="badge badge--grey" style={{fontSize:10}}>🔒 Locked</span>}
                </div>
                <div className="tasks-quest-item__title">{q.title}</div>
                {!isLocked && (
                  <div className="tasks-quest-item__progress">
                    <div className="progress-bar-wrap" style={{height:4,flex:1}}>
                      <div className="progress-bar-fill" style={{width:`${Math.round((done/q.taskCount)*100)}%`,height:'100%'}} />
                    </div>
                    <span style={{fontSize:11,color:'var(--text-300)'}}>{done}/{q.taskCount}</span>
                  </div>
                )}
                {isLocked && <div className="tasks-quest-item__prereq">Requires: {q.prereqs.map(p => QUESTS[p]?.title).join(', ')}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content area */}
      <div className="tasks-main">
        {!selected ? (
          <div className="tasks-empty">
            <div className="tasks-empty__icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <h3>Select a quest to begin</h3>
            <p>Choose an available quest from the sidebar to start working on it.</p>
            <div className="tasks-working-badge">
              <span className="badge badge--green">✓ Fully Working</span>
              <span>Fluid Volume · Intradialytic Fluid · Infection Control</span>
            </div>
          </div>
        ) : selected.id === 'infection-control' ? (
          <InfectionControlModule
            questId={selected.id}
            onTaskComplete={handleTaskComplete}
            taskProgress={questTaskProgress['infection-control'] || {}}
          />
        ) : selected.id === 'fluid-volume' ? (
          <FluidModule
            questId={selected.id}
            onTaskComplete={handleTaskComplete}
            taskProgress={questTaskProgress['fluid-volume'] || {}}
          />
        ) : selected.id === 'intradialytic-fluid' ? (
          <FluidRemovalModule
            questId={selected.id}
            onTaskComplete={handleTaskComplete}
            taskProgress={questTaskProgress['intradialytic-fluid'] || {}}
          />
        ) : (
          <StubModule quest={selected} status={questStatus[selected.id]} />
        )}
      </div>
    </div>
  );
}

function StubModule({ quest, status }) {
  return (
    <div className="stub-module fade-in">
      <div className="stub-module__tag">
        <span className={`tag tag--${quest.type}`}>{quest.type}</span>
      </div>
      <h2>{quest.title}</h2>
      <p className="stub-module__desc">{quest.description}</p>
      <div className="stub-module__card card">
        <div className="stub-module__coming-soon">Coming Soon</div>
        <p>This module is planned for a future release. The full implementation will include:</p>
        <ul className="stub-module__list">
          <li>Reading material and reference slides</li>
          <li>Interactive practice exercises</li>
          <li>Case studies with decision-branching</li>
          {quest.type === 'mixed' && <li>Video demonstrations</li>}
          <li>Progress tracking and XP reward</li>
        </ul>
      </div>
    </div>
  );
}
