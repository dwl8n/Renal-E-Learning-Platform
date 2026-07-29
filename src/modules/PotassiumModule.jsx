import { useState } from 'react';
import { POTASSIUM_READING_PAGES } from '../data';
import { ReadingTask, StepOrder } from '../components/TaskKit';
import './FluidModule.css';
import './PotassiumModule.css';

const BATHS = ['3K', '2K', '1K'];

function correctBath(preK, currentBath) {
  if (preK < 3.0 || preK > 6.5) return 'notify';
  const col = BATHS.indexOf(currentBath);
  let row;
  if (preK <= 3.9) row = 0;
  else if (preK <= 4.7) row = 1;
  else if (preK <= 5.4) row = 2;
  else row = 3;
  const table = [['3K', '3K', '3K'], ['3K', '3K', '3K'], ['2K', '2K', '1K'], ['1K', '1K', '1K']];
  return table[row][col];
}

function rowLabelFor(preK) {
  if (preK < 3.0 || preK > 6.5) return 'Outside protocol';
  if (preK <= 3.9) return '3.9 mmol/L or less';
  if (preK <= 4.7) return '4.0 – 4.7 mmol/L';
  if (preK <= 5.4) return '4.8 – 5.4 mmol/L';
  return '5.5 mmol/L or greater';
}

const BATH_CASES = [
  { id: 1, name: 'Mr. R. Delgado', preK: 5.1, currentBath: '3K', note: 'Stable ICHD outpatient, 3×/week, chronic hemo order, no ileostomy.' },
  { id: 2, name: 'Ms. P. Kaur', preK: 6.2, currentBath: '2K', note: 'Missed a treatment over the weekend. On protocol.' },
  { id: 3, name: 'Mr. J. Ferreira', preK: 4.3, currentBath: '3K', note: 'Routine mid-week electrolytes. On protocol.' },
  { id: 4, name: 'Ms. L. Novak', preK: 6.8, currentBath: '1K', note: 'Reports poor appetite and cramping. On protocol.' },
  { id: 5, name: 'Mr. T. Bianchi', preK: 5.0, currentBath: '1K', note: 'Already on a 1K bath from a prior change. On protocol.' },
];

const PICKER_OPTIONS = ['3K', '2K', '1K', 'notify'];
const OPTION_LABEL = { '3K': '3K bath', '2K': '2K bath', '1K': '1K bath', notify: 'Notify nephrologist' };

const DOC_STEPS = [
  { id: 'bath', label: 'Change the acid concentrate programmed on the hemodialysis machine' },
  { id: 'obs', label: 'Observations → Bath Changed; Day Hemo Order' },
  { id: 'order', label: 'Orders for Treatment → written order referencing the medical directive' },
  { id: 'note', label: 'Progress Notes → Phrase Selection → "K Protocol"' },
  { id: 'lytes', label: 'Directives & Orders → "K Protocol FollowUp Lytes" (follow-up electrolytes next treatment)' },
];

function AdjustmentTable({ highlightK = null, highlightBath = null }) {
  const rows = [
    { label: '3.9 mmol/L or less', vals: ['3K', '3K', '3K'], test: (k) => k <= 3.9 && k >= 3.0 },
    { label: '4.0 – 4.7 mmol/L', vals: ['3K', '3K', '3K'], test: (k) => k >= 4.0 && k <= 4.7 },
    { label: '4.8 – 5.4 mmol/L', vals: ['2K', '2K', '1K'], test: (k) => k >= 4.8 && k <= 5.4 },
    { label: '5.5 mmol/L or greater', vals: ['1K', '1K', '1K'], test: (k) => k >= 5.5 && k <= 6.5 },
  ];
  const hlCol = highlightBath ? BATHS.indexOf(highlightBath) : -1;
  return (
    <div className="kadj">
      <div className="kadj__title">Dialysate Potassium Adjustment Table</div>
      <div className="kadj__grid">
        <div className="kadj__cell kadj__cell--corner">Pre-dialysis serum K⁺</div>
        {BATHS.map((b, i) => (
          <div key={b} className={`kadj__cell kadj__cell--head ${hlCol === i ? 'kadj__cell--col-hl' : ''}`}>Current: {b}</div>
        ))}
        {rows.map((r) => {
          const rowHl = highlightK != null && r.test(highlightK);
          return (
            <div key={r.label} style={{ display: 'contents' }}>
              <div className={`kadj__cell kadj__cell--row ${rowHl ? 'kadj__cell--row-hl' : ''}`}>{r.label}</div>
              {r.vals.map((v, i) => (
                <div key={i} className={`kadj__cell ${rowHl && hlCol === i ? 'kadj__cell--hit' : ''} ${rowHl ? 'kadj__cell--row-hl' : ''} ${hlCol === i ? 'kadj__cell--col-hl' : ''}`}>{v}</div>
              ))}
            </div>
          );
        })}
      </div>
      <div className="kadj__note">Notify nephrologist/provider if pre-dialysis serum potassium is &lt; 3.0 or &gt; 6.5 mmol/L. Applies to ICHD outpatients dialysing 3×/week only.</div>
    </div>
  );
}

function BathPicker({ done, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(!!done);

  const c = BATH_CASES[idx];
  const answer = correctBath(c.preK, c.currentBath);
  const isChange = answer !== 'notify' && answer !== c.currentBath;

  function next() {
    if (idx < BATH_CASES.length - 1) { setIdx(i => i + 1); setSelected(null); setSubmitted(false); }
    else { setAllDone(true); onComplete?.(); }
  }

  if (allDone) return (
    <div className="completion-screen fade-in">
      <div className="completion-screen__icon">✓</div>
      <h2>Task Complete</h2>
      <p><strong>Set the Dialysate Bath</strong> has been marked complete.</p>
      <button className="btn btn--outline btn--sm" onClick={() => { setAllDone(false); setIdx(0); setSelected(null); setSubmitted(false); }}>Review again</button>
    </div>
  );

  const explanation = answer === 'notify'
    ? `A pre-dialysis potassium of ${c.preK} mmol/L falls outside the protocol range (3.0–6.5). The correct action is to notify the nephrologist/provider — do not simply pick a bath.`
    : isChange
      ? `Row "${rowLabelFor(c.preK)}", current bath ${c.currentBath} → use a ${answer} bath for the remainder of this treatment. This is a change, so it must be documented and follow-up electrolytes drawn next treatment.`
      : `Row "${rowLabelFor(c.preK)}", current bath ${c.currentBath} → the table gives ${answer}. That's the same as the current prescription, so no change is needed this treatment.`;

  return (
    <div className="exercise fade-in">
      <div className="exercise__header">
        <h2>Set the Dialysate Bath</h2>
        <span className="exercise__progress">{idx + 1} / {BATH_CASES.length}</span>
      </div>
      <p className="exercise__instruction">Use the adjustment table to choose the correct acid concentrate for this treatment. Watch for values that fall outside the protocol.</p>
      <div className="scenario-card card">
        <div className="scenario-card__name">Patient: <strong>{c.name}</strong></div>
        <div className="kbath__vitals">
          <div className="kbath__vital"><span>Pre-dialysis K⁺</span><strong>{c.preK} mmol/L</strong></div>
          <div className="kbath__vital"><span>Current bath</span><strong>{c.currentBath}</strong></div>
        </div>
        <div className="scenario-hint"><span>Note:</span>{c.note}</div>
      </div>
      <AdjustmentTable highlightK={submitted ? c.preK : null} highlightBath={submitted ? c.currentBath : null} />
      <div className="exercise__label" style={{ marginTop: 18, marginBottom: 8 }}>Which acid concentrate should you use?</div>
      <div className="kbath__options">
        {PICKER_OPTIONS.map((opt) => (
          <button key={opt}
            className={`kbath__option ${selected === opt ? 'kbath__option--selected' : ''} ${submitted ? (opt === answer ? 'kbath__option--correct' : selected === opt ? 'kbath__option--wrong' : '') : ''} ${opt === 'notify' ? 'kbath__option--notify' : ''}`}
            onClick={() => !submitted && setSelected(opt)} disabled={submitted}>
            {OPTION_LABEL[opt]}
          </button>
        ))}
      </div>
      {!submitted ? (
        <button className="btn btn--primary" style={{ marginTop: 14 }} onClick={() => setSubmitted(true)} disabled={selected === null}>Submit</button>
      ) : (
        <div className={`feedback ${selected === answer ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{selected === answer ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{selected === answer ? 'Correct!' : 'Incorrect'}</div>
            <div className="feedback__explanation">{explanation}</div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={next}>{idx < BATH_CASES.length - 1 ? 'Next patient →' : 'Complete Task ✓'}</button>
        </div>
      )}
    </div>
  );
}

export default function PotassiumModule({ questId, onTaskComplete, taskProgress }) {
  const [activeTask, setActiveTask] = useState(0);
  const tasks = [
    { key: 'reading', label: 'Understanding the Protocol' },
    { key: 'bath-picker', label: 'Set the Dialysate Bath' },
    { key: 'documentation', label: 'Document the Change' },
  ];

  return (
    <div className="module-layout">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--task">Task</span>
          <h3 className="module-sidebar__title">Potassium Protocol</h3>
        </div>
        <div className="module-tasklist">
          {tasks.map((t, i) => {
            const doneT = taskProgress[t.key];
            return (
              <button key={t.key} className={`module-task-btn ${activeTask === i ? 'module-task-btn--active' : ''} ${doneT ? 'module-task-btn--done' : ''}`} onClick={() => setActiveTask(i)}>
                <span className={`check-icon ${doneT ? 'check-icon--done' : 'check-icon--todo'}`}>
                  {doneT ? '✓' : <span style={{ fontSize: 11, color: 'var(--text-300)' }}>{i + 1}</span>}
                </span>
                <span className="module-task-btn__label">{t.label}</span>
              </button>
            );
          })}
        </div>
        <div className="module-sidebar__formula card">
          <div className="module-formula-title">Escalation Limits</div>
          <div className="module-formula"><span className="module-formula__name">Notify if K &lt;</span><code>3.0</code></div>
          <div className="module-formula"><span className="module-formula__name">Notify if K &gt;</span><code>6.5</code></div>
          <div className="module-formula__limit">Outside these limits: call the nephrologist</div>
        </div>
      </aside>

      <main className="module-content">
        {tasks[activeTask].key === 'reading' && (
          <ReadingTask pages={POTASSIUM_READING_PAGES} done={taskProgress['reading']} onComplete={() => onTaskComplete(questId, 'reading')} />
        )}
        {tasks[activeTask].key === 'bath-picker' && (
          <BathPicker done={taskProgress['bath-picker']} onComplete={() => onTaskComplete(questId, 'bath-picker')} />
        )}
        {tasks[activeTask].key === 'documentation' && (
          <StepOrder
            title="Document the Change"
            instruction={'You have made an initial acid-concentrate change. Build the documentation checklist in the correct order — click a step to add it.'}
            steps={DOC_STEPS}
            correctExplanation="The order is: change the bath on the machine first, then record the observation (Bath Changed / Day Hemo Order), write the order referencing the directive, add the K Protocol progress note, and finally order the follow-up electrolytes for next treatment."
            wrongExplanation="Review the sequence — the machine change comes first, and the follow-up electrolytes order comes last."
            done={taskProgress['documentation']}
            onComplete={() => onTaskComplete(questId, 'documentation')}
          />
        )}
      </main>
    </div>
  );
}
