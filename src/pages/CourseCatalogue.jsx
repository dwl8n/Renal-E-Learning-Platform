import { useMemo, useState } from 'react';
import { useApp } from '../context';
import {
  COURSE_CATALOG,
  KNOWLEDGE_BAND_COPY,
  PRE_ASSESSMENT_QUESTIONS,
  getCourseDetail,
  getCourseModuleDetails,
  getCourseModulesForCourse,
  getCourseProgress,
  getKnowledgeBand,
  getModuleProgress,
  getModuleStatus,
} from '../courseData';
import './CourseCatalogue.css';

const STATUS_COPY = {
  assigned: { badge: 'Assigned', tone: 'teal' },
  open: { badge: 'Open', tone: 'green' },
  request: { badge: 'Request access', tone: 'amber' },
  restricted: { badge: 'Restricted', tone: 'grey' },
};

const MODULE_TYPE_LABEL = {
  task: 'Learning module',
  mixed: 'Practice module',
  assessment: 'Official assessment',
};

// Progress within a single task (quest) — used on task detail page
function getModuleTaskProgress(module, questTaskProgress, status) {
  if (status === 'complete') return 100;
  if (!module.taskCount) return 0;
  const progress = questTaskProgress[module.id] || {};
  const done = Object.values(progress).filter(Boolean).length;
  return Math.min(100, Math.round((done / module.taskCount) * 100));
}

function getModuleStatusLabel(status, progress, live) {
  if (!live) return 'Planned';
  if (status === 'locked') return 'Locked';
  if (status === 'complete') return 'Complete';
  if (status === 'in-progress') return `${progress}% complete`;
  return 'Ready';
}

export default function CourseCatalogue() {
  const { state, dispatch } = useApp();
  const { currentUser, selectedCourseId, activeCourseId, questStatus, questTaskProgress, preAssessmentResults, courseRequests, courseEnrollments } = state;
  const [answers, setAnswers] = useState({});
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  const selectedCourse = COURSE_CATALOG.find((course) => course.id === (activeCourseId || selectedCourseId)) || COURSE_CATALOG[0];
  const courseModules = useMemo(() => getCourseModulesForCourse(selectedCourse), [selectedCourse]);
  const selectedModuleDetails = useMemo(() => getCourseModuleDetails(selectedCourse), [selectedCourse]);
  const selectedCourseDetail = useMemo(() => getCourseDetail(selectedCourse), [selectedCourse]);
  const selectedModuleDetail = selectedModuleDetails.find((module) => module.id === selectedModuleId);
  const selectedModuleStatus = selectedModuleDetail
    ? questStatus[selectedModuleDetail.id] || (selectedModuleDetail.live ? 'locked' : 'preview')
    : null;
  const preAssessment = preAssessmentResults[selectedCourse.id];
  const requested = courseRequests.includes(selectedCourse.id);

  function enterCourse(course) {
    if (course.status === 'request') {
      dispatch({ type: 'REQUEST_COURSE_ACCESS', courseId: course.id });
    } else if (course.status === 'open') {
      dispatch({ type: 'ENROLL_COURSE', courseId: course.id });
    }
    dispatch({ type: 'ENTER_COURSE', courseId: course.id });
    setSelectedModuleId(null);
  }

  function savePreAssessment() {
    const score = Object.values(answers).reduce((total, value) => total + value, 0);
    dispatch({
      type: 'COMPLETE_PRE_ASSESSMENT',
      courseId: selectedCourse.id,
      score,
      band: getKnowledgeBand(score),
    });
  }

  function openTask(task) {
    dispatch({ type: 'NAV', page: task.type === 'assessment' ? 'assessments' : 'tasks' });
    dispatch({ type: 'SELECT_QUEST', questId: task.id });
    dispatch({ type: 'MARK_QUEST_SEEN', questId: task.id });
  }

  function openOfficialAssessment() {
    const allTasks = selectedModuleDetails;
    const assessment = allTasks.find((t) => t.type === 'assessment');
    if (assessment) openTask(assessment);
  }

  function openModuleDetail(module) {
    setSelectedModuleId(module.id);
  }

  // Inside a course: show course detail (or module detail)
  if (activeCourseId) {
    if (selectedModuleDetail) {
      return (
        <div className="page catalogue-page fade-in">
          <div className="catalogue-shell">
            <ModuleDetailPage
              course={selectedCourse}
              module={selectedModuleDetail}
              status={selectedModuleStatus}
              progress={getModuleTaskProgress(selectedModuleDetail, questTaskProgress, selectedModuleStatus)}
              onBack={() => setSelectedModuleId(null)}
              onStart={() => openTask(selectedModuleDetail)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="page catalogue-page fade-in">
        <div className="catalogue-shell">
          <CourseDetailPage
            course={selectedCourse}
            detail={selectedCourseDetail}
            courseModules={courseModules}
            modules={selectedModuleDetails}
            progress={getCourseProgress(selectedCourse, questStatus)}
            requested={requested}
            enrolled={courseEnrollments.includes(selectedCourse.id)}
            preAssessment={preAssessment}
            answers={answers}
            questStatus={questStatus}
            questTaskProgress={questTaskProgress}
            onAnswer={(questionId, points) => setAnswers((current) => ({ ...current, [questionId]: points }))}
            onSavePreAssessment={savePreAssessment}
            onOpenAssessment={openOfficialAssessment}
            onSelectModule={openModuleDetail}
            onPrimary={() => enterCourse(selectedCourse)}
          />
        </div>
      </div>
    );
  }

  // Outside a course: catalogue grid
  return (
    <div className="page catalogue-page fade-in">
      <div className="catalogue-shell">
        <header className="catalogue-header">
          <div>
            <p className="catalogue-kicker">Learner catalogue</p>
            <h1>Available training</h1>
            <p>{currentUser?.fullName} · {currentUser?.cohort || 'Policy access'}</p>
          </div>
          <div className="catalogue-header__status">
            <span>{COURSE_CATALOG.length} courses</span>
            <span>Signed in</span>
          </div>
        </header>

        <div className="catalogue-grid-layout">
          {COURSE_CATALOG.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              progress={getCourseProgress(course, questStatus)}
              requested={courseRequests.includes(course.id)}
              enrolled={courseEnrollments.includes(course.id)}
              onEnter={() => enterCourse(course)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, progress, requested, enrolled, onEnter }) {
  const status = STATUS_COPY[course.status] || STATUS_COPY.restricted;
  const badgeLabel = requested ? 'Requested' : enrolled && course.status === 'open' ? 'Enrolled' : status.badge;
  const actionLabel = requested ? 'Requested' : enrolled ? 'Continue' : course.actionLabel;
  const isPrimary = course.status !== 'restricted' && course.status !== 'request';

  return (
    <article className="course-card" onClick={onEnter} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onEnter()}>
      <div className="course-card__visual" style={{ '--accent': course.accent }}>
        {course.image ? (
          <img src={course.image} alt="" />
        ) : (
          <CourseGlyph area={course.clinicalArea} />
        )}
        <div className="course-card__shade" />
        <span className={`badge badge--${status.tone}`}>{badgeLabel}</span>
      </div>
      <div className="course-card__body">
        <div className="course-card__meta">
          <span>{course.clinicalArea}</span>
          <span>{course.modality}</span>
        </div>
        <h2>{course.title}</h2>
        <p>{course.description}</p>
        <div className="course-card__footer">
          <div className="course-card__progress" aria-label={`${progress}% complete`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <span
            className={isPrimary ? 'btn btn--primary btn--sm' : 'btn btn--outline btn--sm'}
            aria-hidden="true"
          >
            {actionLabel}
          </span>
        </div>
      </div>
    </article>
  );
}

function CoursePanelHeader({ course, requested, progress }) {
  const status = STATUS_COPY[course.status] || STATUS_COPY.restricted;

  return (
    <div className="course-panel__header">
      <span className={`badge badge--${status.tone}`}>{requested ? 'Access requested' : course.accessLabel}</span>
      <h2>{course.title}</h2>
      <p>{course.description}</p>
      <div className="course-panel__facts">
        <span>{course.type}</span>
        <span>{course.modality}</span>
        <span>{course.estimate}</span>
        <span>{progress}% complete</span>
      </div>
    </div>
  );
}

function CourseDetailPage({
  course,
  detail,
  courseModules,
  progress,
  requested,
  enrolled,
  preAssessment,
  answers,
  questStatus,
  questTaskProgress,
  onAnswer,
  onSavePreAssessment,
  onOpenAssessment,
  onPrimary,
}) {
  const status = STATUS_COPY[course.status] || STATUS_COPY.restricted;
  const accessLabel = requested ? 'Access requested' : course.status === 'open' && enrolled ? 'Enrolled' : course.accessLabel;

  return (
    <div className="course-detail">
      <div className="detail-topbar">
        <span className={`badge badge--${status.tone}`}>{accessLabel}</span>
        <span>{progress}% complete</span>
      </div>

      <section className="course-detail-hero" style={{ '--accent': course.accent }}>
        <div className="course-detail-hero__copy">
          <p className="catalogue-kicker">Course overview</p>
          <h1>{course.title}</h1>
          <p>{detail.overview}</p>
          <div className="course-detail-hero__facts">
            <span>{course.type}</span>
            <span>{course.modality}</span>
            <span>{course.estimate}</span>
          </div>
        </div>
        <div className="course-detail-hero__visual" aria-hidden="true">
          {course.image ? <img src={course.image} alt="" /> : <CourseGlyph area={course.clinicalArea} />}
        </div>
      </section>

      <section className="course-aspects" aria-label="Course delivery breakdown">
        <AspectCard title="Online" items={detail.onlineAspects} />
        <AspectCard title="In person" items={detail.inPersonAspects} />
        <div className="aspect-card aspect-card--rule">
          <span className="catalogue-kicker">Rule</span>
          <h2>Completion expectation</h2>
          <p>{detail.completionRule}</p>
        </div>
      </section>

      {course.id === 'renal-dialysis' && (
        <PreAssessmentPanel
          result={preAssessment}
          answers={answers}
          onAnswer={onAnswer}
          onSave={onSavePreAssessment}
          onOpenAssessment={onOpenAssessment}
        />
      )}

      <section className="course-modules" aria-label={`${course.title} modules`}>
        <div className="course-modules__head">
          <div>
            <p className="catalogue-kicker">Course content</p>
            <h2>Modules</h2>
          </div>
          <span>{courseModules.length} modules</span>
        </div>

        <div className="module-card-grid">
          {courseModules.map((mod) => {
            const modStatus = getModuleStatus(mod, questStatus);
            const percent = getModuleProgress(mod, questStatus, questTaskProgress);
            return (
              <CourseModuleCard
                key={mod.id}
                module={mod}
                status={modStatus}
                progress={percent}
                questStatus={questStatus}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

function CourseModuleCard({ module, status, progress, questStatus }) {
  const { dispatch } = useApp();
  const taskCount = (module.tasks || []).length;
  const completedTasks = (module.tasks || []).filter((id) => questStatus[id] === 'complete').length;

  function goToModule() {
    dispatch({ type: 'SELECT_MODULE', moduleId: module.id });
    dispatch({ type: 'NAV', page: 'tasks' });
  }

  return (
    <button
      className={`module-card ${status === 'locked' ? 'module-card--locked' : ''}`}
      onClick={goToModule}
      disabled={status === 'locked'}
    >
      <div className="module-card__top">
        <span className={`status-dot status-dot--${status === 'available' ? 'unlocked' : status}`} />
        <span>{status === 'complete' ? 'Complete' : status === 'locked' ? 'Locked' : status === 'available' ? 'Available' : 'In progress'}</span>
      </div>
      <h3>{module.title}</h3>
      <p>{module.description}</p>
      <div className="module-card__footer">
        <span>{completedTasks}/{taskCount} tasks</span>
        <div className="module-card__bar">
          <div className="module-card__bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </button>
  );
}

function AspectCard({ title, items }) {
  return (
    <div className="aspect-card">
      <span className="catalogue-kicker">{title}</span>
      <h2>{title === 'Online' ? 'Digital learning' : 'Live practice'}</h2>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function ModuleChoiceCard({ module, status, progress, isOfficialNext, onOpen }) {
  return (
    <button className={`module-card ${isOfficialNext ? 'module-card--priority' : ''}`} onClick={onOpen}>
      <div className="module-card__top">
        <span className={`status-dot status-dot--${status}`} />
        <span>{getModuleStatusLabel(status, progress, module.live)}</span>
      </div>
      <h3>{module.title}</h3>
      <p>{module.overview}</p>
      <div className="module-card__facts">
        <span>{MODULE_TYPE_LABEL[module.type] || 'Learning module'}</span>
        <span>{module.modality}</span>
        <span>{module.estimate}</span>
      </div>
      <div className="module-card__breakdown">
        <div>
          <strong>Online</strong>
          <span>{module.onlineAspects[0]}</span>
        </div>
        <div>
          <strong>In person</strong>
          <span>{module.inPersonAspects[0]}</span>
        </div>
      </div>
      {isOfficialNext && <span className="badge badge--green">Recommended next</span>}
    </button>
  );
}

function ModuleDetailPage({ course, module, status, progress, onBack, onStart }) {
  const isOfficialNext = module.type === 'assessment' && status !== 'locked';
  const canStart = module.live && status !== 'locked';

  return (
    <div className="module-detail">
      <div className="detail-topbar">
        <button className="btn btn--ghost btn--sm" onClick={onBack}>Back to course</button>
        <span>{course.title}</span>
      </div>

      <section className="module-detail-hero" style={{ '--accent': course.accent }}>
        <p className="catalogue-kicker">Module overview</p>
        <h1>{module.title} module</h1>
        <p>{module.overview}</p>
        <div className="module-detail-hero__facts">
          <span>{MODULE_TYPE_LABEL[module.type] || 'Learning module'}</span>
          <span>{module.modality}</span>
          <span>{module.estimate}</span>
          <span>{getModuleStatusLabel(status, progress, module.live)}</span>
        </div>
        {isOfficialNext && <span className="badge badge--green">Official assessment available</span>}
      </section>

      <div className="module-detail-layout">
        <section className="module-detail-card">
          <span className="catalogue-kicker">Description</span>
          <h2>What this module covers</h2>
          <p>{module.description}</p>

          <div className="module-detail-split">
            <DeliveryList title="Online component" items={module.onlineAspects} />
            <DeliveryList title="In-person component" items={module.inPersonAspects} />
          </div>
        </section>

        <aside className="module-detail-sidebar">
          <div className="module-detail-card">
            <span className="catalogue-kicker">Learner goal</span>
            <h2>Objectives</h2>
            <ul className="objective-list">
              {module.objectives.map((objective) => <li key={objective}>{objective}</li>)}
            </ul>
          </div>

          <div className="module-detail-card module-detail-card--action">
            <span className={`status-dot status-dot--${status}`} />
            <h2>{getModuleStatusLabel(status, progress, module.live)}</h2>
            <p>
              {module.live
                ? status === 'locked'
                  ? 'Complete prerequisite modules before launching this activity.'
                  : 'This module is available now and will open in the existing learner activity view.'
                : 'This planned module is visible for pathway design, but the live activity is not built yet.'}
            </p>
            <button className="btn btn--primary" onClick={onStart} disabled={!canStart}>
              {module.live ? 'Open module' : 'Planned module'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DeliveryList({ title, items }) {
  return (
    <div className="delivery-list">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
  );
}

function PreAssessmentPanel({ result, answers, onAnswer, onSave, onOpenAssessment }) {
  const answeredCount = Object.keys(answers).length;
  const bandCopy = result ? KNOWLEDGE_BAND_COPY[result.band] : null;

  if (result) {
    return (
      <section className={`pre-card pre-card--${result.band}`}>
        <div>
          <span className="pre-card__label">{bandCopy.label}</span>
          <h3>{bandCopy.title}</h3>
          <p>{bandCopy.body}</p>
        </div>
        {result.band === 'experienced' && (
          <button className="btn btn--primary btn--sm" onClick={onOpenAssessment}>
            Open official assessment
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="pre-card">
      <div className="pre-card__head">
        <div>
          <span className="pre-card__label">Pre-assessment</span>
          <h3>Place the learner path</h3>
        </div>
        <span>{answeredCount}/{PRE_ASSESSMENT_QUESTIONS.length}</span>
      </div>

      <div className="pre-questions">
        {PRE_ASSESSMENT_QUESTIONS.map((question) => (
          <fieldset key={question.id} className="pre-question">
            <legend>{question.question}</legend>
            <div className="pre-options">
              {question.options.map((option) => (
                <label key={option.label} className={answers[question.id] === option.points ? 'pre-option pre-option--selected' : 'pre-option'}>
                  <input
                    type="radio"
                    name={question.id}
                    checked={answers[question.id] === option.points}
                    onChange={() => onAnswer(question.id, option.points)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <button
        className="btn btn--primary btn--sm"
        onClick={onSave}
        disabled={answeredCount < PRE_ASSESSMENT_QUESTIONS.length}
      >
        Save recommendation
      </button>
    </section>
  );
}

function ModuleOverview({ modules, questStatus, questTaskProgress, preAssessment, onOpenModule }) {
  const experienced = preAssessment?.band === 'experienced';

  return (
    <section className="module-overview">
      <div className="module-overview__head">
        <div>
          <span className="catalogue-kicker">Course map</span>
          <h3>Renal Dialysis modules</h3>
        </div>
        <span>{modules.length} modules</span>
      </div>

      <div className="module-list">
        {modules.map((module) => {
          const status = questStatus[module.id] || 'locked';
          const percent = getModuleProgress(module, questTaskProgress, status);
          const isOfficialNext = experienced && module.type === 'assessment';

          return (
            <button
              key={module.id}
              className={`module-row ${isOfficialNext ? 'module-row--priority' : ''}`}
              onClick={() => onOpenModule(module)}
            >
              <div className="module-row__main">
                <span className={`status-dot status-dot--${status}`} />
                <div>
                  <h4>{module.title}</h4>
                  <p>{MODULE_TYPE_LABEL[module.type] || 'Learning module'} · {module.taskCount} tasks</p>
                </div>
              </div>
              <div className="module-row__side">
                {isOfficialNext && <span className="badge badge--green">Next action</span>}
                <span>{getModuleStatusLabel(status, percent, module.live)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function AccessPreview({ course, requested, enrolled, onPrimary }) {
  const isPolicy = course.status === 'open';
  const actionLabel = requested ? 'Requested' : enrolled && isPolicy ? 'Continue' : course.actionLabel;

  return (
    <section className="access-preview">
      <CourseGlyph area={course.clinicalArea} />
      <h3>{isPolicy ? 'Available after sign-in' : requested ? 'Request saved' : 'Access controlled'}</h3>
      <p>
        {isPolicy
          ? 'Policy learning is open to authenticated staff and can be enrolled from the learner catalogue.'
          : requested
            ? 'A trainer can review this request before the course becomes available.'
            : 'This course needs department, cohort, or trainer assignment before enrollment.'}
      </p>
      <button className="btn btn--primary btn--sm" onClick={onPrimary} disabled={requested}>
        {actionLabel}
      </button>
    </section>
  );
}

function CourseGlyph({ area }) {
  const normalized = area.toLowerCase();
  const label = normalized.includes('cardiac') ? 'ECG' : normalized.includes('neurology') ? 'CNS' : normalized.includes('policy') ? 'POL' : 'HD';

  return (
    <div className="course-glyph" aria-hidden="true">
      <span>{label}</span>
      <svg viewBox="0 0 120 86" fill="none">
        <path d="M8 58h20l9-30 15 48 12-38 8 20h40" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="96" cy="24" r="12" stroke="currentColor" strokeWidth="7" />
      </svg>
    </div>
  );
}
