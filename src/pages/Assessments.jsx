import { useEffect } from 'react';
import { useApp } from '../context';
import { QUESTS } from '../data';
import BloodworkModule from '../modules/BloodworkModule';
import './Tasks.css';

const ASSESSMENT_QUESTS = Object.values(QUESTS).filter(q => q.type === 'assessment' || q.type === 'mixed');
const TYPE_LABEL = {
  assessment: 'Assessment',
  mixed: 'Practice',
};

export default function Assessments() {
  const { state, dispatch } = useApp();
  const { selectedQuestId, questStatus, questTaskProgress, assessmentScore, recentlyUnlocked } = state;

  const selected = selectedQuestId && ASSESSMENT_QUESTS.find(q => q.id === selectedQuestId);

  useEffect(() => {
    dispatch({ type: 'CLEAR_BADGE', tab: 'assessments' });
  }, []);

  function handleTaskComplete(questId, taskKey) {
    dispatch({ type: 'COMPLETE_TASK', questId, taskKey, questData: QUESTS });
  }

  function handleAssessmentComplete(score, passed) {
    dispatch({ type: 'COMPLETE_ASSESSMENT', questId: 'bloodwork-values', score, passed, questData: QUESTS });
  }

  function handleAssessmentReset() {
    dispatch({ type: 'RESET_ASSESSMENT' });
  }

  function openQuest(questId) {
    dispatch({ type: 'SELECT_QUEST', questId });
    dispatch({ type: 'MARK_QUEST_SEEN', questId });
  }

  return (
    <div className="tasks-page fade-in" style={{display:'flex',height:'100%',overflow:'hidden'}}>
      <div className="tasks-sidebar">
        <div className="tasks-sidebar__header">
          <h2>Assessments</h2>
          <p>Official checks and assessment-ready practice.</p>
        </div>
        <div className="tasks-quest-list">
          {ASSESSMENT_QUESTS.map(q => {
            const status = questStatus[q.id];
            const prog = questTaskProgress[q.id] || {};
            const done = Object.values(prog).filter(Boolean).length;
            const isLocked = status === 'locked';
            const passed = assessmentScore?.passed && q.id === 'bloodwork-values';
            const isNew = recentlyUnlocked.includes(q.id);
            return (
              <button
                key={q.id}
                className={`tasks-quest-item ${selectedQuestId === q.id ? 'tasks-quest-item--active' : ''} ${isLocked ? 'tasks-quest-item--locked' : ''}`}
                onClick={() => !isLocked && openQuest(q.id)}
                disabled={isLocked}
              >
                <div className="tasks-quest-item__top">
                  <span className={`tag tag--${q.type}`}>{TYPE_LABEL[q.type] || 'Assessment'}</span>
                  {isNew && <span className="badge badge--teal" style={{fontSize:10}}>New</span>}
                  {!isNew && passed && <span className="badge badge--green" style={{fontSize:10}}>✓ Passed</span>}
                  {!isNew && status === 'in-progress' && !passed && <span className="badge badge--amber" style={{fontSize:10}}>In Progress</span>}
                  {isLocked && <span className="badge badge--grey" style={{fontSize:10}}>🔒</span>}
                </div>
                <div className="tasks-quest-item__title">{q.title}</div>
                {!isLocked && (
                  <div className="tasks-quest-item__progress">
                    <div className="progress-bar-wrap" style={{height:4,flex:1}}>
                      <div className="progress-bar-fill" style={{width:`${Math.round((done/q.taskCount)*100)}%`,height:'100%'}} />
                    </div>
                    <span style={{fontSize:11,color:'var(--text-300)'}}>{done}/{q.taskCount} items</span>
                  </div>
                )}
                {isLocked && <div className="tasks-quest-item__prereq">Requires: {q.prereqs.map(p => QUESTS[p]?.title).join(', ')}</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="tasks-main">
        {!selected ? (
          <div className="tasks-empty">
            <div className="tasks-empty__icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <h3>Select an assessment to begin</h3>
            <p>Work through the prerequisite tasks, then take the formal test.</p>
            <div className="tasks-working-badge">
              <span className="badge badge--green">✓ Fully Working</span>
              <span>Bloodwork Values</span>
            </div>
          </div>
        ) : selected.id === 'bloodwork-values' ? (
          <BloodworkModule
            questId={selected.id}
            onTaskComplete={handleTaskComplete}
            taskProgress={questTaskProgress['bloodwork-values'] || {}}
            assessmentScore={assessmentScore}
            onAssessmentComplete={handleAssessmentComplete}
            onAssessmentReset={handleAssessmentReset}
          />
        ) : (
          <StubAssessment quest={selected} />
        )}
      </div>
    </div>
  );
}

function StubAssessment({ quest }) {
  return (
    <div className="stub-module fade-in">
      <div className="stub-module__tag">
        <span className={`tag tag--${quest.type}`}>{TYPE_LABEL[quest.type] || 'Assessment'}</span>
      </div>
      <h2>{quest.title}</h2>
      <p className="stub-module__desc">{quest.description}</p>
      <div className="stub-module__card card">
        <div className="stub-module__coming-soon">Coming Soon</div>
        <p>This assessment module will include:</p>
        <ul className="stub-module__list">
          <li>Preparatory reading and review tasks</li>
          <li>Practice exercises before the formal test</li>
          <li>{20}–25 multiple choice / fill-in-the-blank questions</li>
          <li>80% pass threshold with detailed results review</li>
          <li>Retake option after review period</li>
        </ul>
      </div>
    </div>
  );
}
