import { useState } from 'react';
import { useApp } from '../context';
import { FLASHCARDS, ASSESSMENT_QUESTIONS, CRITICAL_VALUES_TABLE, BLOODWORK_READING_SECTIONS, PHOEBE_CASE } from '../data';
import { LinkedText } from '../utils/linkGlossary';
import './BloodworkModule.css';

const PASS_THRESHOLD = 0.80;

function computeRecommendation(state) {
  const journalCount = (state.journalEntries || []).length;
  const readingsDone = Object.values(state.questTaskProgress || {})
    .reduce((n, tasks) => n + (tasks.reading ? 1 : 0), 0);
  if (journalCount >= 2 && readingsDone >= 3) {
    return {
      path: 'walkthrough',
      headline: 'Clinical Lab Panel Walkthrough',
      rationale: `Based on your activity — ${journalCount} journal entries and ${readingsDone} completed readings — this case-based walkthrough matches your level of preparation.`,
      altLabel: 'Switch to Flashcards instead',
    };
  }
  return {
    path: 'flashcards',
    headline: 'Critical Values Flashcards',
    rationale: `Building your foundation first. Once you've completed more readings and journal entries, a case-based walkthrough will be recommended.`,
    altLabel: 'Try the Case Walkthrough instead',
  };
}

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
          <FlashcardsOrWalkthrough done={taskProgress['flashcards']} onComplete={() => onTaskComplete(questId, 'flashcards')} />
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

// ─── AI-recommended learning path wrapper ─────────────────────────────────────

function FlashcardsOrWalkthrough({ done, onComplete }) {
  const { state } = useApp();
  const rec = computeRecommendation(state);
  const [chosenPath, setChosenPath] = useState(done ? rec.path : null);

  if (!chosenPath) {
    return <AIRecommendationCard rec={rec} onChoose={setChosenPath} />;
  }
  if (chosenPath === 'walkthrough') {
    return <ClinicalWalkthrough done={done} onComplete={onComplete} />;
  }
  return <Flashcards done={done} onComplete={onComplete} />;
}

function AIRecommendationCard({ rec, onChoose }) {
  const altPath = rec.path === 'walkthrough' ? 'flashcards' : 'walkthrough';
  return (
    <div className="ai-rec-card fade-in">
      <div className="ai-rec-card__badge">
        <div className="ai-rec-card__spark">✦</div>
        Personalized Recommendation
      </div>
      <h2 className="ai-rec-card__title">{rec.headline}</h2>
      <div className="ai-rec-card__rationale">{rec.rationale}</div>
      <div className="ai-rec-card__actions">
        <button className="btn btn--primary" onClick={() => onChoose(rec.path)}>
          Start {rec.headline} →
        </button>
        <button className="ai-rec-card__action--alt" onClick={() => onChoose(altPath)}>
          {rec.altLabel}
        </button>
      </div>
    </div>
  );
}

// ─── Lab Range Bar ────────────────────────────────────────────────────────────

function LabRangeBar({ label, value, unit, critLow, normal, critHigh, displayNote }) {
  const parts = normal.split(/\s*[–\-]\s*/).map(s => parseFloat(s));
  const normalLow = parts[0];
  const normalHigh = isNaN(parts[1]) ? (critHigh ?? value * 1.5) : parts[1];

  const allPoints = [critLow, normalLow, normalHigh, critHigh, value].filter(v => v != null && !isNaN(v));
  const absMin = Math.min(...allPoints);
  const absMax = Math.max(...allPoints);
  const span = absMax - absMin || 1;
  const rangeMin = absMin - span * 0.15;
  const totalSpan = (absMax + span * 0.15) - rangeMin;

  const toPct = v => Math.max(0, Math.min(100, ((v - rangeMin) / totalSpan) * 100));

  const critLowPct    = critLow  != null ? toPct(critLow)   : 0;
  const normalLowPct  = toPct(normalLow);
  const normalHighPct = toPct(normalHigh);
  const critHighPct   = critHigh != null ? toPct(critHigh)  : 100;

  const zone1W = critLow  != null ? critLowPct                              : 0;
  const zone2W = normalLowPct - zone1W;
  const zone3W = normalHighPct - normalLowPct;
  const zone4W = critHigh != null ? critHighPct - normalHighPct : 100 - normalHighPct;
  const zone5W = critHigh != null ? 100 - critHighPct                       : 0;

  const markerPct = toPct(value);

  let zone = 'normal';
  if      (critLow  != null && value < critLow)  zone = 'crit-low';
  else if (value < normalLow)                     zone = 'below-norm';
  else if (critHigh != null && value > critHigh)  zone = 'crit-high';
  else if (value > normalHigh)                    zone = 'above-norm';

  const statusLabels = {
    normal:         'Within normal range',
    'below-norm':   'Below normal range',
    'above-norm':   'Above normal range',
    'crit-low':     '⚠ Critically low — notify physician',
    'crit-high':    '⚠ Critically high — notify physician',
  };

  const ticks = [];
  if (critLow  != null) ticks.push({ v: critLow,    pct: critLowPct    });
  ticks.push(            { v: normalLow,  pct: normalLowPct  });
  ticks.push(            { v: normalHigh, pct: normalHighPct });
  if (critHigh != null) ticks.push({ v: critHigh,   pct: critHighPct   });

  return (
    <div className="lab-range-bar">
      <div className="lab-range-bar__header">
        <span className="lab-range-bar__label">{label}</span>
        <span className={`lab-range-bar__value lab-range-bar__value--${zone}`}>
          {value} <span className="lab-range-bar__unit">{unit}</span>
        </span>
      </div>
      <div className="lab-range-bar__track-wrap">
        <div className="lab-range-bar__track">
          {zone1W > 0 && <div className="lab-range-bar__zone lab-range-bar__zone--crit-low"   style={{width:`${zone1W}%`}} />}
          {zone2W > 0 && <div className="lab-range-bar__zone lab-range-bar__zone--below-norm" style={{width:`${zone2W}%`}} />}
          {zone3W > 0 && <div className="lab-range-bar__zone lab-range-bar__zone--normal"     style={{width:`${zone3W}%`}} />}
          {zone4W > 0 && <div className="lab-range-bar__zone lab-range-bar__zone--above-norm" style={{width:`${zone4W}%`}} />}
          {zone5W > 0 && <div className="lab-range-bar__zone lab-range-bar__zone--crit-high"  style={{width:`${zone5W}%`}} />}
        </div>
        <div className={`lab-range-bar__marker lab-range-bar__marker--${zone}`} style={{left:`${markerPct}%`}} />
      </div>
      <div className="lab-range-bar__ticks">
        {ticks.map(({v, pct}) => (
          <span key={v} className="lab-range-bar__tick" style={{left:`${pct}%`}}>{v}</span>
        ))}
      </div>
      <div className={`lab-range-bar__status lab-range-bar__status--${zone}`}>
        {displayNote ?? statusLabels[zone]}
      </div>
    </div>
  );
}

// ─── Clinical Walkthrough ─────────────────────────────────────────────────────

function ClinicalWalkthrough({ done, onComplete }) {
  const [phaseIdx, setPhaseIdx]       = useState(0);
  const [selected, setSelected]       = useState(null);
  const [submitted, setSubmitted]     = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completed, setCompleted]     = useState(done);

  const { phases, patient, summary } = PHOEBE_CASE;
  const phase    = phases[phaseIdx];
  const isLast   = phaseIdx === phases.length - 1;
  const isCorrect = submitted && selected === phase.question.correct;

  function handleNext() {
    if (!isLast) {
      setPhaseIdx(i => i + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setShowSummary(true);
    }
  }

  if (completed) {
    return (
      <div className="completion-screen fade-in">
        <div className="completion-screen__icon">✓</div>
        <h2>Task Complete</h2>
        <p><strong>Clinical Lab Panel Walkthrough</strong> has been marked complete.</p>
      </div>
    );
  }

  if (showSummary) {
    return (
      <div className="walkthrough fade-in">
        <div className="walkthrough__header">
          <span className="walkthrough__phase-badge">Lab Report Summary</span>
          <h2 className="walkthrough__title">Phoebe's Complete Lab Panel</h2>
          <p className="walkthrough__subtitle">{patient.treatment} · {patient.access}</p>
        </div>
        <div className="walkthrough__summary">
          {summary.map(row => (
            <div key={row.label} className="walkthrough__summary-row">
              <div className={`walkthrough__summary-icon walkthrough__summary-icon--${row.status}`}>
                {row.status === 'ok' ? '✓' : '!'}
              </div>
              <span className="walkthrough__summary-label">{row.label}</span>
              <span className="walkthrough__summary-finding">{row.finding}</span>
            </div>
          ))}
        </div>
        <button className="btn btn--primary" onClick={() => { setCompleted(true); onComplete(); }}>
          Mark Task Complete ✓
        </button>
      </div>
    );
  }

  return (
    <div className="walkthrough fade-in" key={phaseIdx}>
      <div className="walkthrough__header">
        <span className="walkthrough__phase-badge">{phase.title}</span>
        <h2 className="walkthrough__title">{phase.subtitle}</h2>
        <p className="walkthrough__intro">{phase.intro}</p>
      </div>

      <div className="walkthrough__annotation">
        <div className="walkthrough__annotation-title">📋 {phase.annotation.title}</div>
        <p className="walkthrough__annotation-body">{phase.annotation.body}</p>
      </div>

      {phase.kpis && (
        <div className="walkthrough__kpi-row">
          {phase.kpis.map(kpi => (
            <div key={kpi.label} className="walkthrough__kpi">
              <div className="walkthrough__kpi-label">{kpi.label}</div>
              <div className={`walkthrough__kpi-value walkthrough__kpi-value--${kpi.status}`}>{kpi.value}</div>
              <div className="walkthrough__kpi-target">Target {kpi.target}</div>
            </div>
          ))}
        </div>
      )}

      <div className="walkthrough__bars">
        {phase.rangeBars.map(bar => (
          <LabRangeBar key={bar.key} {...bar} />
        ))}
      </div>

      <div className="walkthrough__question">
        <div className="walkthrough__question-label">Clinical Question</div>
        <p className="walkthrough__question-text">{phase.question.text}</p>
        <div className="rate-options">
          {phase.question.options.map((opt, i) => (
            <button
              key={i}
              className={`rate-option ${selected === i ? 'rate-option--selected' : ''} ${submitted ? (i === phase.question.correct ? 'rate-option--correct' : selected === i ? 'rate-option--wrong' : '') : ''}`}
              onClick={() => !submitted && setSelected(i)}
              disabled={submitted}
            >
              {opt}
            </button>
          ))}
        </div>

        {!submitted ? (
          <div className="walkthrough__actions">
            <button className="btn btn--primary" onClick={() => setSubmitted(true)} disabled={selected === null}>
              Submit Answer
            </button>
          </div>
        ) : (
          <div className={`feedback ${isCorrect ? 'feedback--correct' : 'feedback--wrong'}`}>
            <div className="feedback__icon">{isCorrect ? '✓' : '✗'}</div>
            <div className="feedback__body">
              <div className="feedback__title">{isCorrect ? 'Correct!' : 'Incorrect'}</div>
              <div className="feedback__explanation">{phase.question.explanation}</div>
            </div>
            <button className="btn btn--primary feedback__next" onClick={handleNext}>
              {isLast ? 'View Summary →' : 'Next Phase →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
