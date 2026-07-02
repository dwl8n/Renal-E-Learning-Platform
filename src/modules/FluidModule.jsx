import { useState } from 'react';
import { useApp } from '../context';
import { QUESTS, UF_VOLUME_SCENARIOS, UF_RATE_SCENARIOS, COMBINED_SCENARIOS, FLUID_READING_PAGES } from '../data';
import { LinkedText } from '../utils/linkGlossary';
import './FluidModule.css';

export default function FluidModule({ questId, onTaskComplete, taskProgress }) {
  const [activeTask, setActiveTask] = useState(0);
  const tasks = [
    { key: 'reading', label: 'Overview of Fluid Assessment', type: 'reading' },
    { key: 'uf-volume', label: 'Calculating Ultrafiltration Volume', type: 'exercise-uf' },
    { key: 'uf-rate', label: 'Fluid Removal Rate Check', type: 'exercise-rate' },
    { key: 'worksheet', label: 'Worksheet Practice', type: 'exercise-combined' },
  ];

  return (
    <div className="module-layout">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--task">Task</span>
          <h3 className="module-sidebar__title">Fluid Volume Calculation</h3>
        </div>
        <div className="module-tasklist">
          {tasks.map((t, i) => {
            const done = taskProgress[t.key];
            return (
              <button
                key={t.key}
                className={`module-task-btn ${activeTask === i ? 'module-task-btn--active' : ''} ${done ? 'module-task-btn--done' : ''}`}
                onClick={() => setActiveTask(i)}
              >
                <span className={`check-icon ${done ? 'check-icon--done' : 'check-icon--todo'}`}>
                  {done ? '✓' : <span style={{fontSize:11,color:'var(--text-300)'}}>{i + 1}</span>}
                </span>
                <span className="module-task-btn__label">{t.label}</span>
              </button>
            );
          })}
        </div>
        <div className="module-sidebar__formula card">
          <div className="module-formula-title">Reference Formulas</div>
          <div className="module-formula"><span className="module-formula__name">UF Volume</span><code>(Pre-wt − Dry-wt) × 1000</code></div>
          <div className="module-formula"><span className="module-formula__name">UF Rate</span><code>UF Vol ÷ Time (hr)</code></div>
          <div className="module-formula"><span className="module-formula__name">Rate/kg</span><code>UF Rate ÷ Dry-wt (kg)</code></div>
          <div className="module-formula__limit">Safe limit: ≤ 13 mL/kg/hr</div>
        </div>
      </aside>

      <main className="module-content">
        {tasks[activeTask].type === 'reading' && (
          <ReadingTask
            pages={FLUID_READING_PAGES}
            done={taskProgress['reading']}
            onComplete={() => onTaskComplete(questId, 'reading')}
          />
        )}
        {tasks[activeTask].type === 'exercise-uf' && (
          <UFVolumeExercise
            scenarios={UF_VOLUME_SCENARIOS}
            done={taskProgress['uf-volume']}
            onComplete={() => onTaskComplete(questId, 'uf-volume')}
          />
        )}
        {tasks[activeTask].type === 'exercise-rate' && (
          <UFRateExercise
            scenarios={UF_RATE_SCENARIOS}
            done={taskProgress['uf-rate']}
            onComplete={() => onTaskComplete(questId, 'uf-rate')}
          />
        )}
        {tasks[activeTask].type === 'exercise-combined' && (
          <CombinedExercise
            scenarios={COMBINED_SCENARIOS}
            done={taskProgress['worksheet']}
            onComplete={() => onTaskComplete(questId, 'worksheet')}
          />
        )}
      </main>
    </div>
  );
}

function ReadingTask({ pages, done, onComplete }) {
  const { dispatch } = useApp();
  const [pageIdx, setPageIdx] = useState(0);
  const page = pages[pageIdx];
  const isLast = pageIdx === pages.length - 1;

  const openJournal = (target) => dispatch({ type: 'JOURNAL_OPEN', target });

  return (
    <div className="reading-task fade-in">
      <div className="reading-task__header">
        <h2>{page.title}</h2>
        <span className="reading-task__page">{pageIdx + 1} / {pages.length}</span>
      </div>
      {page.sections.map((section, i) => (
        <div key={i} className="reading-section">
          <h3 className="reading-section__heading">{section.heading}</h3>
          <p className="reading-section__body">
            <LinkedText text={section.body} onOpen={openJournal} />
          </p>
        </div>
      ))}
      <div className="reading-task__actions">
        {pageIdx > 0 && (
          <button className="btn btn--outline" onClick={() => setPageIdx(p => p - 1)}>← Previous</button>
        )}
        <div style={{flex:1}} />
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

function UFVolumeExercise({ scenarios, done, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [allDone, setAllDone] = useState(done);
  const scenario = scenarios[idx];

  function check() {
    const val = parseInt(input.replace(/[^0-9]/g, ''), 10);
    const correct = Math.abs(val - scenario.answer) <= 50;
    setResult({ correct, val });
  }

  function next() {
    if (idx < scenarios.length - 1) {
      setIdx(i => i + 1);
      setInput('');
      setResult(null);
    } else {
      setAllDone(true);
      onComplete();
    }
  }

  if (allDone) return <CompletionScreen title="Calculating Ultrafiltration Volume" onReview={() => setAllDone(false)} />;

  return (
    <div className="exercise fade-in">
      <div className="exercise__header">
        <h2>Calculating Ultrafiltration Volume</h2>
        <span className="exercise__progress">{idx + 1} / {scenarios.length}</span>
      </div>
      <p className="exercise__instruction">
        Given the patient's pre-dialysis weight and dry weight, calculate the UF volume in <strong>mL</strong>.
      </p>
      <div className="scenario-card card">
        <div className="scenario-card__name">Patient: <strong>{scenario.patientName}</strong> &nbsp;·&nbsp; Age: {scenario.age}</div>
        <div className="scenario-card__values">
          <div className="scenario-value"><span>Pre-dialysis weight</span><strong>{scenario.preDx} kg</strong></div>
          <div className="scenario-value"><span>Dry weight</span><strong>{scenario.dryWeight} kg</strong></div>
          <div className="scenario-value"><span>Difference</span><strong>{(scenario.preDx - scenario.dryWeight).toFixed(1)} kg</strong></div>
        </div>
        <div className="scenario-hint"><span>Hint:</span> {scenario.hint}</div>
      </div>

      {!result ? (
        <div className="exercise__input-group">
          <label className="exercise__label">UF Volume (mL)</label>
          <div className="exercise__input-row">
            <input
              type="number"
              className="exercise__input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter answer..."
              onKeyDown={e => e.key === 'Enter' && input && check()}
            />
            <span className="exercise__unit">mL</span>
            <button className="btn btn--primary" onClick={check} disabled={!input}>Check</button>
          </div>
        </div>
      ) : (
        <div className={`feedback ${result.correct ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{result.correct ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{result.correct ? 'Correct!' : `Incorrect — you entered ${result.val.toLocaleString()} mL`}</div>
            <div className="feedback__explanation">
              <strong>Answer: {scenario.answer.toLocaleString()} mL</strong> — {scenario.explanation}
            </div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={next}>
            {idx < scenarios.length - 1 ? 'Next Scenario →' : 'Complete Task ✓'}
          </button>
        </div>
      )}
    </div>
  );
}

function UFRateExercise({ scenarios, done, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(done);
  const scenario = scenarios[idx];

  function submit() { setSubmitted(true); }

  function next() {
    if (idx < scenarios.length - 1) {
      setIdx(i => i + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setAllDone(true);
      onComplete();
    }
  }

  if (allDone) return <CompletionScreen title="Fluid Removal Rate Check" onReview={() => setAllDone(false)} />;

  const correct = selected === scenario.answer;

  return (
    <div className="exercise fade-in">
      <div className="exercise__header">
        <h2>Fluid Removal Rate Check</h2>
        <span className="exercise__progress">{idx + 1} / {scenarios.length}</span>
      </div>
      <p className="exercise__instruction">
        Given the UF volume and treatment time, calculate the UF rate per kg and determine whether it is within the safe limit (≤ 13 mL/kg/hr).
      </p>
      <div className="scenario-card card">
        <div className="scenario-card__name">Patient: <strong>{scenario.patientName}</strong></div>
        <div className="scenario-card__values">
          <div className="scenario-value"><span>Dry weight</span><strong>{scenario.dryWeight} kg</strong></div>
          <div className="scenario-value"><span>UF Volume</span><strong>{scenario.ufVolume.toLocaleString()} mL</strong></div>
          <div className="scenario-value"><span>Treatment time</span><strong>{scenario.treatmentHrs} hr</strong></div>
        </div>
      </div>
      <div className="exercise__label" style={{marginBottom:10}}>Is this UF rate within safe limits?</div>
      <div className="rate-options">
        <button
          className={`rate-option ${selected === 'safe' ? 'rate-option--selected' : ''} ${submitted ? (scenario.answer === 'safe' ? 'rate-option--correct' : selected === 'safe' ? 'rate-option--wrong' : '') : ''}`}
          onClick={() => !submitted && setSelected('safe')}
          disabled={submitted}
        >
          ✓ Safe — proceed with treatment
        </button>
        <button
          className={`rate-option ${selected === 'unsafe' ? 'rate-option--selected' : ''} ${submitted ? (scenario.answer === 'unsafe' ? 'rate-option--correct' : selected === 'unsafe' ? 'rate-option--wrong' : '') : ''}`}
          onClick={() => !submitted && setSelected('unsafe')}
          disabled={submitted}
        >
          ✗ Unsafe — notify physician
        </button>
      </div>

      {!submitted ? (
        <button className="btn btn--primary" style={{marginTop:16}} onClick={submit} disabled={!selected}>Submit</button>
      ) : (
        <div className={`feedback ${correct ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{correct ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{correct ? 'Correct!' : 'Incorrect'}</div>
            <div className="feedback__explanation">
              <strong>UF Rate: {scenario.ufRate.toLocaleString()} mL/hr ({scenario.ratePerKg} mL/kg/hr)</strong><br/>
              {scenario.explanation}
            </div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={next}>
            {idx < scenarios.length - 1 ? 'Next Scenario →' : 'Complete Task ✓'}
          </button>
        </div>
      )}
    </div>
  );
}

function CombinedExercise({ scenarios, done, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [ufInput, setUfInput] = useState('');
  const [rateSelected, setRateSelected] = useState(null);
  const [step, setStep] = useState(1); // 1 = uf vol, 2 = uf rate
  const [ufResult, setUfResult] = useState(null);
  const [rateSubmitted, setRateSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(done);
  const scenario = scenarios[idx];

  function checkUF() {
    const val = parseInt(ufInput.replace(/[^0-9]/g, ''), 10);
    const correct = Math.abs(val - scenario.ufAnswer) <= 100;
    setUfResult({ correct, val });
  }

  function proceedToRate() { setStep(2); }

  function submitRate() { setRateSubmitted(true); }

  function next() {
    if (idx < scenarios.length - 1) {
      setIdx(i => i + 1);
      setUfInput(''); setRateSelected(null);
      setStep(1); setUfResult(null); setRateSubmitted(false);
    } else {
      setAllDone(true);
      onComplete();
    }
  }

  if (allDone) return <CompletionScreen title="Worksheet Practice" onReview={() => setAllDone(false)} />;

  const rateCorrect = rateSelected === scenario.ufRateAnswer;

  return (
    <div className="exercise fade-in">
      <div className="exercise__header">
        <h2>Worksheet Practice</h2>
        <span className="exercise__progress">{idx + 1} / {scenarios.length}</span>
      </div>
      <p className="exercise__instruction">Multi-step scenario: calculate UF volume, then assess whether the rate is safe.</p>
      <div className="scenario-card card">
        <div className="scenario-card__name">Patient: <strong>{scenario.patientName}</strong> · Age {scenario.age}</div>
        <div className="scenario-card__values">
          <div className="scenario-value"><span>Pre-dialysis weight</span><strong>{scenario.preDx} kg</strong></div>
          <div className="scenario-value"><span>Dry weight</span><strong>{scenario.dryWeight} kg</strong></div>
          <div className="scenario-value"><span>Treatment time</span><strong>{scenario.treatmentHrs} hr</strong></div>
        </div>
      </div>

      {/* Step 1: UF Volume */}
      <div className={`combined-step ${step >= 1 ? '' : 'combined-step--inactive'}`}>
        <div className="combined-step__label">Step 1: Calculate UF Volume (mL)</div>
        {!ufResult ? (
          <div className="exercise__input-row">
            <input type="number" className="exercise__input" value={ufInput} onChange={e => setUfInput(e.target.value)} placeholder="UF Volume in mL..." onKeyDown={e => e.key === 'Enter' && ufInput && checkUF()} />
            <span className="exercise__unit">mL</span>
            <button className="btn btn--primary btn--sm" onClick={checkUF} disabled={!ufInput}>Check</button>
          </div>
        ) : (
          <div className={`feedback feedback--sm ${ufResult.correct ? 'feedback--correct' : 'feedback--wrong'}`}>
            <span>{ufResult.correct ? '✓ Correct' : `✗ ${ufResult.val.toLocaleString()} mL — correct: ${scenario.ufAnswer.toLocaleString()} mL`}</span>
            {!rateSubmitted && step < 2 && <button className="btn btn--sm btn--outline" onClick={proceedToRate}>Continue to Step 2 →</button>}
          </div>
        )}
      </div>

      {/* Step 2: UF Rate Safety */}
      {step >= 2 && (
        <div className="combined-step">
          <div className="combined-step__label">Step 2: Is the UF rate within safe limits?</div>
          <div className="rate-options">
            <button className={`rate-option ${rateSelected === 'safe' ? 'rate-option--selected' : ''} ${rateSubmitted ? (scenario.ufRateAnswer === 'safe' ? 'rate-option--correct' : rateSelected === 'safe' ? 'rate-option--wrong' : '') : ''}`} onClick={() => !rateSubmitted && setRateSelected('safe')} disabled={rateSubmitted}>✓ Safe</button>
            <button className={`rate-option ${rateSelected === 'unsafe' ? 'rate-option--selected' : ''} ${rateSubmitted ? (scenario.ufRateAnswer === 'unsafe' ? 'rate-option--correct' : rateSelected === 'unsafe' ? 'rate-option--wrong' : '') : ''}`} onClick={() => !rateSubmitted && setRateSelected('unsafe')} disabled={rateSubmitted}>✗ Unsafe — notify physician</button>
          </div>
          {!rateSubmitted ? (
            <button className="btn btn--primary btn--sm" style={{marginTop:12}} onClick={submitRate} disabled={!rateSelected}>Submit</button>
          ) : (
            <div className={`feedback ${rateCorrect ? 'feedback--correct' : 'feedback--wrong'}`}>
              <div className="feedback__icon">{rateCorrect ? '✓' : '✗'}</div>
              <div className="feedback__body">
                <div className="feedback__title">{rateCorrect ? 'Correct!' : 'Incorrect'}</div>
                <div className="feedback__explanation" style={{whiteSpace:'pre-line'}}>{scenario.explanation}</div>
              </div>
              <button className="btn btn--primary feedback__next" onClick={next}>{idx < scenarios.length - 1 ? 'Next →' : 'Complete Task ✓'}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompletionScreen({ title, onReview }) {
  return (
    <div className="completion-screen fade-in">
      <div className="completion-screen__icon">✓</div>
      <h2>Task Complete</h2>
      <p><strong>{title}</strong> has been marked as complete.</p>
      <button className="btn btn--outline btn--sm" onClick={onReview}>Review again</button>
    </div>
  );
}
