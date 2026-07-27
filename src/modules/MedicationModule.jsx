import { useState } from 'react';
import { MEDICATION_READING_PAGES } from '../data';
import { ReadingTask, MatchGrid, DocForm } from '../components/TaskKit';
import '../modules/FluidModule.css';

const MED_PAIRS = [
  { id: 'epo', left: 'EPO (erythropoietin)', right: 'Anemia of CKD — given IV during treatment' },
  { id: 'heparin', left: 'Heparin', right: 'Circuit anticoagulation — IV bolus/infusion' },
  { id: 'iron', left: 'IV Iron', right: 'Iron deficiency — supports EPO effectiveness' },
];

export default function MedicationModule({ questId, onTaskComplete, taskProgress }) {
  const [activeTask, setActiveTask] = useState(0);
  const tasks = [
    { key: 'reading',   label: 'Medications During Dialysis' },
    { key: 'matching',  label: 'Medication Matching' },
    { key: 'documentation', label: 'Chart the Administration' },
  ];

  return (
    <div className="module-layout">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--task">Task</span>
          <h3 className="module-sidebar__title">Medication Administration</h3>
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
          <div className="module-formula-title">Timing Notes</div>
          <div className="module-formula"><span className="module-formula__name">Heparin</span><code>Hold near end</code></div>
          <div className="module-formula"><span className="module-formula__name">EPO / IV Iron</span><code>Once access stable</code></div>
        </div>
      </aside>

      <main className="module-content">
        {tasks[activeTask].key === 'reading' && (
          <ReadingTask pages={MEDICATION_READING_PAGES} done={taskProgress['reading']} onComplete={() => onTaskComplete(questId, 'reading')} />
        )}
        {tasks[activeTask].key === 'matching' && (
          <MatchGrid
            title="Medication Matching"
            instruction="Tap a medication, then tap its matching indication and route."
            leftLabel="Medication" rightLabel="Indication & Route"
            pairs={MED_PAIRS}
            done={taskProgress['matching']}
            onComplete={() => onTaskComplete(questId, 'matching')}
          />
        )}
        {tasks[activeTask].key === 'documentation' && (
          <DocForm
            title="Chart the Administration"
            scenario="You give Mr. Osei 4000 units of heparin IV as a bolus at the start of a 4-hour treatment, per the standing order."
            fields={[
              { key: 'medication', label: 'Medication', type: 'select', options: ['Heparin', 'EPO', 'IV Iron'], correct: 'Heparin', hint: 'The scenario describes a heparin bolus.' },
              { key: 'dose', label: 'Dose given', type: 'text', correct: '4000', placeholder: 'e.g. 4000 units', hint: 'Chart the dose stated in the order.' },
              { key: 'route', label: 'Route', type: 'select', options: ['IV', 'Subcutaneous', 'Oral'], correct: 'IV', hint: 'Heparin is given IV during dialysis.' },
              { key: 'timing', label: 'Timing relative to treatment', type: 'select', options: ['Start of treatment', 'End of treatment', 'Mid-treatment only'], correct: 'Start of treatment', hint: 'This bolus was given at the start of the 4-hour treatment.' },
            ]}
            done={taskProgress['documentation']}
            onComplete={() => onTaskComplete(questId, 'documentation')}
          />
        )}
      </main>
    </div>
  );
}
