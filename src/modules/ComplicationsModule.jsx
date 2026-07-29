import { useState } from 'react';
import { COMPLICATIONS_READING_PAGES } from '../data';
import { ReadingTask, ScenarioSet } from '../components/TaskKit';
import './FluidModule.css';

// Each case is a short patient story told across sequential questions — the
// context (patient + stem) repeats per step while the question/options change,
// matching ScenarioSet's one-question-per-entry shape.
const HYPOTENSION_CASE = {
  title: 'Case: Hypotension',
  scenarios: [
    {
      title: 'Step 1',
      context: 'Mrs. G. Alvarez, 71. Two and a half hours into a 4-hour treatment, she becomes pale, yawns repeatedly, and says she feels dizzy and nauseated. Her blood pressure has dropped from 138/76 to 88/50. UF is running at 850 mL/hr.',
      question: 'What is your FIRST action?',
      options: ['Increase the UF rate to finish the treatment quickly', 'Reduce or stop ultrafiltration and lay the patient flat / Trendelenburg', 'Discontinue the treatment immediately and remove the patient', 'Give an antiemetic and continue as planned'],
      correct: 1,
      explanation: 'Reduce or stop UF and reposition (flat or head-down / Trendelenburg) to improve venous return. This is the classic first response to intradialytic hypotension.',
    },
    {
      title: 'Step 2',
      context: 'Mrs. G. Alvarez, 71. Her BP is still low after repositioning and reducing UF.',
      question: 'What next?',
      options: ['Administer a normal saline bolus as ordered and reassess', 'Restart UF at the original rate right away', 'Give her oral fluids to drink', 'Do nothing further — it will correct on its own'],
      correct: 0,
      explanation: 'A saline bolus per unit protocol restores intravascular volume. Reassess after. Only resume UF cautiously — at a lower rate — once she has recovered.',
    },
    {
      title: 'Step 3',
      context: 'Mrs. G. Alvarez, 71. She recovers after the saline bolus.',
      question: 'Which contributing factor is worth reviewing?',
      options: ['Whether her dry weight target may be set too low, or antihypertensives taken pre-treatment', 'Whether the dialysate temperature was too low', 'Whether her potassium bath was too high', 'Whether the blood flow rate was set too low'],
      correct: 0,
      explanation: 'Recurrent IDH often traces back to a dry weight target set too low, a large fluid removal goal, eating during treatment, or antihypertensive timing.',
    },
  ],
};

const CRAMPS_CASE = {
  title: 'Case: Muscle Cramps',
  scenarios: [
    {
      title: 'Step 1',
      context: 'Mr. D. Osei, 59. In the final hour of treatment he develops severe cramping in both calves. He has already had 3.6 L removed toward a 3.8 L goal and tells you this happens "every time near the end."',
      question: 'What is the most appropriate first action?',
      options: ['Increase UF to finish before the cramps worsen', 'Reduce the UF rate and give a fluid bolus (saline as ordered)', 'Massage the legs and continue at the same UF rate', 'Discontinue immediately and send him home'],
      correct: 1,
      explanation: 'Cramps late in treatment are usually driven by aggressive fluid removal and approaching dry weight too quickly. Reduce the UF rate and give a fluid bolus per protocol.',
    },
    {
      title: 'Step 2',
      context: 'Mr. D. Osei, 59. He says this happens most treatments near the end.',
      question: 'What should be reviewed?',
      options: ['His dry weight target — it may be set too low', 'His dialyzer size', 'His blood flow rate only', 'Nothing — cramps are unavoidable'],
      correct: 0,
      explanation: 'Repeated end-of-treatment cramping is a flag that the dry weight target may be too low or the removal goal too large. Raise it with the team.',
    },
  ],
};

const AIR_EMBOLISM_CASE = {
  title: 'Case: Air Embolism',
  emergency: true,
  scenarios: [
    {
      title: 'Step 1 — EMERGENCY',
      context: 'Ms. R. Lindqvist, 64. You notice the venous line has partially disconnected and she suddenly gasps, complains of chest pain and shortness of breath, and begins coughing. You suspect air has entered the circuit.',
      question: 'What is your IMMEDIATE action?',
      options: ['Reduce the UF rate and reassess in a few minutes', 'Clamp the venous line and STOP the blood pump immediately', 'Give a saline bolus and continue the treatment', 'Lay the patient flat on their back and wait'],
      correct: 1,
      explanation: 'Air embolism is a true emergency. Clamp the venous line and stop the blood pump at once to prevent any further air entering the bloodstream.',
    },
    {
      title: 'Step 2 — EMERGENCY',
      context: 'Ms. R. Lindqvist, 64. The blood pump is stopped and the venous line is clamped.',
      question: 'How should you position the patient?',
      options: ['Sitting fully upright', 'Right side, head up', 'LEFT side with the head down (left lateral Trendelenburg)', 'Prone (face down)'],
      correct: 2,
      explanation: 'Position on the LEFT side with head down. This traps air in the right ventricle, preventing it from moving into the pulmonary circulation and brain.',
    },
    {
      title: 'Step 3 — EMERGENCY',
      context: 'Ms. R. Lindqvist, 64. She is positioned left lateral Trendelenburg.',
      question: 'What else do you do right away?',
      options: ['Administer 100% oxygen, call for help / initiate emergency response, and stay with the patient', 'Document the event and finish your other patients first', 'Restart the pump slowly to clear the air', 'Give oral fluids and monitor'],
      correct: 0,
      explanation: 'Give 100% oxygen, call for help / activate the emergency response, and stay with the patient monitoring vitals.',
    },
  ],
};

const TRIAGE_OPTIONS = ['Hypotension', 'Muscle cramps', 'Air embolism', 'Suspected infection'];
const TRIAGE_CASE = {
  title: 'Rapid Recognition',
  scenarios: [
    { context: 'Pale, yawning, dizzy, BP 86/48, nauseated late in treatment.', question: 'Most likely complication?', options: TRIAGE_OPTIONS, correct: 0, explanation: 'This cue cluster is the everyday signature of hypotension at the dialysis chair.' },
    { context: 'Sudden chest pain, shortness of breath, coughing after a line disconnects.', question: 'Most likely complication?', options: TRIAGE_OPTIONS, correct: 2, explanation: 'This cue cluster is the everyday signature of air embolism at the dialysis chair.' },
    { context: 'Severe calf tightening in the last hour after a large fluid removal goal.', question: 'Most likely complication?', options: TRIAGE_OPTIONS, correct: 1, explanation: 'This cue cluster is the everyday signature of muscle cramps at the dialysis chair.' },
    { context: 'Fever and rigors during treatment in a patient with a central venous catheter.', question: 'Most likely complication?', options: TRIAGE_OPTIONS, correct: 3, explanation: 'This cue cluster is the everyday signature of suspected infection at the dialysis chair.' },
    { context: 'BP drops with nausea and a feeling of warmth after too-rapid UF.', question: 'Most likely complication?', options: TRIAGE_OPTIONS, correct: 0, explanation: 'This cue cluster is the everyday signature of hypotension at the dialysis chair.' },
  ],
};

export default function ComplicationsModule({ questId, onTaskComplete, taskProgress }) {
  const [activeTask, setActiveTask] = useState(0);
  const tasks = [
    { key: 'reading', label: 'Complications Overview' },
    { key: 'hypotension', label: 'Case: Hypotension' },
    { key: 'cramps', label: 'Case: Muscle Cramps' },
    { key: 'air-embolism', label: 'Case: Air Embolism' },
    { key: 'triage', label: 'Rapid Recognition' },
  ];

  return (
    <div className="module-layout">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--mixed">Practice</span>
          <h3 className="module-sidebar__title">Complications &amp; Monitoring</h3>
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
          <div className="module-formula-title">First-Response Pattern</div>
          <div className="module-formula"><span className="module-formula__name">1</span><code>Reduce / stop UF</code></div>
          <div className="module-formula"><span className="module-formula__name">2</span><code>Support circulation</code></div>
          <div className="module-formula"><span className="module-formula__name">3</span><code>Reassess</code></div>
          <div className="module-formula"><span className="module-formula__name">4</span><code>Escalate if severe</code></div>
          <div className="module-formula__limit">Air embolism = immediate emergency</div>
        </div>
      </aside>

      <main className="module-content">
        {tasks[activeTask].key === 'reading' && (
          <ReadingTask pages={COMPLICATIONS_READING_PAGES} done={taskProgress['reading']} onComplete={() => onTaskComplete(questId, 'reading')} />
        )}
        {tasks[activeTask].key === 'hypotension' && (
          <ScenarioSet {...HYPOTENSION_CASE} done={taskProgress['hypotension']} onComplete={() => onTaskComplete(questId, 'hypotension')} />
        )}
        {tasks[activeTask].key === 'cramps' && (
          <ScenarioSet {...CRAMPS_CASE} done={taskProgress['cramps']} onComplete={() => onTaskComplete(questId, 'cramps')} />
        )}
        {tasks[activeTask].key === 'air-embolism' && (
          <ScenarioSet {...AIR_EMBOLISM_CASE} done={taskProgress['air-embolism']} onComplete={() => onTaskComplete(questId, 'air-embolism')} />
        )}
        {tasks[activeTask].key === 'triage' && (
          <ScenarioSet {...TRIAGE_CASE} done={taskProgress['triage']} onComplete={() => onTaskComplete(questId, 'triage')} />
        )}
      </main>
    </div>
  );
}
