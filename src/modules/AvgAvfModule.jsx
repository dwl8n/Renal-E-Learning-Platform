import { useState } from 'react';
import { AVF_READING_PAGES } from '../data';
import { ReadingTask, ScenarioSet, StepOrder, DocForm } from '../components/TaskKit';
import '../modules/FluidModule.css';

// ─── Task 2: Look, Listen, Feel assessment scenarios ──────────────────────────
// Pays off the "abnormal thrill feels like a pulse" hook planted in the
// Vascular Access pre-assessment (courseData.js m-vascular-access).
const ASSESS_SCENARIOS = [
  {
    id: 'thrill', title: 'Assessment 1',
    context: "You palpate a mature AVF before cannulation. It feels like a strong, distinct pulse rather than a gentle vibration.",
    question: 'What does this finding suggest?',
    options: [
      'A healthy, well-perfused access — proceed with cannulation',
      'Turbulent flow through a narrowed segment (stenosis) — escalate before proceeding',
      'The access has matured further than expected — this is a good sign',
      'A normal finding for grafts, but escalate if it were a fistula',
    ],
    correct: 1,
    explanation: 'A pulse-like thrill is a classic trap — it feels reassuring but usually means blood is being forced through a narrowed segment. A healthy thrill is a gentle buzzing or vibration. Escalate rather than cannulate.',
  },
  {
    id: 'bruit', title: 'Assessment 2',
    context: "On auscultation, the bruit is high-pitched and stops and starts, rather than a continuous low-pitched whoosh.",
    question: 'How should you interpret this?',
    options: [
      'This is the expected sound of a mature fistula',
      'This is an abnormal bruit — same underlying cause as an abnormal thrill: possible stenosis',
      'This only matters if the patient also reports pain',
      'High-pitched sounds indicate excellent blood flow',
    ],
    correct: 1,
    explanation: 'A high-pitched, discontinuous bruit and a pulse-like thrill share the same cause — turbulent flow through a narrowing. Either finding alone is enough to escalate before cannulating.',
  },
  {
    id: 'swelling', title: 'Assessment 3',
    context: "You compare both arms and notice new swelling in the access arm, extending past the elbow. The thrill and bruit are both normal.",
    question: "What's the most appropriate next step?",
    options: [
      'Proceed — the thrill and bruit are the only findings that matter',
      'Document the swelling and reassess next visit',
      'Escalate — new swelling can indicate central vein stenosis even with a normal thrill/bruit',
      'Apply a compression wrap and proceed',
    ],
    correct: 2,
    explanation: "A normal thrill and bruit don't rule out every complication. New or worsening swelling — especially extending up the arm — can indicate central vein stenosis and needs escalation on its own.",
  },
];

// ─── Task 3: Site selection scenarios ─────────────────────────────────────────
const SITE_SCENARIOS = [
  {
    id: 'site1', title: 'Site 1',
    context: 'You plan an arterial cannulation site 1.5 cm from the anastomosis on a fistula.',
    question: 'Is this an appropriate site?',
    options: [
      'Yes — closer to the anastomosis means better flow',
      'No — sites should be at least 2.5 cm from the anastomosis to protect it',
      'Yes, as long as the venous site is far away',
      'No — arterial sites should always be at the anastomosis itself',
    ],
    correct: 1,
    explanation: 'Cannulating too close to the anastomosis risks damaging it. Keep at least 2.5 cm of distance.',
  },
  {
    id: 'site2', title: 'Site 2',
    context: 'Your planned arterial and venous sites are 3 cm apart along the same fistula.',
    question: 'Is this spacing appropriate?',
    options: [
      'Yes, any spacing along the same vessel is fine',
      'No — arterial and venous sites should be at least 5 cm apart to reduce recirculation',
      'Yes, closer spacing improves dialysis efficiency',
      'No — they must always be on opposite arms',
    ],
    correct: 1,
    explanation: 'Sites closer than 5 cm apart increase recirculation — dialyzed blood re-entering the circuit before it reaches systemic circulation, reducing treatment efficiency.',
  },
  {
    id: 'site3', title: 'Site 3',
    context: 'You are preparing to cannulate a graft and reach for a tourniquet to help engorge the vessel, the way you would for a fistula.',
    question: 'Should you apply the tourniquet?',
    options: [
      'Yes — the same technique applies to grafts and fistulas',
      'No — tourniquets must never be used on a graft',
      'Yes, but only loosely',
      'No — tourniquets are never used on any access type',
    ],
    correct: 1,
    explanation: 'Tourniquets are sometimes used on fistulas (without fully occluding flow) but must never be used on grafts.',
  },
];

// ─── Task 4: Cannulation sequence ─────────────────────────────────────────────
const CANNULATION_STEPS = [
  { id: 'hygiene1', icon: '🧼', label: 'Perform hand hygiene', detail: 'Before assembling supplies' },
  { id: 'assemble', icon: '🧰', label: 'Assemble cannulation supplies', detail: '' },
  { id: 'assess', icon: '🖐️', label: 'Assess the access — Look, Listen, Feel', detail: '' },
  { id: 'hygiene2', icon: '🧤', label: 'Hand hygiene + don gloves', detail: '' },
  { id: 'tourniquet', icon: '➰', label: 'Apply tourniquet (fistula only)', detail: 'Never on a graft' },
  { id: 'antiseptic', icon: '🧴', label: 'Cleanse site with antiseptic, allow to air dry', detail: 'Circular motion, outward from insertion site' },
  { id: 'cannulate', icon: '💉', label: 'Cannulate arterial site, rope-ladder technique', detail: '20–35° for fistula, ~45° for graft' },
  { id: 'confirm', icon: '🩸', label: 'Confirm placement — purge air, aspirate, flush', detail: '' },
  { id: 'venous', icon: '🔁', label: 'Repeat for venous cannulation', detail: '' },
  { id: 'connect', icon: '🔗', label: 'Connect bloodlines and secure', detail: 'Tape without covering insertion site' },
];

export default function AvgAvfModule({ questId, onTaskComplete, taskProgress }) {
  const [activeTask, setActiveTask] = useState(0);
  const tasks = [
    { key: 'reading',              label: 'Vascular Access Types' },
    { key: 'assess-lab',           label: 'Look, Listen, Feel' },
    { key: 'site-select',          label: 'Site Selection' },
    { key: 'cannulation-technique', label: 'Cannulation Sequence' },
    { key: 'documentation',        label: 'Chart the Assessment' },
  ];

  return (
    <div className="module-layout">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--task">Practice</span>
          <h3 className="module-sidebar__title">AVG / AVF Access</h3>
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
          <div className="module-formula-title">Site Spacing</div>
          <div className="module-formula"><span className="module-formula__name">From anastomosis</span><code>≥ 2.5 cm</code></div>
          <div className="module-formula"><span className="module-formula__name">Arterial ↔ venous</span><code>≥ 5 cm</code></div>
          <div className="module-formula__limit">Tourniquets: fistula only, never grafts</div>
        </div>
      </aside>

      <main className="module-content">
        {tasks[activeTask].key === 'reading' && (
          <ReadingTask pages={AVF_READING_PAGES} done={taskProgress['reading']} onComplete={() => onTaskComplete(questId, 'reading')} />
        )}
        {tasks[activeTask].key === 'assess-lab' && (
          <ScenarioSet title="Look, Listen, Feel" scenarios={ASSESS_SCENARIOS}
            done={taskProgress['assess-lab']} onComplete={() => onTaskComplete(questId, 'assess-lab')} />
        )}
        {tasks[activeTask].key === 'site-select' && (
          <ScenarioSet title="Site Selection" scenarios={SITE_SCENARIOS}
            done={taskProgress['site-select']} onComplete={() => onTaskComplete(questId, 'site-select')} />
        )}
        {tasks[activeTask].key === 'cannulation-technique' && (
          <StepOrder
            title="Cannulation Sequence"
            instruction="Place the steps of AVF/AVG cannulation in the order you would perform them."
            steps={CANNULATION_STEPS}
            correctExplanation="Assess before you prep, prep before you cannulate, and always confirm placement before connecting bloodlines. This order protects the access and the patient."
            wrongExplanation="Steps in red are out of place. Remember: assessment comes before hand hygiene #2 and tourniquet application; placement is confirmed before the venous side begins."
            done={taskProgress['cannulation-technique']}
            onComplete={() => onTaskComplete(questId, 'cannulation-technique')}
          />
        )}
        {tasks[activeTask].key === 'documentation' && (
          <DocForm
            title="Chart the Assessment"
            scenario="You assess Mr. Reyes's fistula before cannulation: continuous low-pitched bruit, gentle buzzing thrill, no swelling or redness, no aneurysm."
            fields={[
              { key: 'accessType', label: 'Access type', type: 'select', options: ['AVF', 'AVG', 'CVC'], correct: 'AVF', hint: 'This is a fistula, not a graft or catheter.' },
              { key: 'bruit', label: 'Bruit', type: 'select', options: ['Normal — continuous', 'Abnormal — high-pitched/discontinuous', 'Absent'], correct: 'Normal — continuous', hint: 'The scenario describes a continuous low-pitched bruit.' },
              { key: 'thrill', label: 'Thrill', type: 'select', options: ['Normal — buzzing/vibration', 'Abnormal — pulse-like', 'Absent'], correct: 'Normal — buzzing/vibration', hint: 'A gentle buzzing thrill is the normal finding.' },
              { key: 'skin', label: 'Skin / swelling', type: 'select', options: ['No abnormalities noted', 'Swelling present', 'Redness present'], correct: 'No abnormalities noted', hint: 'No swelling or redness was found on exam.' },
              { key: 'plan', label: 'Plan', type: 'select', options: ['Proceed with cannulation', 'Escalate before cannulating'], correct: 'Proceed with cannulation', hint: 'All findings are normal — this access is safe to proceed with.' },
            ]}
            done={taskProgress['documentation']}
            onComplete={() => onTaskComplete(questId, 'documentation')}
          />
        )}
      </main>
    </div>
  );
}
