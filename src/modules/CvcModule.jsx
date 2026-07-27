import { useState } from 'react';
import { CVC_READING_PAGES } from '../data';
import { ReadingTask, StepOrder, ScenarioSet, DocForm } from '../components/TaskKit';
import '../modules/FluidModule.css';

// ─── Task 2: Connection sequence ──────────────────────────────────────────────
const CONNECT_STEPS = [
  { id: 'hygiene1', icon: '🧼', label: 'Perform hand hygiene', detail: '' },
  { id: 'assess', icon: '🔍', label: 'Assess exit site and dressing', detail: 'Redness, warmth, tenderness, drainage' },
  { id: 'mask', icon: '😷', label: 'Patient and nurse apply masks', detail: '' },
  { id: 'hygiene2', icon: '🧤', label: 'Hand hygiene + don clean gloves', detail: '' },
  { id: 'clamp', icon: '🔒', label: 'Clamp both catheter lumens', detail: 'Before removing caps' },
  { id: 'declamp', icon: '🧴', label: 'Remove caps, cleanse hubs with antiseptic', detail: 'Scrub the hub — don\'t just wipe' },
  { id: 'aspirate', icon: '🩸', label: 'Aspirate and discard the priming volume', detail: 'Clears any heparin lock' },
  { id: 'flush', icon: '💧', label: 'Flush both lumens with saline', detail: '' },
  { id: 'connectlines', icon: '🔗', label: 'Connect arterial and venous bloodlines', detail: '' },
];

// ─── Task 3: Complication scenarios ───────────────────────────────────────────
const CVC_SCENARIOS = [
  {
    id: 'exit', title: 'Scenario A',
    context: 'Before connecting, you notice the exit site is red, warm, and tender. No fever or chills.',
    question: 'What should you do?',
    options: [
      'Document and monitor at the next visit',
      'Cover with a fresh dressing and proceed as normal',
      'Report and have the site assessed before initiating treatment',
      'Flush with heparin and reassess after treatment',
    ],
    correct: 2,
    explanation: 'Any sign of local infection at a CVC exit site needs to be reported and assessed before treatment starts through that line — not simply documented or covered.',
  },
  {
    id: 'noflow', title: 'Scenario B',
    context: "You attempt to aspirate from the arterial lumen and get little to no blood return, though the venous lumen aspirates normally.",
    question: 'What does this most likely indicate?',
    options: [
      'The catheter is functioning normally — proceed',
      'Possible catheter malfunction (thrombus, fibrin sheath, or malposition) — do not force it',
      'The patient needs a saline bolus immediately',
      'This is expected and resolves after flushing',
    ],
    correct: 1,
    explanation: "Poor aspiration from one lumen suggests a mechanical problem — a clot, fibrin sheath, or catheter malposition. Forcing flow can dislodge a clot; escalate instead of proceeding.",
  },
  {
    id: 'fever', title: 'Scenario C',
    context: 'Fifteen minutes into treatment, the patient develops a fever and chills. The exit site looks unremarkable.',
    question: 'What is the priority concern?',
    options: [
      'A normal reaction to treatment — continue and monitor',
      'Possible catheter-related bloodstream infection — notify the physician promptly',
      'The dialysate temperature is likely too high',
      'This is unrelated to the CVC since the exit site looks normal',
    ],
    correct: 1,
    explanation: "Fever and chills during or shortly after connecting to a CVC — even with a normal-looking exit site — raises concern for catheter-related bacteremia. This needs prompt physician notification, not routine monitoring.",
  },
];

export default function CvcModule({ questId, onTaskComplete, taskProgress }) {
  const [activeTask, setActiveTask] = useState(0);
  const tasks = [
    { key: 'reading',            label: 'CVC Types & Assessment' },
    { key: 'connect-checklist',  label: 'Connection Sequence' },
    { key: 'complications',      label: 'Complication Scenarios' },
    { key: 'documentation',      label: 'Chart the Assessment' },
  ];

  return (
    <div className="module-layout">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--task">Practice</span>
          <h3 className="module-sidebar__title">CVC Access</h3>
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
                  {done ? '✓' : <span style={{ fontSize: 11, color: 'var(--text-300)' }}>{i + 1}</span>}
                </span>
                <span className="module-task-btn__label">{t.label}</span>
              </button>
            );
          })}
        </div>
        <div className="module-sidebar__formula card">
          <div className="module-formula-title">Escalate If</div>
          <div className="module-formula"><span className="module-formula__name">Exit site</span><code>Red / warm / tender</code></div>
          <div className="module-formula"><span className="module-formula__name">Systemic</span><code>Fever / chills</code></div>
          <div className="module-formula__limit">Assess before initiating treatment</div>
        </div>
      </aside>

      <main className="module-content">
        {tasks[activeTask].key === 'reading' && (
          <ReadingTask pages={CVC_READING_PAGES} done={taskProgress['reading']} onComplete={() => onTaskComplete(questId, 'reading')} />
        )}
        {tasks[activeTask].key === 'connect-checklist' && (
          <StepOrder
            title="Connection Sequence"
            instruction="Place the steps of connecting a patient to a CVC in the order you would perform them."
            steps={CONNECT_STEPS}
            correctExplanation="Assessment and hand hygiene come first, hubs are cleansed before aspirating, and both lumens are flushed before the bloodlines connect. This order protects against infection and confirms the line is functioning."
            wrongExplanation="Steps in red are out of place. Remember: the exit site is assessed before you touch the caps, and hubs are cleansed before aspirating or flushing."
            done={taskProgress['connect-checklist']}
            onComplete={() => onTaskComplete(questId, 'connect-checklist')}
          />
        )}
        {tasks[activeTask].key === 'complications' && (
          <ScenarioSet title="Complication Scenarios" scenarios={CVC_SCENARIOS}
            done={taskProgress['complications']} onComplete={() => onTaskComplete(questId, 'complications')} />
        )}
        {tasks[activeTask].key === 'documentation' && (
          <DocForm
            title="Chart the Assessment"
            scenario="You assess Ms. Patel's tunnelled CVC before connecting: exit site clean and dry, no redness or tenderness, both lumens aspirate and flush without resistance."
            fields={[
              { key: 'catheterType', label: 'Catheter type', type: 'select', options: ['Tunnelled', 'Non-tunnelled', 'AVF'], correct: 'Tunnelled', hint: 'The scenario specifies a tunnelled catheter.' },
              { key: 'exitSite', label: 'Exit site', type: 'select', options: ['Clean, dry, intact', 'Redness noted', 'Drainage present'], correct: 'Clean, dry, intact', hint: 'No abnormal findings were described at the exit site.' },
              { key: 'aspiration', label: 'Aspiration/flush', type: 'select', options: ['Normal — no resistance', 'Poor return — arterial lumen', 'Poor return — venous lumen'], correct: 'Normal — no resistance', hint: 'Both lumens aspirated and flushed without resistance.' },
              { key: 'plan', label: 'Plan', type: 'select', options: ['Proceed with treatment', 'Escalate before initiating treatment'], correct: 'Proceed with treatment', hint: 'All findings are normal — safe to proceed.' },
            ]}
            done={taskProgress['documentation']}
            onComplete={() => onTaskComplete(questId, 'documentation')}
          />
        )}
      </main>
    </div>
  );
}
