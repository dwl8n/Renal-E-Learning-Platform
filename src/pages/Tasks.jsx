import { useEffect } from 'react';
import { useApp } from '../context';
import { QUESTS } from '../data';
import { COURSE_CATALOG, MODULES, getCourseModulesForCourse, getTasksForModule, getModuleStatus } from '../courseData';
import InfectionControlModule from '../modules/InfectionControlModule';
import FluidModule from '../modules/FluidModule';
import FluidRemovalModule from '../modules/FluidRemovalModule';
import BloodworkModule from '../modules/BloodworkModule';
import './Tasks.css';

const TASK_TYPE_ICON = {
  reading:    '📖',
  exercise:   '🧮',
  scenario:   '🩺',
  lab:        '🔬',
  assessment: '⭐',
};

const TYPE_LABEL = { task: 'Task', mixed: 'Practice' };

export default function Tasks() {
  const { state, dispatch } = useApp();
  const { activeCourseId, selectedCourseId, selectedModuleId, selectedQuestId, questStatus, questTaskProgress, recentlyUnlocked } = state;

  const courseId = activeCourseId || selectedCourseId;
  const course = COURSE_CATALOG.find((c) => c.id === courseId);
  const courseModules = course ? getCourseModulesForCourse(course) : [];

  const selectedModule = selectedModuleId ? MODULES.find((m) => m.id === selectedModuleId) : null;
  const selectedQuest = selectedQuestId ? QUESTS[selectedQuestId] : null;

  useEffect(() => {
    dispatch({ type: 'CLEAR_BADGE', tab: 'tasks' });
  }, []);

  // Auto-select first non-locked module if none selected
  useEffect(() => {
    if (!selectedModuleId && courseModules.length) {
      const first = courseModules.find((m) => getModuleStatus(m, questStatus) !== 'locked') || courseModules[0];
      if (first) dispatch({ type: 'SELECT_MODULE', moduleId: first.id });
    }
  }, [courseModules.length, selectedModuleId]);

  function openModule(module) {
    dispatch({ type: 'SELECT_MODULE', moduleId: module.id });
  }

  function openTask(questId) {
    dispatch({ type: 'MARK_QUEST_SEEN', questId });
    dispatch({ type: 'SELECT_QUEST', questId });
  }

  function handleTaskComplete(questId, taskKey) {
    dispatch({ type: 'COMPLETE_TASK', questId, taskKey, questData: QUESTS });
  }

  function handleAssessmentComplete(questId, score, passed) {
    dispatch({ type: 'COMPLETE_ASSESSMENT', questId, score, passed, questData: QUESTS });
  }

  function handleAssessmentReset() {
    dispatch({ type: 'RESET_ASSESSMENT' });
  }

  function backToModule() {
    dispatch({ type: 'SELECT_QUEST', questId: null });
  }

  return (
    <div className="tasks-page fade-in">
      {/* Sidebar: module list */}
      <div className="tasks-sidebar">
        <div className="tasks-sidebar__header">
          <h2>Modules</h2>
        </div>
        <div className="tasks-module-list">
          {courseModules.map((mod) => {
            const modStatus = getModuleStatus(mod, questStatus);
            const tasks = getTasksForModule(mod);
            const completedTasks = tasks.filter((t) => questStatus[t.id] === 'complete').length;
            const isLocked = modStatus === 'locked';
            const isActive = selectedModuleId === mod.id;

            return (
              <button
                key={mod.id}
                className={`tasks-module-item ${isActive ? 'tasks-module-item--active' : ''} ${isLocked ? 'tasks-module-item--locked' : ''}`}
                onClick={() => !isLocked && openModule(mod)}
                disabled={isLocked}
              >
                <div className="tasks-module-item__row">
                  <span className={`status-dot status-dot--${modStatus === 'available' ? 'unlocked' : modStatus}`} />
                  <span className="tasks-module-item__title">{mod.title}</span>
                </div>
                {!isLocked && tasks.length > 0 && (
                  <div className="tasks-module-item__progress">
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${Math.round((completedTasks / tasks.length) * 100)}%` }} />
                    </div>
                    <span>{completedTasks}/{tasks.length}</span>
                  </div>
                )}
                {isLocked && <div className="tasks-module-item__locked">Locked</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content area */}
      <div className="tasks-main">
        {selectedQuest ? (
          <TaskContent
            quest={selectedQuest}
            questStatus={questStatus}
            questTaskProgress={questTaskProgress}
            assessmentScore={state.assessmentScore}
            onTaskComplete={handleTaskComplete}
            onAssessmentComplete={handleAssessmentComplete}
            onAssessmentReset={handleAssessmentReset}
            onBack={backToModule}
          />
        ) : selectedModule ? (
          <ModuleHome
            module={selectedModule}
            questStatus={questStatus}
            questTaskProgress={questTaskProgress}
            recentlyUnlocked={recentlyUnlocked}
            onOpenTask={openTask}
          />
        ) : (
          <div className="tasks-empty">
            <h3>Select a module</h3>
            <p>Choose a module from the sidebar to see its tasks.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleHome({ module, questStatus, questTaskProgress, recentlyUnlocked, onOpenTask }) {
  const allTasks = getTasksForModule(module);
  const learningTasks = allTasks.filter((t) => t.type === 'task' || t.type === 'mixed');
  const assessmentTasks = allTasks.filter((t) => t.type === 'assessment');
  const completedTasks = allTasks.filter((t) => questStatus[t.id] === 'complete').length;
  const progressPct = allTasks.length ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  const firstAvailable = allTasks.find((t) => {
    const s = questStatus[t.id];
    return s === 'unlocked' || s === 'in-progress';
  });

  return (
    <div className="module-home fade-in">
      <div className="module-home__header">
        <div className="module-home__meta">
          <p className="catalogue-kicker">Module</p>
          <h2>{module.title}</h2>
          <p className="module-home__desc">{module.description}</p>
        </div>
        <div className="module-home__progress-ring">
          <span className="module-home__progress-num">{progressPct}%</span>
          <span className="module-home__progress-label">{completedTasks}/{allTasks.length} tasks</span>
        </div>
      </div>

      <div className="module-home__task-list">
        <h3>Tasks</h3>
        {learningTasks.map((quest) => <TaskRow key={quest.id} quest={quest} questStatus={questStatus} questTaskProgress={questTaskProgress} recentlyUnlocked={recentlyUnlocked} onOpen={onOpenTask} />)}
      </div>

      {assessmentTasks.length > 0 && (
        <div className="module-home__task-list module-home__assessment-list">
          <h3>Assessments</h3>
          {assessmentTasks.map((quest) => <TaskRow key={quest.id} quest={quest} questStatus={questStatus} questTaskProgress={questTaskProgress} recentlyUnlocked={recentlyUnlocked} onOpen={onOpenTask} isAssessment />)}
        </div>
      )}

      {firstAvailable && (
        <div className="module-home__cta">
          <button className="btn btn--primary" onClick={() => onOpenTask(firstAvailable.id)}>
            {completedTasks > 0 ? 'Continue module' : 'Start module'}
          </button>
        </div>
      )}
    </div>
  );
}

function TaskRow({ quest, questStatus, questTaskProgress, recentlyUnlocked, onOpen, isAssessment = false }) {
  const status = questStatus[quest.id] || 'locked';
  const isLocked = status === 'locked';
  const isNew = recentlyUnlocked.includes(quest.id);
  const progress = questTaskProgress[quest.id] || {};
  const doneTasks = Object.values(progress).filter(Boolean).length;
  const taskDefs = quest.tasks || [];

  return (
    <button
      className={`module-task-row ${isLocked ? 'module-task-row--locked' : ''} ${status === 'complete' ? 'module-task-row--complete' : ''} ${isAssessment ? 'module-task-row--assessment' : ''}`}
      onClick={() => !isLocked && onOpen(quest.id)}
      disabled={isLocked}
    >
      <span className={`status-dot status-dot--${status === 'complete' ? 'complete' : isLocked ? 'locked' : 'unlocked'}`} />
      <div className="module-task-row__body">
        <div className="module-task-row__title">
          <span>{quest.title}</span>
          {isNew && <span className="badge badge--teal" style={{ fontSize: 10 }}>New</span>}
          {status === 'complete' && <span className="badge badge--green" style={{ fontSize: 10 }}>Done</span>}
        </div>
        {taskDefs.length > 0 && (
          <div className="module-task-row__subtasks">
            {taskDefs.map((t) => {
              const done = progress[t.key];
              return (
                <span key={t.key} className={`subtask-chip ${done ? 'subtask-chip--done' : ''}`}>
                  {TASK_TYPE_ICON[t.type] || '·'} {t.label}
                </span>
              );
            })}
          </div>
        )}
        {!taskDefs.length && !isLocked && (
          <div className="module-task-row__count">
            {doneTasks}/{quest.taskCount} tasks
          </div>
        )}
      </div>
      {isLocked && (
        <div className="module-task-row__lock">
          <LockIcon />
          <span>{quest.prereqs.map((p) => QUESTS[p]?.title).filter(Boolean).join(', ')}</span>
        </div>
      )}
      {!isLocked && <ChevronIcon />}
    </button>
  );
}

function TaskContent({ quest, questStatus, questTaskProgress, assessmentScore, onTaskComplete, onAssessmentComplete, onAssessmentReset, onBack }) {
  const status = questStatus[quest.id];

  function renderContent() {
    if (quest.id === 'infection-control') {
      return (
        <InfectionControlModule
          questId={quest.id}
          onTaskComplete={onTaskComplete}
          taskProgress={questTaskProgress['infection-control'] || {}}
        />
      );
    }
    if (quest.id === 'fluid-volume') {
      return (
        <FluidModule
          questId={quest.id}
          onTaskComplete={onTaskComplete}
          taskProgress={questTaskProgress['fluid-volume'] || {}}
        />
      );
    }
    if (quest.id === 'intradialytic-fluid') {
      return (
        <FluidRemovalModule
          questId={quest.id}
          onTaskComplete={onTaskComplete}
          taskProgress={questTaskProgress['intradialytic-fluid'] || {}}
        />
      );
    }
    if (quest.id === 'bloodwork-values') {
      return (
        <BloodworkModule
          questId={quest.id}
          onTaskComplete={onTaskComplete}
          taskProgress={questTaskProgress['bloodwork-values'] || {}}
          assessmentScore={assessmentScore}
          onAssessmentComplete={(score, passed) => onAssessmentComplete(quest.id, score, passed)}
          onAssessmentReset={onAssessmentReset}
        />
      );
    }
    return <StubTask quest={quest} status={status} />;
  }

  return (
    <div className="task-content-wrap">
      <div className="task-content-topbar">
        <button className="btn btn--ghost btn--sm" onClick={onBack}>
          ← Back to module
        </button>
        <span className="task-content-topbar__title">{quest.title}</span>
      </div>
      {renderContent()}
    </div>
  );
}

function StubTask({ quest }) {
  return (
    <div className="stub-module fade-in">
      <div className="stub-module__tag">
        <span className={`tag tag--${quest.type}`}>{TYPE_LABEL[quest.type] || 'Task'}</span>
      </div>
      <h2>{quest.title}</h2>
      <p className="stub-module__desc">{quest.description}</p>
      <div className="stub-module__card card">
        <div className="stub-module__coming-soon">Coming Soon</div>
        <p>This task is planned for a future release.</p>
        <ul className="stub-module__list">
          <li>Reading material and reference slides</li>
          <li>Interactive practice exercises</li>
          <li>Case studies with decision-branching</li>
          {quest.type === 'mixed' && <li>Video demonstrations</li>}
        </ul>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}
