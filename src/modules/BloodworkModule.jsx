import { useState } from 'react';
import { useApp } from '../context';
import { FLASHCARDS, ASSESSMENT_QUESTIONS, CRITICAL_VALUES_TABLE, BLOODWORK_READING_SECTIONS } from '../data';
import { LinkedText } from '../utils/linkGlossary';
import './BloodworkModule.css';

const PASS_THRESHOLD = 0.80;


export default function BloodworkModule({ questId, onTaskComplete, taskProgress, assessmentScore, onAssessmentComplete, onAssessmentReset }) {
  const [activeTask, setActiveTask] = useState(0);

  const tasks = [
    { key: 'reading', label: 'What We Test and Why', type: 'reading' },
    { key: 'flashcards', label: 'Critical Values Flashcards', type: 'flashcards' },
    { key: 'identification', label: 'Critical Range Identification', type: 'identification' },
    { key: 'assessment', label: 'Formal Assessment', type: 'assessment' },
  ];

  const prereqsDone = ['reading', 'flashcards', 'identification'].every(k => taskProgress[k]);

  return (
    <div className="module-layout">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--assessment">Assessment Quest</span>
          <h3 className="module-sidebar__title">Bloodwork Values</h3>
        </div>
        <div className="module-tasklist">
          {tasks.map((t, i) => {
            const done = t.key === 'assessment'
              ? assessmentScore?.passed
              : taskProgress[t.key];
            const isAssessment = t.type === 'assessment';
            const locked = isAssessment && !prereqsDone;
            return (
              <button
                key={t.key}
                className={`module-task-btn ${activeTask === i ? 'module-task-btn--active' : ''} ${done ? 'module-task-btn--done' : ''}`}
                onClick={() => !locked && setActiveTask(i)}
                disabled={locked}
                title={locked ? 'Complete the prerequisite tasks first' : ''}
              >
                <span className={`check-icon ${done ? 'check-icon--done' : 'check-icon--todo'}`}>
                  {done ? '✓' : locked ? '🔒' : <span style={{fontSize:11,color:'var(--text-300)'}}>{i + 1}</span>}
                </span>
                <div>
                  <span className="module-task-btn__label">{t.label}</span>
                  {isAssessment && <div style={{fontSize:11,color:locked?'var(--grey-400)':'var(--red-500)',fontWeight:600}}>
                    {locked ? 'Complete tasks 1–3 first' : 'Formal test · 80% to pass'}
                  </div>}
                </div>
              </button>
            );
          })}
        </div>
        {!prereqsDone && (
          <div className="module-sidebar__note">
            Complete the three preparation tasks to unlock the formal assessment.
          </div>
        )}
      </aside>

      <main className="module-content">
        {tasks[activeTask].type === 'reading' && (
          <BloodworkReading done={taskProgress['reading']} onComplete={() => onTaskComplete(questId, 'reading')} />
        )}
        {tasks[activeTask].type === 'flashcards' && (
          <Flashcards done={taskProgress['flashcards']} onComplete={() => onTaskComplete(questId, 'flashcards')} />
        )}
        {tasks[activeTask].type === 'identification' && (
          <CriticalRangeID done={taskProgress['identification']} onComplete={() => onTaskComplete(questId, 'identification')} />
        )}
        {tasks[activeTask].type === 'assessment' && (
          <FormalAssessment
            score={assessmentScore}
            onComplete={(score, passed) => onAssessmentComplete(score, passed)}
            onReset={onAssessmentReset}
          />
        )}
      </main>
    </div>
  );
}

function BloodworkReading({ done, onComplete }) {
  const { dispatch } = useApp();
  const [pageIdx, setPageIdx] = useState(0);
  const page = BLOODWORK_READING_SECTIONS[pageIdx];
  const isLast = pageIdx === BLOODWORK_READING_SECTIONS.length - 1;

  const openJournal = (target) => dispatch({ type: 'JOURNAL_OPEN', target });

  return (
    <div className="reading-task fade-in">
      <div className="reading-task__header">
        <h2>What We Test and Why</h2>
        <span className="reading-task__page">{pageIdx + 1} / {BLOODWORK_READING_SECTIONS.length}</span>
      </div>
      <div className="reading-section">
        <h3 className="reading-section__heading">{page.heading}</h3>
        <p className="reading-section__body">
          <LinkedText text={page.body} onOpen={openJournal} />
        </p>
      </div>
      <div className="reading-task__actions">
        {pageIdx > 0 && <button className="btn btn--outline" onClick={() => setPageIdx(p => p - 1)}>← Previous</button>}
        <div style={{flex:1}}/>
        {!isLast ? (
          <button className="btn btn--primary" onClick={() => setPageIdx(p => p + 1)}>Next →</button>
        ) : (
          <button className="btn btn--primary" onClick={onComplete} disabled={done}>
            {done ? '✓ Completed' : 'Mark as Read'}
          </button>
        )}
      </div>
    </div>
  );
}

function Flashcards({ done, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState(new Set());
  const card = FLASHCARDS[idx];

  function handleFlip() {
    setFlipped(f => !f);
    setSeen(s => new Set([...s, idx]));
  }

  function go(dir) {
    const next = idx + dir;
    if (next >= 0 && next < FLASHCARDS.length) {
      setIdx(next);
      setFlipped(false);
    }
  }

  const allSeen = seen.size >= FLASHCARDS.length;

  return (
    <div className="flashcards-task fade-in">
      <div className="flashcards-header">
        <h2>Critical Values Flashcards</h2>
        <span className="exercise__progress">{idx + 1} / {FLASHCARDS.length}</span>
      </div>
      <p className="exercise__instruction">Click each card to reveal the critical value ranges and nursing response. Review all cards before proceeding.</p>

      <div className="flashcard-area">
        <div className={`flashcard ${flipped ? 'flashcard--flipped' : ''}`} onClick={handleFlip}>
          <div className="flashcard__inner">
            <div className="flashcard__front">
              <div className="flashcard__label">{card.label}</div>
              <div className="flashcard__question">{card.front}</div>
              <div className="flashcard__tap-hint">Tap to reveal →</div>
            </div>
            <div className="flashcard__back">
              <div className="flashcard__label">{card.label}</div>
              <div className="flashcard__answer">{card.back}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flashcard-nav">
        <button className="btn btn--outline btn--sm" onClick={() => go(-1)} disabled={idx === 0}>← Prev</button>
        <div className="flashcard-dots">
          {FLASHCARDS.map((_, i) => (
            <button
              key={i}
              className={`flashcard-dot ${i === idx ? 'flashcard-dot--active' : ''} ${seen.has(i) ? 'flashcard-dot--seen' : ''}`}
              onClick={() => { setIdx(i); setFlipped(false); }}
            />
          ))}
        </div>
        <button className="btn btn--outline btn--sm" onClick={() => go(1)} disabled={idx === FLASHCARDS.length - 1}>Next →</button>
      </div>

      {allSeen && !done && (
        <div className="flashcard-complete-prompt">
          <p>You've reviewed all {FLASHCARDS.length} cards. Ready to mark this task complete?</p>
          <button className="btn btn--primary" onClick={onComplete}>Mark Complete ✓</button>
        </div>
      )}
      {done && <div className="badge badge--green" style={{marginTop:16, alignSelf:'flex-start'}}>✓ Task complete</div>}
    </div>
  );
}

// Critical range identification scenarios
const ID_SCENARIOS = [
  { patient: 'Mr. K. Osei', test: 'Potassium', value: 6.3, unit: 'mmol/L', answer: 'high-critical', options: ['Normal', 'Low — notify', 'High — notify'] },
  { patient: 'Ms. A. Park', test: 'Potassium', value: 4.2, unit: 'mmol/L', answer: 'normal', options: ['Normal', 'Low — notify', 'High — notify'] },
  { patient: 'Mr. F. Bello', test: 'Hemoglobin', value: 64, unit: 'g/L', answer: 'low-critical', options: ['Within target (100–115)', 'Below target — review EPO', 'Critically low — notify immediately'] },
  { patient: 'Ms. T. Singh', test: 'Albumin', value: 23, unit: 'g/L', answer: 'low-critical', options: ['Normal (35–50)', 'Below normal — monitor', 'Critically low (< 25) — notify immediately'] },
  { patient: 'Mr. B. Kowalski', test: 'Phosphorus', value: 2.1, unit: 'mmol/L', answer: 'above-target', options: ['Within dialysis target (< 1.78)', 'Above target — notify physician', 'Critically high — emergency'] },
  { patient: 'Ms. R. Chen', test: 'Sodium', value: 117, unit: 'mmol/L', answer: 'low-critical', options: ['Normal (135–145)', 'Mildly low — monitor', 'Critically low (< 120) — notify immediately'] },
];

function CriticalRangeID({ done, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(done);
  const scenario = ID_SCENARIOS[idx];

  const ANSWER_MAP = {
    'normal': 0, 'low-normal': 1, 'high-normal': 1, 'above-target': 1,
    'low-critical': scenario?.options.length === 3 ? 2 : 1,
    'high-critical': scenario?.options.length === 3 ? 2 : 2,
  };

  const correctIdx = ANSWER_MAP[scenario?.answer] ?? 0;
  const isCorrect = selected === correctIdx;

  function next() {
    if (idx < ID_SCENARIOS.length - 1) {
      setIdx(i => i + 1); setSelected(null); setSubmitted(false);
    } else {
      setAllDone(true); onComplete();
    }
  }

  if (allDone) return (
    <div className="completion-screen fade-in">
      <div className="completion-screen__icon">✓</div>
      <h2>Task Complete</h2>
      <p><strong>Critical Range Identification</strong> has been marked complete.</p>
    </div>
  );

  return (
    <div className="exercise fade-in">
      <div className="exercise__header">
        <h2>Critical Range Identification</h2>
        <span className="exercise__progress">{idx + 1} / {ID_SCENARIOS.length}</span>
      </div>
      <p className="exercise__instruction">Given the patient's lab result, classify the value and determine the appropriate response.</p>

      <div className="scenario-card card">
        <div className="scenario-card__name">Patient: <strong>{scenario.patient}</strong></div>
        <div className="id-result">
          <span className="id-result__test">{scenario.test}</span>
          <span className="id-result__value">{scenario.value}</span>
          <span className="id-result__unit">{scenario.unit}</span>
        </div>
      </div>

      <div className="exercise__label" style={{marginBottom:10}}>How would you classify this result?</div>
      <div className="rate-options">
        {scenario.options.map((opt, i) => (
          <button
            key={i}
            className={`rate-option ${selected === i ? 'rate-option--selected' : ''} ${submitted ? (i === correctIdx ? 'rate-option--correct' : selected === i ? 'rate-option--wrong' : '') : ''}`}
            onClick={() => !submitted && setSelected(i)}
            disabled={submitted}
          >
            {opt}
          </button>
        ))}
      </div>

      {!submitted ? (
        <button className="btn btn--primary" style={{marginTop:14}} onClick={() => setSubmitted(true)} disabled={selected === null}>Submit</button>
      ) : (
        <div className={`feedback ${isCorrect ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{isCorrect ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{isCorrect ? 'Correct!' : 'Incorrect'}</div>
            <div className="feedback__explanation">The correct classification is: <strong>{scenario.options[correctIdx]}</strong></div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={next}>{idx < ID_SCENARIOS.length - 1 ? 'Next →' : 'Complete Task ✓'}</button>
        </div>
      )}
    </div>
  );
}

function FormalAssessment({ score, onComplete, onReset }) {
  const [started, setStarted] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!started && !score) {
    return (
      <div className="assessment-intro fade-in">
        <div className="assessment-intro__icon">★</div>
        <h2>Bloodwork Values — Formal Assessment</h2>
        <div className="assessment-intro__details">
          <div className="detail-row"><span>Questions</span><strong>{ASSESSMENT_QUESTIONS.length}</strong></div>
          <div className="detail-row"><span>Pass threshold</span><strong>80% ({Math.ceil(ASSESSMENT_QUESTIONS.length * 0.8)} / {ASSESSMENT_QUESTIONS.length})</strong></div>
          <div className="detail-row"><span>Navigation</span><strong>No back-tracking</strong></div>
          <div className="detail-row"><span>Journal</span><strong>Not permitted during assessment</strong></div>
        </div>
        <p className="assessment-intro__note">The Journal is hidden during this assessment. Ensure you have reviewed the flashcards and critical range exercises before proceeding.</p>
        <button className="btn btn--primary btn--lg" onClick={() => setStarted(true)}>Begin Assessment →</button>
      </div>
    );
  }

  if (score) {
    return <AssessmentResults score={score} total={ASSESSMENT_QUESTIONS.length} onReset={onReset} />;
  }

  const q = ASSESSMENT_QUESTIONS[qIdx];
  const isLast = qIdx === ASSESSMENT_QUESTIONS.length - 1;

  function handleNext() {
    const newAnswers = { ...answers, [qIdx]: selected };
    if (isLast) {
      const correct = Object.entries(newAnswers).filter(([i, a]) => ASSESSMENT_QUESTIONS[parseInt(i)].correct === a).length;
      const pct = correct / ASSESSMENT_QUESTIONS.length;
      onComplete(correct, pct >= PASS_THRESHOLD);
    } else {
      setAnswers(newAnswers);
      setQIdx(i => i + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }

  return (
    <div className="formal-assessment fade-in">
      <div className="formal-assessment__header">
        <div className="formal-assessment__progress-bar">
          <div style={{width: `${(qIdx / ASSESSMENT_QUESTIONS.length) * 100}%`, height:'100%', background:'var(--teal-500)', borderRadius:'99px', transition:'width .3s'}} />
        </div>
        <span className="formal-assessment__q-num">Question {qIdx + 1} of {ASSESSMENT_QUESTIONS.length}</span>
      </div>

      <div className="formal-q">
        <p className="formal-q__text">{q.question}</p>
        <div className="formal-options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`formal-option ${selected === i ? 'formal-option--selected' : ''}`}
              onClick={() => setSelected(i)}
            >
              <span className="formal-option__letter">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="formal-assessment__nav">
        <button className="btn btn--primary" onClick={handleNext} disabled={selected === null}>
          {isLast ? 'Submit Assessment' : 'Next Question →'}
        </button>
      </div>
    </div>
  );
}

function AssessmentResults({ score, total, onReset }) {
  const pct = score.score / total;
  const passed = score.passed;
  const pctLabel = Math.round(pct * 100);
  const missed = total - score.score;

  return (
    <div className="assessment-results fade-in">
      <div className={`assessment-results__banner ${passed ? 'assessment-results__banner--pass' : 'assessment-results__banner--fail'}`}>
        <div className="assessment-results__icon">{passed ? '✓' : '✗'}</div>
        <div>
          <h2>{passed ? 'Assessment Passed!' : 'Assessment Not Passed'}</h2>
          <p>{passed ? 'Congratulations — you have demonstrated competency in bloodwork values.' : `You need 80% to pass. You scored ${pctLabel}%. Review the flashcards and try again.`}</p>
        </div>
      </div>
      <div className="assessment-results__score">
        <div className="score-circle" style={{'--pct': pctLabel}}>
          <div className="score-circle__inner">
            <span className="score-circle__num">{pctLabel}%</span>
            <span className="score-circle__label">{score.score}/{total}</span>
          </div>
        </div>
        <div className="assessment-results__breakdown">
          <div className="breakdown-row breakdown-row--correct"><span>Correct</span><strong>{score.score}</strong></div>
          <div className="breakdown-row breakdown-row--wrong"><span>Incorrect</span><strong>{missed}</strong></div>
          <div className="breakdown-row"><span>Pass threshold</span><strong>80% ({Math.ceil(total * 0.8)}/{total})</strong></div>
        </div>
      </div>
      {!passed && (
        <button className="btn btn--primary" onClick={onReset}>Retake Assessment</button>
      )}
    </div>
  );
}
