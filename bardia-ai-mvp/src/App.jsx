import { useEffect, useMemo, useState } from 'react';
import {
  COHORT_MASTERY,
  PIPELINE_STEPS,
  SAMPLE_DOCUMENT,
  SAMPLE_FLASHCARDS,
  SAMPLE_FLOW,
  SAMPLE_QUIZ,
  STUDENTS,
  buildSampleResult,
} from './sampleData';
import { analyzeDocument, checkLocalEngine, wait } from './localEngine';
import LearnerExperience from './PotassiumLearner';

const TRAINER_NAV = [
  ['overview', 'Overview', 'grid'],
  ['builder', 'AI Module Builder', 'sparkles'],
  ['students', 'Students', 'users'],
  ['analytics', 'Analytics', 'chart'],
  ['architecture', 'Workflow', 'workflow'],
];

export default function App() {
  const [session, setSession] = useState(null);
  const [publishedModule, setPublishedModule] = useState(buildSampleResult());
  const [learnerOrigin, setLearnerOrigin] = useState(null);

  if (!session) {
    return <LoginScreen onLogin={setSession} />;
  }

  if (session.role === 'learner') {
    return (
      <LearnerExperience
        module={publishedModule}
        learner={session}
        exitLabel={learnerOrigin ? 'Return to trainer' : 'Back to demo login'}
        onExit={() => {
          if (learnerOrigin) {
            setSession(learnerOrigin);
            setLearnerOrigin(null);
          } else {
            setSession(null);
          }
        }}
      />
    );
  }

  return (
    <TrainerWorkspace
      session={session}
      onPublish={setPublishedModule}
      onLogout={() => setSession(null)}
      onViewAsLearner={() => {
        setLearnerOrigin(session);
        setSession({
          role: 'learner',
          name: 'Emma Thompson',
          initials: 'ET',
          subtitle: 'Learner preview',
        });
      }}
    />
  );
}

function LoginScreen({ onLogin }) {
  return (
    <div className="login-shell">
      <div className="login-orb login-orb--one" />
      <div className="login-orb login-orb--two" />
      <div className="login-brand">
        <BrandMark large />
        <span>LearningForge AI</span>
      </div>
      <div className="login-grid">
        <section className="login-story">
          <div className="eyebrow eyebrow--light">Agentic e-learning MVP</div>
          <h1>Turn trusted documents into interactive learning.</h1>
          <p>
            A trainer-controlled workflow that analyzes source material, proposes a course,
            generates learning activities, and identifies where learners need support.
          </p>
          <div className="login-proof">
            <ProofItem icon="file" label="PDF · PPTX · DOCX · TXT" />
            <ProofItem icon="shield" label="Source-grounded & reviewable" />
            <ProofItem icon="cpu" label="No paid AI API required" />
          </div>
          <div className="login-pipeline">
            {['Upload', 'Analyze', 'Design', 'Generate', 'Review', 'Publish'].map((label, index) => (
              <div className="login-pipeline__item" key={label}>
                <span>{index + 1}</span>
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="login-card">
          <div className="login-card__top">
            <span className="status-dot status-dot--green" />
            Interactive prototype
          </div>
          <h2>Choose a demo view</h2>
          <p>No password is needed for this contribution build.</p>

          <button
            className="role-card role-card--primary"
            onClick={() =>
              onLogin({
                role: 'trainer',
                name: 'Maria Santos',
                initials: 'MS',
                subtitle: 'Clinical Educator',
              })
            }
          >
            <span className="role-card__icon"><Icon name="briefcase" /></span>
            <span>
              <strong>Trainer Studio</strong>
              <small>Generate, review, publish and monitor</small>
            </span>
            <Icon name="arrow" />
          </button>

          <button
            className="role-card"
            onClick={() =>
              onLogin({
                role: 'learner',
                name: 'Emma Thompson',
                initials: 'ET',
                subtitle: 'Orientation learner',
              })
            }
          >
            <span className="role-card__icon"><Icon name="book" /></span>
            <span>
              <strong>Learner Experience</strong>
              <small>Complete the generated sample module</small>
            </span>
            <Icon name="arrow" />
          </button>

          <div className="login-disclosure">
            <Icon name="info" />
            <span>
              The bundled sample is precomputed for a reliable presentation. Custom files can
              be processed live by the included local Python engine.
            </span>
          </div>
        </section>
      </div>
      <div className="login-credit">MVP contribution by Bardia Parand · June 2026</div>
    </div>
  );
}

function ProofItem({ icon, label }) {
  return (
    <div>
      <Icon name={icon} />
      <span>{label}</span>
    </div>
  );
}

function TrainerWorkspace({
  session,
  onPublish,
  onLogout,
  onViewAsLearner,
}) {
  const [view, setView] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reviewCount, setReviewCount] = useState(8);

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <div className="side-nav__brand">
          <BrandMark />
          <div>
            <strong>LearningForge</strong>
            <span>Trainer Studio</span>
          </div>
        </div>

        <nav className="side-nav__links">
          <div className="side-nav__label">Workspace</div>
          {TRAINER_NAV.map(([id, label, icon]) => (
            <button
              key={id}
              className={view === id ? 'active' : ''}
              onClick={() => setView(id)}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {id === 'builder' && reviewCount > 0 && <em>{reviewCount}</em>}
            </button>
          ))}
        </nav>

        <div className="side-nav__project">
          <span className="side-nav__label">Current program</span>
          <div className="project-chip">
            <span>R</span>
            <div>
              <strong>Renal Orientation</strong>
              <small>Potassium flagship · Draft</small>
            </div>
          </div>
        </div>

        <div className="side-nav__footer">
          <button className="profile-chip" onClick={onLogout}>
            <span>{session.initials}</span>
            <div>
              <strong>{session.name}</strong>
              <small>{session.subtitle}</small>
            </div>
            <Icon name="logout" />
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Renal Orientation / <strong>{navTitle(view)}</strong></div>
          </div>
          <div className="topbar__actions">
            <span className="engine-pill"><span /> Offline-capable MVP</span>
            <button className="btn btn--ghost" onClick={onViewAsLearner}>
              <Icon name="eye" /> View as learner
            </button>
            <button className="icon-btn" aria-label="Notifications">
              <Icon name="bell" /><span className="notification-dot" />
            </button>
          </div>
        </header>

        <div className="workspace__body">
          {view === 'overview' && (
            <OverviewPage
              onOpenBuilder={() => setView('builder')}
              onOpenStudents={() => setView('students')}
              onSelectStudent={(student) => {
                setSelectedStudent(student);
                setView('students');
              }}
            />
          )}
          {view === 'builder' && (
            <BuilderPage
              onPublish={(result) => {
                onPublish(result);
                setReviewCount(0);
              }}
              onViewAsLearner={onViewAsLearner}
            />
          )}
          {view === 'students' && (
            <StudentsPage selectedStudent={selectedStudent} onSelectStudent={setSelectedStudent} />
          )}
          {view === 'analytics' && <AnalyticsPage onSelectStudent={setSelectedStudent} onGoStudents={() => setView('students')} />}
          {view === 'architecture' && <ArchitecturePage />}
        </div>
      </main>
    </div>
  );
}

function navTitle(view) {
  return TRAINER_NAV.find(([id]) => id === view)?.[1] || 'Overview';
}

function OverviewPage({ onOpenBuilder, onOpenStudents, onSelectStudent }) {
  const atRisk = STUDENTS.filter((student) => ['At risk', 'Inactive'].includes(student.status));
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="Trainer dashboard"
        title="Good morning, Maria"
        description="The potassium flagship module is ready for review, learner testing and targeted remediation."
        action={
          <button className="btn btn--primary" onClick={onOpenBuilder}>
            <Icon name="sparkles" /> Build a module with AI
          </button>
        }
      />

      <div className="stat-grid">
        <MetricCard icon="users" color="teal" value="24" label="Active learners" change="+3 this month" />
        <MetricCard icon="check" color="green" value="68%" label="Average completion" change="+8% from May" />
        <MetricCard icon="target" color="blue" value="82%" label="Average assessment" change="+4% after review" />
        <MetricCard icon="alert" color="amber" value="4" label="Need intervention" change="2 high priority" />
      </div>

      <div className="overview-grid">
        <section className="panel overview-hero">
          <div className="overview-hero__copy">
            <span className="feature-label"><Icon name="sparkles" /> AI CONTENT STUDIO</span>
            <h2>One source package. One complete adaptive module.</h2>
            <p>
              The potassium showcase combines four files, real source visuals, clinical
              decisions, diagnostic questions and weakness-specific follow-up.
            </p>
            <button className="btn btn--light" onClick={onOpenBuilder}>
              Open Module Builder <Icon name="arrow" />
            </button>
          </div>
          <div className="mini-pipeline">
            {PIPELINE_STEPS.slice(0, 5).map((step, index) => (
              <div key={step.id}>
                <span>{index + 1}</span>
                <strong>{step.title}</strong>
                <small>{step.subtitle}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <PanelHeader
            title="Content awaiting review"
            subtitle="Generated drafts never publish automatically"
            action={<button className="text-btn" onClick={onOpenBuilder}>Review all</button>}
          />
          <div className="review-list">
            <ReviewRow type="Quiz" title="Potassium Protocol" count="8 diagnostic questions" quality={99} />
            <ReviewRow type="Flowchart" title="Temporary-to-ongoing change" count="4 steps" quality={99} />
            <ReviewRow type="Flashcards" title="Protocol decision points" count="8 cards" quality={97} />
          </div>
        </section>
      </div>

      <div className="overview-grid overview-grid--bottom">
        <section className="panel">
          <PanelHeader
            title="Learners needing attention"
            subtitle="Based on inactivity, repeated attempts and topic mastery"
            action={<button className="text-btn" onClick={onOpenStudents}>View students</button>}
          />
          <div className="attention-list">
            {atRisk.map((student) => (
              <button key={student.id} onClick={() => onSelectStudent(student)}>
                <Avatar student={student} />
                <div className="attention-list__name">
                  <strong>{student.name}</strong>
                  <span>{student.weaknesses.slice(0, 2).join(' · ')}</span>
                </div>
                <StatusBadge value={student.status} />
                <Icon name="chevron" />
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <PanelHeader title="Program progress" subtitle="Current cohort completion by learning area" />
          <div className="progress-list">
            <ProgressRow label="Foundations & safety" score={91} />
            <ProgressRow label="Fluid management" score={73} />
            <ProgressRow label="Bloodwork values" score={68} />
            <ProgressRow label="Potassium protocol" score={54} />
          </div>
        </section>
      </div>
    </div>
  );
}

function BuilderPage({ onPublish, onViewAsLearner }) {
  const [file, setFile] = useState(null);
  const [useSample, setUseSample] = useState(true);
  const [status, setStatus] = useState('ready');
  const [stepIndex, setStepIndex] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeOutput, setActiveOutput] = useState('analysis');
  const [engineOnline, setEngineOnline] = useState(false);
  const [approved, setApproved] = useState({});
  const [published, setPublished] = useState(false);

  useEffect(() => {
    checkLocalEngine().then(setEngineOnline);
  }, []);

  const run = async () => {
    setError('');
    setResult(null);
    setStatus('running');
    setPublished(false);
    for (let index = 0; index < PIPELINE_STEPS.length; index += 1) {
      setStepIndex(index);
      await wait(index === PIPELINE_STEPS.length - 1 ? 250 : 430);
    }
    try {
      const generated = await analyzeDocument({ file, useSample });
      setResult(generated);
      const initialApprovals = {};
      generated.flashcards?.forEach((item) => { initialApprovals[item.id] = true; });
      generated.quiz?.forEach((item) => { initialApprovals[item.id] = true; });
      if (generated.scenario) initialApprovals[generated.scenario.id] = true;
      setApproved(initialApprovals);
      setStatus('complete');
      setActiveOutput('analysis');
    } catch (analysisError) {
      setError(analysisError.message);
      setStatus('error');
    }
  };

  const approvedCount = Object.values(approved).filter(Boolean).length;

  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="AI content studio"
        title="Build a learning module"
        description="Generate a reviewable first draft from approved source material. Nothing is published without trainer approval."
        action={
          <span className={`connection-badge ${engineOnline ? 'connection-badge--online' : ''}`}>
            <span />
            {engineOnline ? 'Local analyzer connected' : 'Cached sample mode'}
          </span>
        }
      />

      <div className="builder-layout">
        <section className="panel source-panel">
          <div className="step-heading">
            <span>1</span>
            <div>
              <h3>Select source material</h3>
              <p>Use the bundled sample or upload a document for local analysis.</p>
            </div>
          </div>

          <button
            className={`sample-source ${useSample ? 'sample-source--selected' : ''}`}
            onClick={() => {
              setUseSample(true);
              setFile(null);
            }}
          >
            <span className="file-icon file-icon--pdf"><Icon name="file" /></span>
            <div>
              <strong>{SAMPLE_DOCUMENT.filename}</strong>
              <small>Included showcase · 4 files · 42 source units · protocol, cases, chart and nutrition</small>
            </div>
            <span className="radio-check">{useSample ? '✓' : ''}</span>
          </button>

          <label className={`drop-zone ${!useSample && file ? 'drop-zone--selected' : ''}`}>
            <input
              type="file"
              accept=".pdf,.pptx,.docx,.txt,.md"
              onChange={(event) => {
                const next = event.target.files?.[0];
                if (next) {
                  setFile(next);
                  setUseSample(false);
                }
              }}
            />
            <Icon name="upload" />
            <strong>{file && !useSample ? file.name : 'Upload a different document'}</strong>
            <span>PDF, PowerPoint, Word or text · 25 MB maximum</span>
            <small>
              {engineOnline
                ? 'The file will be processed by the local Python engine.'
                : 'Start the included backend for live binary-document extraction.'}
            </small>
          </label>

          <div className="privacy-note">
            <Icon name="shield" />
            <div>
              <strong>No paid API or external upload</strong>
              <span>The local engine uses deterministic extraction and generation rules.</span>
            </div>
          </div>

          <button
            className="btn btn--primary btn--wide"
            disabled={status === 'running' || (!useSample && !file)}
            onClick={run}
          >
            {status === 'running' ? <><Spinner /> Building module…</> : <><Icon name="sparkles" /> Analyze and generate</>}
          </button>
          {error && <div className="error-box"><Icon name="alert" /> {error}</div>}
        </section>

        <section className="panel pipeline-panel">
          <div className="step-heading">
            <span>2</span>
            <div>
              <h3>Agent workflow</h3>
              <p>Each stage has a narrow responsibility and structured output.</p>
            </div>
          </div>

          <div className="agent-flow">
            {PIPELINE_STEPS.map((step, index) => {
              const stage =
                status === 'complete' || index < stepIndex
                  ? 'done'
                  : status === 'running' && index === stepIndex
                    ? 'active'
                    : 'waiting';
              return (
                <div className={`agent-node agent-node--${stage}`} key={step.id}>
                  <div className="agent-node__rail">
                    <span>{stage === 'done' ? '✓' : index + 1}</span>
                    {index < PIPELINE_STEPS.length - 1 && <i />}
                  </div>
                  <div className="agent-node__content">
                    <div>
                      <strong>{step.title}</strong>
                      <em>{step.subtitle}</em>
                    </div>
                    <p>{step.detail}</p>
                  </div>
                  <div className="agent-node__state">
                    {stage === 'active' ? <Spinner /> : stage === 'done' ? 'Complete' : 'Waiting'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pipeline-contract">
            <span>Structured handoff</span>
            <code>source.json → analysis.json → module.json → activities.json</code>
          </div>
        </section>
      </div>

      {result && (
        <section className="panel output-workspace">
          <div className="output-workspace__header">
            <div className="step-heading">
              <span>3</span>
              <div>
                <h3>Review generated module</h3>
                <p>{result.analysis.title}</p>
              </div>
            </div>
            <div className="output-actions">
              <span className="quality-pill"><Icon name="shield" /> {result.source.qualityScore}% source quality</span>
              <button className="btn btn--ghost" onClick={onViewAsLearner}><Icon name="eye" /> Preview learner view</button>
              <button
                className="btn btn--primary"
                onClick={() => {
                  onPublish(result);
                  setPublished(true);
                }}
              >
                <Icon name="publish" /> Publish approved
              </button>
            </div>
          </div>

          {published && (
            <div className="success-banner">
              <Icon name="check" />
              <div>
                <strong>Module published to the learner preview</strong>
                <span>{approvedCount} approved learning objects are included.</span>
              </div>
              <button onClick={onViewAsLearner}>Open learner view <Icon name="arrow" /></button>
            </div>
          )}

          <div className="output-tabs">
            {[
              ['analysis', 'Analysis'],
              ['plan', 'Module plan'],
              ['activities', 'Activities', result.flashcards.length + result.quiz.length + (result.scenario ? 1 : 0)],
              ['visuals', 'Visual formats', result.analysis.visualOpportunities.length],
              ['quality', 'Quality & evidence'],
            ].map(([id, label, count]) => (
              <button
                key={id}
                className={activeOutput === id ? 'active' : ''}
                onClick={() => setActiveOutput(id)}
              >
                {label}
                {count !== undefined && <span>{count}</span>}
              </button>
            ))}
          </div>

          <div className="output-content">
            {activeOutput === 'analysis' && <AnalysisOutput result={result} />}
            {activeOutput === 'plan' && <PlanOutput result={result} />}
            {activeOutput === 'activities' && (
              <ActivitiesOutput
                result={result}
                approved={approved}
                onToggle={(id) => setApproved((currentApproved) => ({
                  ...currentApproved,
                  [id]: !currentApproved[id],
                }))}
              />
            )}
            {activeOutput === 'visuals' && <VisualOutput result={result} />}
            {activeOutput === 'quality' && <QualityOutput result={result} approvedCount={approvedCount} />}
          </div>
        </section>
      )}

      {!result && status !== 'running' && (
        <div className="builder-empty">
          <Icon name="sparkles" />
          <strong>Your generated learning package will appear here.</strong>
          <span>Start with the sample policy to see the complete trainer workflow.</span>
        </div>
      )}
    </div>
  );
}

function AnalysisOutput({ result }) {
  const { analysis, source } = result;
  return (
    <div className="analysis-grid">
      <div className="analysis-main">
        <div className="generated-summary">
          <div className="generated-summary__meta">
            <span>{analysis.audience}</span>
            <span>{analysis.difficulty}</span>
            <span>{analysis.estimatedMinutes} minutes</span>
          </div>
          <h2>{analysis.title}</h2>
          <p>{analysis.description}</p>
          <SourceTag value={`${source.filename} · ${source.pages} source units`} />
          {source.files?.length > 0 && (
            <div className="source-package-list">
              {source.files.map((item) => (
                <div key={item.name}>
                  <Icon name="file" />
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.units} · {item.purpose}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <section>
          <Subheading title="Generated learning objectives" count={analysis.objectives.length} />
          <div className="objective-list">
            {analysis.objectives.map((objective, index) => (
              <div key={objective.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{objective.text}</p>
                <SourceTag value={objective.source} />
                <button className="mini-icon-btn" aria-label="Edit objective"><Icon name="edit" /></button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <aside className="analysis-side">
        <div className="insight-card">
          <Subheading title="Concept emphasis" />
          {analysis.topics.map((topic) => (
            <div className="concept-row" key={topic.name}>
              <span>{topic.name}</span>
              <div><i style={{ width: `${topic.weight}%` }} /></div>
              <strong>{topic.weight}</strong>
            </div>
          ))}
        </div>

        <div className="insight-card">
          <Subheading title="Document quality" />
          <div className="quality-score">
            <RingScore value={analysis.documentQuality.averageScore} />
            <div>
              <strong>{analysis.documentQuality.usableChunks} usable chunks</strong>
              <span>{analysis.documentQuality.skippedChunks} skipped before generation</span>
            </div>
          </div>
          <div className="skip-reasons">
            {analysis.documentQuality.skippedReasons.map((reason) => (
              <span key={reason}><Icon name="minus" /> {reason}</span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function PlanOutput({ result }) {
  return (
    <div className="plan-layout">
      <div className="module-plan">
        {result.analysis.moduleSections.map((section, index) => (
          <div className="module-section" key={section.id}>
            <div className="module-section__number">{index + 1}</div>
            <div className="module-section__body">
              <div>
                <span className="content-type">{section.type}</span>
                <span className="duration"><Icon name="clock" /> {section.minutes} min</span>
              </div>
              <h3>{section.title}</h3>
              <p>{section.summary}</p>
              <SourceTag value={section.source} />
            </div>
            <div className="module-section__actions">
              <button className="mini-icon-btn"><Icon name="edit" /></button>
              <button className="drag-handle"><Icon name="drag" /></button>
            </div>
          </div>
        ))}
      </div>
      <aside className="plan-summary">
        <h3>Module estimate</h3>
        <div><span>Sections</span><strong>{result.analysis.moduleSections.length}</strong></div>
        <div><span>Learning time</span><strong>{result.analysis.estimatedMinutes} min</strong></div>
        <div><span>Knowledge checks</span><strong>{result.quiz.length + (result.scenario ? 1 : 0)}</strong></div>
        <div><span>Source coverage</span><strong>87%</strong></div>
        <hr />
        <p><Icon name="info" /> Trainers can reorder, rename or remove any generated section before publishing.</p>
      </aside>
    </div>
  );
}

function ActivitiesOutput({ result, approved, onToggle }) {
  const [activityType, setActivityType] = useState('quiz');
  return (
    <div>
      <div className="activity-switcher">
        {[
          ['quiz', 'Quiz questions', result.quiz.length],
          ['flashcards', 'Flashcards', result.flashcards.length],
          ['scenario', 'Scenario', result.scenario ? 1 : 0],
        ].map(([id, label, count]) => (
          <button key={id} onClick={() => setActivityType(id)} className={activityType === id ? 'active' : ''}>
            {label}<span>{count}</span>
          </button>
        ))}
      </div>

      {activityType === 'quiz' && (
        <div className="draft-list">
          {result.quiz.map((question, index) => (
            <DraftCard
              key={question.id}
              number={index + 1}
              type="Multiple choice"
              title={question.question}
              source={question.source}
              quality={question.quality}
              approved={approved[question.id]}
              onToggle={() => onToggle(question.id)}
            >
              <div className="draft-options">
                {question.options.map((option, optionIndex) => (
                  <div className={optionIndex === question.correct ? 'correct' : ''} key={option}>
                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                    <p>{option}</p>
                    {optionIndex === question.correct && <Icon name="check" />}
                  </div>
                ))}
              </div>
              <div className="explanation-box"><strong>Explanation</strong>{question.explanation}</div>
            </DraftCard>
          ))}
        </div>
      )}

      {activityType === 'flashcards' && (
        <div className="draft-card-grid">
          {result.flashcards.map((card, index) => (
            <DraftCard
              key={card.id}
              number={index + 1}
              type="Flashcard"
              title={card.front}
              source={card.source}
              quality={card.quality}
              approved={approved[card.id]}
              onToggle={() => onToggle(card.id)}
              compact
            >
              <div className="flashcard-answer">{card.back}</div>
            </DraftCard>
          ))}
        </div>
      )}

      {activityType === 'scenario' && result.scenario && (
        <DraftCard
          number={1}
          type="Scenario"
          title={result.scenario.title}
          source={result.scenario.source}
          quality={result.scenario.quality}
          approved={approved[result.scenario.id]}
          onToggle={() => onToggle(result.scenario.id)}
        >
          <div className="scenario-prompt">{result.scenario.prompt}</div>
          <div className="draft-options">
            {result.scenario.options.map((option, index) => (
              <div className={index === result.scenario.correct ? 'correct' : ''} key={option}>
                <span>{String.fromCharCode(65 + index)}</span><p>{option}</p>
                {index === result.scenario.correct && <Icon name="check" />}
              </div>
            ))}
          </div>
        </DraftCard>
      )}
    </div>
  );
}

function DraftCard({ number, type, title, source, quality, approved, onToggle, children, compact }) {
  return (
    <article className={`draft-card ${compact ? 'draft-card--compact' : ''} ${!approved ? 'draft-card--rejected' : ''}`}>
      <header>
        <span className="draft-card__number">{String(number).padStart(2, '0')}</span>
        <div>
          <span className="content-type">{type}</span>
          <span className={`quality-mini ${quality < 70 ? 'quality-mini--low' : ''}`}>{quality}% quality</span>
        </div>
        <div className="draft-card__tools">
          <button className="mini-icon-btn" aria-label="Edit"><Icon name="edit" /></button>
          <label className="approval-toggle">
            <input type="checkbox" checked={Boolean(approved)} onChange={onToggle} />
            <span />
            {approved ? 'Approved' : 'Excluded'}
          </label>
        </div>
      </header>
      <h3>{title}</h3>
      {children}
      <footer><SourceTag value={source} /></footer>
    </article>
  );
}

function VisualOutput({ result }) {
  return (
    <div className="visual-grid">
      {result.analysis.visualOpportunities.map((visual, index) => (
        <article className="visual-card" key={`${visual.format}-${visual.title}`}>
          <div className={`visual-card__preview visual-card__preview--${index % 4}`}>
            {visual.image ? (
              <img src={visual.image} alt={visual.title} />
            ) : visual.format === 'Flowchart' ? (
              <MiniFlow />
            ) : visual.format.includes('Decision') || visual.format.includes('tree') ? (
              <MiniDecision />
            ) : visual.format.includes('timeline') || visual.format.includes('Timeline') ? (
              <MiniTimeline />
            ) : (
              <div className="video-preview"><Icon name="play" /><span>01:45</span></div>
            )}
          </div>
          <div className="visual-card__body">
            <div>
              <span className="content-type">{visual.format}</span>
              <span className="match-score">{visual.score}% match</span>
            </div>
            <h3>{visual.title}</h3>
            <p>{visual.reason}</p>
            <button className="btn btn--ghost btn--small">Generate draft <Icon name="arrow" /></button>
          </div>
        </article>
      ))}
    </div>
  );
}

function QualityOutput({ result, approvedCount }) {
  const checks = [
    ['Source traceability', 'Every learning object includes a source page or slide.', 'Pass'],
    ['Multi-source agreement', 'Protocol rules were cross-checked across the directive deck, practice cases and printable chart.', 'Pass'],
    ['Question specificity', 'No generic “what does the source say” questions.', 'Pass'],
    ['Diagnostic feedback', 'Every quiz item maps a wrong answer to a misconception and remediation pack.', 'Pass'],
    ['Human approval', `${approvedCount} activities are currently selected for publishing.`, 'Required'],
  ];
  return (
    <div className="quality-layout">
      <div>
        <div className="quality-overview">
          <RingScore value={94} large />
          <div>
            <span>Draft readiness</span>
            <h2>Ready for trainer review</h2>
            <p>The engine found no blocking quality issues. Human review remains mandatory.</p>
          </div>
        </div>
        <div className="check-list">
          {checks.map(([title, detail, state]) => (
            <div key={title}>
              <span className={state === 'Pass' ? 'check-pass' : 'check-required'}>
                <Icon name={state === 'Pass' ? 'check' : 'eye'} />
              </span>
              <div><strong>{title}</strong><p>{detail}</p></div>
              <em>{state}</em>
            </div>
          ))}
        </div>
      </div>
      <aside className="evidence-card">
        <h3>Generation record</h3>
        <div><span>Method</span><strong>{result.generationMethod}</strong></div>
        <div><span>Generated</span><strong>{new Date(result.generatedAt).toLocaleString()}</strong></div>
        <div><span>Source</span><strong>{result.source.filename}</strong></div>
        <div><span>External API calls</span><strong>None</strong></div>
        <div><span>Publication state</span><strong>Trainer controlled</strong></div>
        <p><Icon name="shield" /> This record makes the prototype’s automation and human-review boundaries explicit.</p>
      </aside>
    </div>
  );
}

function StudentsPage({ selectedStudent, onSelectStudent }) {
  const [search, setSearch] = useState('');
  const filtered = STUDENTS.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="Learner management"
        title="Student progress"
        description="See engagement, mastery, weak topics and the next recommended trainer action."
        action={<button className="btn btn--ghost"><Icon name="download" /> Export report</button>}
      />

      <div className="student-toolbar panel">
        <label><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students…" /></label>
        <div>
          <button className="filter-chip active">All students <span>24</span></button>
          <button className="filter-chip">At risk <span>4</span></button>
          <button className="filter-chip">Inactive <span>2</span></button>
        </div>
      </div>

      <section className="panel student-table-panel">
        <table className="student-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Current module</th>
              <th>Completion</th>
              <th>Quiz average</th>
              <th>Weakest topic</th>
              <th>Last active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} onClick={() => onSelectStudent(student)}>
                <td><Avatar student={student} /><div><strong>{student.name}</strong><span>{student.cohort}</span></div></td>
                <td><StatusBadge value={student.status} /></td>
                <td>{student.currentModule}</td>
                <td><InlineProgress value={student.completion} /></td>
                <td><strong>{student.average}%</strong><span>{student.attempts} attempt{student.attempts === 1 ? '' : 's'}</span></td>
                <td><span className="weakness-chip">{student.weaknesses[0]}</span></td>
                <td>{student.lastActive}</td>
                <td><button className="mini-icon-btn"><Icon name="chevron" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {selectedStudent && (
        <StudentDrawer student={selectedStudent} onClose={() => onSelectStudent(null)} />
      )}
    </div>
  );
}

function StudentDrawer({ student, onClose }) {
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="student-drawer" onClick={(event) => event.stopPropagation()}>
        <header>
          <button className="mini-icon-btn" onClick={onClose}><Icon name="close" /></button>
          <Avatar student={student} large />
          <div><h2>{student.name}</h2><p>{student.cohort} · {student.time} total learning time</p></div>
          <StatusBadge value={student.status} />
        </header>

        <div className="drawer-stats">
          <div><span>Completion</span><strong>{student.completion}%</strong></div>
          <div><span>Quiz average</span><strong>{student.average}%</strong></div>
          <div><span>Attempts</span><strong>{student.attempts}</strong></div>
        </div>

        <section>
          <Subheading title="Topic mastery" />
          <div className="mastery-list">
            {student.mastery.map((item) => (
              <div key={item.topic}>
                <span>{item.topic}</span>
                <div><i className={item.score < 60 ? 'low' : item.score < 80 ? 'medium' : ''} style={{ width: `${item.score}%` }} /></div>
                <strong>{item.score}%</strong>
              </div>
            ))}
          </div>
        </section>

        <div className="strength-weakness-grid">
          <section>
            <h3><Icon name="strength" /> Strengths</h3>
            {student.strengths.map((item) => <span key={item}>{item}</span>)}
          </section>
          <section>
            <h3><Icon name="alert" /> Needs review</h3>
            {student.weaknesses.map((item) => <span key={item}>{item}</span>)}
          </section>
        </div>

        {student.evidence?.length > 0 && (
          <section className="mistake-evidence">
            <Subheading title="Mistake evidence & assigned practice" count={student.evidence.length} />
            {student.evidence.map((item) => (
              <article key={`${student.id}-${item.topic}`}>
                <header>
                  <span>{item.topic}</span>
                  <em>Practice assigned</em>
                </header>
                <p><strong>Question evidence:</strong> {item.prompt}</p>
                <p><strong>Learner selected:</strong> {item.selected}</p>
                <div><Icon name="sparkles" /><span><strong>Detected misconception</strong>{item.diagnosis}</span></div>
                <footer><Icon name="target" /> {item.assigned}</footer>
              </article>
            ))}
          </section>
        )}

        <section className="recommendation-card">
          <span><Icon name="sparkles" /> PROTOTYPE RECOMMENDATION</span>
          <p>{student.recommendation}</p>
          <div>
            <button className="btn btn--primary btn--small">Assign practice</button>
            <button className="btn btn--ghost btn--small">Add trainer note</button>
          </div>
        </section>
      </aside>
    </div>
  );
}

function AnalyticsPage({ onSelectStudent, onGoStudents }) {
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="Learning analytics"
        title="Where is the cohort struggling?"
        description="Topic-level signals connect assessment performance to trainer interventions."
        action={<button className="btn btn--ghost"><Icon name="calendar" /> Last 30 days</button>}
      />
      <div className="stat-grid">
        <MetricCard icon="chart" color="teal" value="78%" label="Cohort mastery" change="+5% after practice" />
        <MetricCard icon="clock" color="blue" value="31m" label="Average module time" change="4m below target" />
        <MetricCard icon="repeat" color="amber" value="2.4" label="Attempts to mastery" change="Change sequence: 3.8" />
        <MetricCard icon="strength" color="green" value="84%" label="Intervention success" change="Within 7 days" />
      </div>

      <div className="analytics-grid">
        <section className="panel mastery-panel">
          <PanelHeader title="Topic mastery" subtitle="Potassium Protocol · 24 learners" />
          <div className="cohort-bars">
            {COHORT_MASTERY.map((item) => (
              <div key={item.topic}>
                <div><span>{item.topic}</span><em className={item.trend.startsWith('-') ? 'negative' : ''}>{item.trend}</em></div>
                <div className="cohort-bar"><i className={item.score < 65 ? 'low' : ''} style={{ width: `${item.score}%` }} /></div>
                <strong>{item.score}%</strong>
              </div>
            ))}
          </div>
          <div className="analytics-insight">
            <Icon name="sparkles" />
            <div>
              <strong>Pattern detected</strong>
              <p>The eligibility gate and temporary-versus-ongoing sequence account for 61% of incorrect answers.</p>
            </div>
          </div>
        </section>

        <section className="panel">
          <PanelHeader title="Most missed questions" subtitle="Items to review with the content author" />
          <div className="missed-list">
            <MissedQuestion rate={48} topic="Change sequence" text="What happens after the first indicated concentrate change?" />
            <MissedQuestion rate={44} topic="Eligibility" text="May a four-times-weekly patient use the adjustment table?" />
            <MissedQuestion rate={31} topic="Documentation" text="Where is “Bath Changed” recorded?" />
          </div>
        </section>
      </div>

      <section className="panel intervention-panel">
        <PanelHeader
          title="Recommended interventions"
          subtitle="Explainable suggestions based on the visible learner signals"
          action={<button className="text-btn" onClick={onGoStudents}>Open student list</button>}
        />
        <div className="intervention-grid">
          {STUDENTS.filter((student) => student.status !== 'On track').slice(0, 3).map((student) => (
            <button key={student.id} onClick={() => { onSelectStudent(student); onGoStudents(); }}>
              <div><Avatar student={student} /><StatusBadge value={student.status} /></div>
              <h3>{student.name}</h3>
              <p>{student.recommendation}</p>
              <span>Review profile <Icon name="arrow" /></span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ArchitecturePage() {
  const [selected, setSelected] = useState(PIPELINE_STEPS[2]);
  return (
    <div className="page-stack">
      <PageHeading
        eyebrow="System architecture"
        title="A workflow, not one magical chatbot"
        description="The MVP separates extraction, analysis, instructional design, generation and approval so each stage can be tested or replaced."
        action={<span className="connection-badge"><span /> No external AI key</span>}
      />

      <section className="panel architecture-board">
        <div className="architecture-lane">
          <div className="lane-label">Trainer input</div>
          <button className="architecture-source">
            <Icon name="upload" />
            <strong>Source documents</strong>
            <span>PDF · PPTX · DOCX · TXT</span>
          </button>
        </div>
        <div className="architecture-connector"><Icon name="arrow" /></div>
        <div className="architecture-agents">
          <div className="lane-label">Agent pipeline</div>
          <div>
            {PIPELINE_STEPS.map((step, index) => (
              <button
                key={step.id}
                className={selected.id === step.id ? 'active' : ''}
                onClick={() => setSelected(step)}
              >
                <span>{index + 1}</span>
                <div><strong>{step.title}</strong><small>{step.subtitle}</small></div>
                <Icon name="chevron" />
              </button>
            ))}
          </div>
        </div>
        <div className="architecture-connector"><Icon name="arrow" /></div>
        <div className="architecture-lane">
          <div className="lane-label">Human governed output</div>
          <div className="architecture-output">
            <Icon name="publish" />
            <strong>Approved module</strong>
            <span>Learner portal · analytics</span>
          </div>
        </div>
      </section>

      <div className="architecture-detail-grid">
        <section className="panel agent-detail">
          <span className="feature-label"><Icon name="cpu" /> SELECTED STAGE</span>
          <h2>{selected.title}</h2>
          <p>{selected.detail}</p>
          <div>
            <span>Receives</span>
            <code>{selected.id === 'ingest' ? 'uploaded_file' : `${PIPELINE_STEPS[Math.max(0, PIPELINE_STEPS.findIndex((step) => step.id === selected.id) - 1)].id}.json`}</code>
          </div>
          <div>
            <span>Produces</span>
            <code>{selected.id}.json</code>
          </div>
          <div>
            <span>MVP implementation</span>
            <strong>{['ingest', 'clean'].includes(selected.id) ? 'Python extraction + rules' : selected.id === 'review' ? 'Automated checks + trainer' : 'Deterministic prototype engine'}</strong>
          </div>
        </section>

        <section className="panel honesty-panel">
          <PanelHeader title="What is real in this MVP?" subtitle="A clear boundary makes the demonstration credible." />
          <HonestyRow state="real" title="Multi-format extraction" detail="The included Python backend reads PDF, PPTX, DOCX and text locally." />
          <HonestyRow state="real" title="Automated content analysis" detail="Keywords, chunks, objectives, visuals and draft questions are generated from extracted text." />
          <HonestyRow state="real" title="Trainer review and learner experience" detail="The full review, publish, preview and analytics interactions are functional." />
          <HonestyRow state="prototype" title="Sample quality" detail="The showcase module is cached and refined so a live presentation is dependable." />
          <HonestyRow state="future" title="LLM reasoning and media generation" detail="Gemini, Claude, OpenAI or Ollama can later replace individual stages." />
        </section>
      </div>

      <section className="panel swap-panel">
        <div>
          <span className="feature-label"><Icon name="workflow" /> MODEL-AGNOSTIC CONTRACT</span>
          <h2>Upgrade one stage without rebuilding the product.</h2>
          <p>
            Today, a local rules engine produces structured JSON. After funding, the same
            contracts can call an LLM, a video service or a specialized assessment model.
          </p>
        </div>
        <div className="model-slots">
          <span>Local rules</span><Icon name="arrow" /><span>Ollama</span><Icon name="arrow" /><span>Cloud LLM</span>
        </div>
      </section>
    </div>
  );
}

function LegacyLearnerExperience({ module, learner, exitLabel, onExit }) {
  const [section, setSection] = useState('overview');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const quiz = module.quiz || SAMPLE_QUIZ;
  const flashcards = module.flashcards || SAMPLE_FLASHCARDS;
  const flow = module.flow?.length ? module.flow : SAMPLE_FLOW;
  const currentQuestion = quiz[questionIndex];
  const score = useMemo(
    () => Object.entries(answers).filter(([index, value]) => quiz[Number(index)]?.correct === value).length,
    [answers, quiz],
  );
  const topicResults = useMemo(() => {
    const totals = {};
    quiz.forEach((question, index) => {
      totals[question.topic] ||= { correct: 0, total: 0 };
      totals[question.topic].total += 1;
      if (answers[index] === question.correct) totals[question.topic].correct += 1;
    });
    return Object.entries(totals).map(([topic, value]) => ({
      topic,
      score: Math.round((value.correct / value.total) * 100),
    }));
  }, [answers, quiz]);

  const learnerSections = [
    ['overview', 'Module overview', 'home'],
    ['lesson', 'Key concepts', 'book'],
    ['flow', 'Process flowchart', 'workflow'],
    ['cards', 'Flashcards', 'cards'],
    ['quiz', 'Knowledge check', 'target'],
  ];

  return (
    <div className="learner-shell">
      <header className="learner-topbar">
        <div className="learner-brand"><BrandMark /><strong>LearningForge</strong></div>
        <div className="learner-module-title">
          <span>Renal Orientation</span>
          <strong>{module.analysis.title}</strong>
        </div>
        <div className="learner-user">
          <button className="btn btn--ghost btn--small" onClick={onExit}><Icon name="swap" /> {exitLabel}</button>
          <span>{learner.initials}</span>
        </div>
      </header>

      <aside className="learner-sidebar">
        <div className="learner-progress">
          <div><span>Module progress</span><strong>{showResults ? 100 : section === 'quiz' ? 80 : learnerSections.findIndex(([id]) => id === section) * 20}%</strong></div>
          <div><i style={{ width: `${showResults ? 100 : section === 'quiz' ? 80 : learnerSections.findIndex(([id]) => id === section) * 20}%` }} /></div>
        </div>
        <nav>
          {learnerSections.map(([id, label, icon], index) => (
            <button key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}>
              <span>{index < learnerSections.findIndex(([current]) => current === section) || showResults ? '✓' : <Icon name={icon} />}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="learner-sidebar__source">
          <Icon name="shield" />
          <strong>Source-grounded module</strong>
          <span>Every activity links back to approved material.</span>
        </div>
      </aside>

      <main className="learner-content">
        {section === 'overview' && (
          <div className="learner-page">
            <div className="module-hero">
              <span className="content-type">Generated learning module</span>
              <h1>{module.analysis.title}</h1>
              <p>{module.analysis.description}</p>
              <div>
                <span><Icon name="clock" /> {module.analysis.estimatedMinutes} minutes</span>
                <span><Icon name="target" /> {module.analysis.objectives.length} objectives</span>
                <span><Icon name="cards" /> {flashcards.length} flashcards</span>
              </div>
              <button className="btn btn--primary" onClick={() => setSection('lesson')}>Begin module <Icon name="arrow" /></button>
            </div>
            <section className="learner-card">
              <Subheading title="By the end of this module, you will be able to…" />
              <div className="learner-objectives">
                {module.analysis.objectives.map((objective, index) => (
                  <div key={objective.id}><span>{index + 1}</span><p>{objective.text}</p></div>
                ))}
              </div>
            </section>
          </div>
        )}

        {section === 'lesson' && (
          <div className="learner-page learner-reading">
            <div className="lesson-heading"><span>01 · KEY CONCEPTS</span><h1>Potassium protocol in context</h1></div>
            <section className="learner-card reading-copy">
              <h2>Why this process matters</h2>
              <p>
                The potassium protocol is a source-grounded clinical decision workflow.
                Its purpose is to help nurses recognize eligible patients, choose the
                correct temporary or ongoing dialysate potassium response, and document
                the follow-up plan.
              </p>
              <div className="callout callout--teal">
                <Icon name="info" />
                <p><strong>Who is included?</strong> All hemodialysis patients are included in the policy.</p>
              </div>
              <h2>Who does what?</h2>
              <div className="role-learning-grid">
                <div><span>Bedside nurse</span><p>Checks draw triggers, eligibility, table logic, documentation and follow-up electrolytes.</p></div>
                <div><span>Provider</span><p>Is notified for critical potassium values or patients outside the table criteria.</p></div>
                <div><span>Trainer</span><p>Reviews source-linked generated activities before publishing them to learners.</p></div>
                <div><span>Learner</span><p>Practices cases and receives weakness-specific remediation after diagnostic misses.</p></div>
              </div>
              <SourceTag value="Potassium source package · protocol deck and chart" />
            </section>
            <div className="lesson-nav"><span /><button className="btn btn--primary" onClick={() => setSection('flow')}>Continue to flowchart <Icon name="arrow" /></button></div>
          </div>
        )}

        {section === 'flow' && (
          <div className="learner-page">
            <div className="lesson-heading"><span>02 · INTERACTIVE VISUAL</span><h1>The potassium change workflow</h1><p>Follow the handoff from initial indicated change to next-run reassessment.</p></div>
            <div className="learning-flow">
              {flow.map((step, index) => (
                <div className="learning-flow__step" key={step.step}>
                  <span className="learning-flow__number">{step.step}</span>
                  <article>
                    <span className="content-type">{step.role}</span>
                    <h2>{step.title}</h2>
                    <p>{step.body}</p>
                    <div><Icon name="check" /><span><strong>Complete when:</strong> {step.completion}</span></div>
                    <SourceTag value={step.source} />
                  </article>
                  {index < flow.length - 1 && <div className="learning-flow__arrow"><Icon name="arrowDown" /></div>}
                </div>
              ))}
            </div>
            <div className="lesson-nav"><button className="btn btn--ghost" onClick={() => setSection('lesson')}>Back</button><button className="btn btn--primary" onClick={() => setSection('cards')}>Practice with flashcards <Icon name="arrow" /></button></div>
          </div>
        )}

        {section === 'cards' && (
          <div className="learner-page">
            <div className="lesson-heading"><span>03 · ACTIVE RECALL</span><h1>Flashcard review</h1><p>Try to answer before revealing the source-grounded response.</p></div>
            <div className="learner-flashcard-wrap">
              <div className="card-counter">Card {cardIndex + 1} of {flashcards.length}</div>
              <button className={`learner-flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((value) => !value)}>
                <div className="learner-flashcard__inner">
                  <div className="learner-flashcard__face">
                    <span>{flashcards[cardIndex].topic}</span>
                    <h2>{flashcards[cardIndex].front}</h2>
                    <small><Icon name="repeat" /> Click to reveal</small>
                  </div>
                  <div className="learner-flashcard__face learner-flashcard__back">
                    <span>Answer</span>
                    <p>{flashcards[cardIndex].back}</p>
                    <SourceTag value={flashcards[cardIndex].source} />
                    <small><Icon name="repeat" /> Click to see question</small>
                  </div>
                </div>
              </button>
              <div className="flashcard-controls">
                <button className="btn btn--ghost" disabled={cardIndex === 0} onClick={() => { setCardIndex((value) => value - 1); setFlipped(false); }}><Icon name="arrowLeft" /> Previous</button>
                <div>{flashcards.map((card, index) => <button key={card.id} className={index === cardIndex ? 'active' : ''} onClick={() => { setCardIndex(index); setFlipped(false); }} />)}</div>
                <button className="btn btn--primary" onClick={() => {
                  if (cardIndex < flashcards.length - 1) {
                    setCardIndex((value) => value + 1);
                    setFlipped(false);
                  } else {
                    setSection('quiz');
                  }
                }}>{cardIndex < flashcards.length - 1 ? <>Next <Icon name="arrow" /></> : <>Start quiz <Icon name="arrow" /></>}</button>
              </div>
            </div>
          </div>
        )}

        {section === 'quiz' && (
          <div className="learner-page">
            {!showResults ? (
              <>
                <div className="quiz-progress">
                  <div><span>Knowledge check</span><strong>Question {questionIndex + 1} of {quiz.length}</strong></div>
                  <div><i style={{ width: `${((questionIndex + 1) / quiz.length) * 100}%` }} /></div>
                </div>
                <section className="learner-card learner-quiz">
                  <span className="content-type">{currentQuestion.topic}</span>
                  <h1>{currentQuestion.question}</h1>
                  <div className="learner-options">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={option}
                        className={[
                          answers[questionIndex] === index ? 'selected' : '',
                          submitted && index === currentQuestion.correct ? 'correct' : '',
                          submitted && answers[questionIndex] === index && index !== currentQuestion.correct ? 'wrong' : '',
                        ].filter(Boolean).join(' ')}
                        disabled={submitted}
                        onClick={() => setAnswers((currentAnswers) => ({ ...currentAnswers, [questionIndex]: index }))}
                      >
                        <span>{String.fromCharCode(65 + index)}</span>
                        <p>{option}</p>
                        {submitted && index === currentQuestion.correct && <Icon name="check" />}
                      </button>
                    ))}
                  </div>
                  {submitted && (
                    <div className={`answer-feedback ${answers[questionIndex] === currentQuestion.correct ? 'answer-feedback--correct' : ''}`}>
                      <Icon name={answers[questionIndex] === currentQuestion.correct ? 'check' : 'alert'} />
                      <div>
                        <strong>{answers[questionIndex] === currentQuestion.correct ? 'Correct' : 'Not quite'}</strong>
                        <p>{currentQuestion.explanation}</p>
                        <SourceTag value={currentQuestion.source} />
                      </div>
                    </div>
                  )}
                  <div className="quiz-actions">
                    {!submitted ? (
                      <button className="btn btn--primary" disabled={answers[questionIndex] === undefined} onClick={() => setSubmitted(true)}>Check answer</button>
                    ) : (
                      <button className="btn btn--primary" onClick={() => {
                        if (questionIndex < quiz.length - 1) {
                          setQuestionIndex((value) => value + 1);
                          setSubmitted(false);
                        } else {
                          setShowResults(true);
                        }
                      }}>{questionIndex < quiz.length - 1 ? <>Next question <Icon name="arrow" /></> : <>View my results <Icon name="arrow" /></>}</button>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <LearnerResults
                score={score}
                total={quiz.length}
                topics={topicResults}
                onReturn={onExit}
                returnLabel={exitLabel}
                onRetry={() => {
                  setAnswers({});
                  setQuestionIndex(0);
                  setSubmitted(false);
                  setShowResults(false);
                }}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function LearnerResults({ score, total, topics, onReturn, returnLabel, onRetry }) {
  const percent = Math.round((score / total) * 100);
  const strengths = topics.filter((topic) => topic.score >= 80);
  const weaknesses = topics.filter((topic) => topic.score < 80);
  return (
    <div className="results-page">
      <div className="results-hero">
        <RingScore value={percent} large />
        <div>
          <span>{percent >= 80 ? 'Module mastered' : 'Review recommended'}</span>
          <h1>{score} of {total} correct</h1>
          <p>Your results have been translated into topic-level strengths and review recommendations.</p>
        </div>
      </div>

      <div className="results-grid">
        <section className="learner-card">
          <Subheading title="Topic performance" />
          <div className="mastery-list">
            {topics.map((topic) => (
              <div key={topic.topic}>
                <span>{topic.topic}</span>
                <div><i className={topic.score < 60 ? 'low' : topic.score < 80 ? 'medium' : ''} style={{ width: `${topic.score}%` }} /></div>
                <strong>{topic.score}%</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="learner-card results-insights">
          <div>
            <h3><Icon name="strength" /> Your strengths</h3>
            {(strengths.length ? strengths : [{ topic: 'Keep practising to establish a strength' }]).map((topic) => <span key={topic.topic}>{topic.topic}</span>)}
          </div>
          <div>
            <h3><Icon name="alert" /> Review next</h3>
            {(weaknesses.length ? weaknesses : [{ topic: 'No weak topic detected' }]).map((topic) => <span key={topic.topic}>{topic.topic}</span>)}
          </div>
        </section>
      </div>
      <section className="learner-card personalized-next">
        <Icon name="sparkles" />
        <div>
          <span>RECOMMENDED NEXT STEP</span>
          <h2>{weaknesses.length ? `Review ${weaknesses[0].topic}, then retry two focused questions.` : 'Continue to the next renal orientation module.'}</h2>
          <p>This recommendation is explainable from the topic scores shown above.</p>
        </div>
      </section>
      <div className="results-actions">
        <button className="btn btn--ghost" onClick={onRetry}><Icon name="repeat" /> Retry quiz</button>
        <button className="btn btn--primary" onClick={onReturn}>{returnLabel} <Icon name="arrow" /></button>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <header className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && <div className="page-heading__action">{action}</div>}
    </header>
  );
}

function MetricCard({ icon, color, value, label, change }) {
  return (
    <div className="metric-card panel">
      <span className={`metric-card__icon metric-card__icon--${color}`}><Icon name={icon} /></span>
      <div><strong>{value}</strong><span>{label}</span><small>{change}</small></div>
    </div>
  );
}

function PanelHeader({ title, subtitle, action }) {
  return (
    <header className="panel-header">
      <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
      {action}
    </header>
  );
}

function ReviewRow({ type, title, count, quality }) {
  return (
    <div className="review-row">
      <span className="review-row__icon"><Icon name={type === 'Quiz' ? 'target' : type === 'Flowchart' ? 'workflow' : 'cards'} /></span>
      <div><strong>{title}</strong><span>{type} · {count}</span></div>
      <em>{quality}%</em>
      <button className="mini-icon-btn"><Icon name="chevron" /></button>
    </div>
  );
}

function ProgressRow({ label, score }) {
  return (
    <div className="progress-row">
      <div><span>{label}</span><strong>{score}%</strong></div>
      <div><i style={{ width: `${score}%` }} /></div>
    </div>
  );
}

function Subheading({ title, count }) {
  return <div className="subheading"><h3>{title}</h3>{count !== undefined && <span>{count}</span>}</div>;
}

function SourceTag({ value }) {
  return <span className="source-tag"><Icon name="link" /> {value}</span>;
}

function RingScore({ value, large }) {
  return (
    <div className={`ring-score ${large ? 'ring-score--large' : ''}`} style={{ '--score': value }}>
      <div><strong>{value}%</strong>{large && <span>score</span>}</div>
    </div>
  );
}

function Avatar({ student, large }) {
  return <span className={`avatar ${large ? 'avatar--large' : ''}`}>{student.initials}</span>;
}

function StatusBadge({ value }) {
  const className = value.toLowerCase().replace(/\s+/g, '-');
  return <span className={`status-badge status-badge--${className}`}><i />{value}</span>;
}

function InlineProgress({ value }) {
  return (
    <div className="inline-progress">
      <div><i style={{ width: `${value}%` }} /></div><span>{value}%</span>
    </div>
  );
}

function MissedQuestion({ rate, topic, text }) {
  return (
    <div className="missed-question">
      <span>{rate}%<small>missed</small></span>
      <div><em>{topic}</em><p>{text}</p></div>
      <button className="mini-icon-btn"><Icon name="edit" /></button>
    </div>
  );
}

function HonestyRow({ state, title, detail }) {
  return (
    <div className="honesty-row">
      <span className={`honesty-row__state honesty-row__state--${state}`}>
        <Icon name={state === 'real' ? 'check' : state === 'prototype' ? 'eye' : 'clock'} />
      </span>
      <div><strong>{title}</strong><p>{detail}</p></div>
      <em>{state === 'real' ? 'Working' : state === 'prototype' ? 'Demo-safe' : 'Future'}</em>
    </div>
  );
}

function MiniFlow() {
  return <div className="mini-flow"><span>1</span><i /><span>2</span><i /><span>3</span></div>;
}

function MiniDecision() {
  return <div className="mini-decision"><span /><i /><b /><em /><strong /></div>;
}

function MiniTimeline() {
  return <div className="mini-timeline"><i /><span>2 weeks</span><b>5 months</b><em>6 months</em></div>;
}

function Spinner() {
  return <span className="spinner" />;
}

function BrandMark({ large }) {
  return (
    <span className={`brand-mark ${large ? 'brand-mark--large' : ''}`}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path d="M11 8.5C16.5 9 19.2 13 20 18c.8-5 3.5-9 9-9.5-1 5.4-4.2 8-9 8.7 4.8.7 8 3.3 9 8.7-5.5-.5-8.2-4.5-9-9.5-.8 5-3.5 9-9 9.5 1-5.4 4.2-8 9-8.7-4.8-.7-8-3.3-9-8.7Z" />
        <circle cx="20" cy="20" r="2.4" />
      </svg>
    </span>
  );
}

function Icon({ name }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    sparkles: <><path d="m12 3 1.2 3.2L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.3L12 3Z" /><path d="m18.5 13 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" /><path d="m6 14 .8 2.2L9 17l-2.2.8L6 20l-.8-2.2L3 17l2.2-.8L6 14Z" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 16 4-5 4 3 5-7" /></>,
    workflow: <><rect x="3" y="3" width="6" height="5" rx="1" /><rect x="15" y="16" width="6" height="5" rx="1" /><rect x="15" y="3" width="6" height="5" rx="1" /><path d="M9 5.5h6M18 8v8M9 5.5v13h6" /></>,
    logout: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-6" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    cpu: <><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
    alert: <><path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    cards: <><rect x="3" y="5" width="14" height="16" rx="2" /><path d="m7 5 2-3h10a2 2 0 0 1 2 2v13l-4 2" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    upload: <><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M20 16v4H4v-4" /></>,
    publish: <><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 14v6h14v-6" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    drag: <><circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" /><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" /></>,
    minus: <path d="M5 12h14" />,
    play: <><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    strength: <><path d="M7 11V5a2 2 0 0 1 4 0v5M11 10V3a2 2 0 0 1 4 0v7M15 10V5a2 2 0 0 1 4 0v8c0 5-3 9-8 9s-8-4-8-9v-2a2 2 0 0 1 4 0Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    repeat: <><path d="m17 2 4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>,
    swap: <><path d="M7 7h14l-4-4M17 17H3l4 4" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
    arrowDown: <><path d="M12 5v14" /><path d="m6 13 6 6 6-6" /></>,
    arrowLeft: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    repeat2: <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" />,
  };
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.info}
    </svg>
  );
}
