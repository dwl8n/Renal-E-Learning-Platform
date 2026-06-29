import { useState } from 'react';
import { useApp } from '../context';
import { INFECTION_READING_PAGES } from '../data';
import { LinkedText } from '../utils/linkGlossary';
import './FluidModule.css';
import './InfectionControlModule.css';

const TASKS = [
  { key: 'reading', label: 'Dialysis Infection Risks', type: 'reading' },
  { key: 'ppe-lab', label: 'PPE & Hand Hygiene Lab', type: 'ppe' },
  { key: 'station-safety', label: 'Clean vs. Contaminated Station', type: 'station' },
  { key: 'isolation-cases', label: 'Isolation & Screening Cases', type: 'isolation' },
];

const SOURCE_FILES = [
  'Infection Prevention in Dialysis Settings - Updated June 2025.pptx',
  'GRH Additional Precautions Fact Sheet.pdf',
  'Cerner Isolation Order Management.pdf',
  'RNL-2-43 Appendix A - Decision Tree for ARO Screening.pdf',
  'GRH C. Difficile / MRSA / VRE / ESBL fact sheets',
  'Collecting a Nasopharyngeal Sample for Virology.pdf',
  'Patient Transfer Sling Processing.pdf',
  'Deleted Slides.pptx - Hepatitis B immunization schedule',
];

const PPE_CHOICES = [
  { id: 'hand-hygiene', label: 'Hand hygiene' },
  { id: 'gloves', label: 'Gloves' },
  { id: 'gown', label: 'Gown' },
  { id: 'mask', label: 'Surgical mask' },
  { id: 'eye', label: 'Eye protection' },
  { id: 'n95', label: 'N95 respirator' },
];

const PPE_SCENARIOS = [
  {
    title: 'Routine treatment initiation',
    context: 'You are about to initiate hemodialysis. Splash risk is present during connection.',
    required: ['hand-hygiene', 'gloves', 'eye'],
    teaching:
      'The deck states that gloves and face protection are required during treatment initiation/discontinuation and splash-risk procedures. Hand hygiene still comes first.',
    source: 'Infection Prevention deck · Slides 7-8',
  },
  {
    title: 'Collecting an NP swab',
    context: 'The patient has respiratory symptoms and you are collecting a nasopharyngeal virology sample.',
    required: ['hand-hygiene', 'mask', 'eye', 'gown', 'gloves'],
    teaching:
      'The NP sample resource lists hand hygiene, then mask, eye protection, gown and gloves for sample collection.',
    source: 'Collecting a Nasopharyngeal Sample for Virology · Pages 1-3',
  },
  {
    title: 'Contact precautions room',
    context: 'The patient is on Contact Precautions for an ARO. You are entering to provide direct care.',
    required: ['hand-hygiene', 'gown', 'gloves'],
    teaching:
      'Contact Precautions require gown and gloves. Hand hygiene is still required before entering patient space and after care.',
    source: 'Additional Precautions fact sheet; MRSA/VRE/ESBL fact sheets',
  },
  {
    title: 'Airborne/contact sign',
    context: 'The room has an Airborne/Contact sign and staff have directed you to enter with respiratory protection.',
    required: ['hand-hygiene', 'n95', 'eye', 'gown', 'gloves'],
    teaching:
      'The Additional Precautions fact sheet identifies Airborne/Contact as requiring an N95 respirator to enter. Add gown/gloves for contact protection and eye protection when splash or face exposure risk exists.',
    source: 'GRH Additional Precautions Fact Sheet',
  },
];

const DONNING_STEPS = [
  { id: 'hh-1', label: 'Hand hygiene' },
  { id: 'gown', label: 'Gown' },
  { id: 'mask', label: 'Mask or respirator' },
  { id: 'eye', label: 'Eye protection' },
  { id: 'hh-2', label: 'Hand hygiene again' },
  { id: 'gloves', label: 'Gloves' },
];

const STATION_ITEMS = [
  {
    title: 'Single-dose medication vial',
    prompt: 'A single-dose vial was used for one patient and there is medication left.',
    options: ['Save for the next patient', 'Discard it', 'Return it to the clean medication area'],
    correct: 1,
    explanation:
      'Do not administer medication from a single-dose vial or IV bag to multiple patients. Once used for a patient, it does not go back to a clean workflow.',
    source: 'Infection Prevention deck · Slide 10',
  },
  {
    title: 'Dialysis machine after treatment',
    prompt: 'A patient has left the station. Chair armrests and machine surfaces look dry.',
    options: ['Wipe quickly and seat the next patient', 'Clean and keep surfaces wet for 10 minutes with Virex II 256', 'Only clean visibly soiled surfaces'],
    correct: 1,
    explanation:
      'The entire chair, armrests and dialysis machine surfaces must be disinfected between patients. Virex II 256 requires 10 minutes wet contact time on dialysis machines.',
    source: 'Infection Prevention deck · Slide 12',
  },
  {
    title: 'Clean supply brought to station',
    prompt: 'Extra tape and gauze were taken to a station while the patient was present but were not used.',
    options: ['Put them back in the clean supply area', 'Dispose of or clean/disinfect according to policy', 'Leave them at the next station'],
    correct: 1,
    explanation:
      'The patient station is contaminated while the patient is present. Items taken to the station must not return to clean areas unless cleaned/disinfected if appropriate.',
    source: 'Infection Prevention deck · Slide 11',
  },
  {
    title: 'C. difficile room',
    prompt: 'A patient with active C. difficile diarrhea has completed dialysis in a private room.',
    options: ['Standard room wipe is enough', 'Terminal clean with sporicidal disinfectant for required contact time', 'Clean only the dialysis machine'],
    correct: 1,
    explanation:
      'The source recommends private room/end-of-day planning when possible and a full room clean with sporicidal disinfectant. The listed required contact time is 10 minutes.',
    source: 'Infection Prevention deck · Slide 13; C. difficile fact sheet',
  },
  {
    title: 'Soiled transfer sling from isolation room',
    prompt: 'A patient handling sling is soiled after use in an isolation room.',
    options: ['Place directly into Ecotex linen hamper', 'Bag it first, then place it in the green bin', 'Store it in clean utility until laundry day'],
    correct: 1,
    explanation:
      'The sling processing handout states that soiled slings from isolation rooms must be bagged first and then placed in the green bin for special laundry.',
    source: 'Patient Transfer Sling Processing · Page 1',
  },
];

const TIMER_CARDS = [
  { label: 'Virex II 256', value: '10 min', note: 'Dialysis machine surfaces' },
  { label: 'Oxivir Plus', value: '5 min', note: 'Routine room or bed-space cleaning' },
  { label: 'C. difficile clean', value: '10 min', note: 'Sporicidal/bleach-based terminal clean' },
];

const ISOLATION_CASES = [
  {
    title: 'New to renal program',
    context: 'A patient is new to the renal program and has no known ARO history.',
    question: 'What screening is indicated?',
    options: ['No screening', 'Screen for MRSA and VRE', 'Screen only if symptomatic', 'Start airborne precautions'],
    correct: 1,
    explanation:
      'The ARO decision tree starts new renal-program patients with MRSA and VRE screening.',
    source: 'RNL-2-43 Appendix A - ARO Screening Decision Tree',
  },
  {
    title: 'Out-of-country dialysis',
    context: 'A returning patient reports receiving dialysis at an out-of-country centre.',
    question: 'What is the safest next action?',
    options: [
      'No further screening is needed',
      'Screen for MDR-GNR, inform Infection Prevention and Control, and initiate contact precautions',
      'Screen for influenza only',
      'Discontinue all precautions after one negative swab',
    ],
    correct: 1,
    explanation:
      'The ARO decision tree routes out-of-country dialysis or hospitalization to MDR-GNR screening, IPAC notification, and contact precautions.',
    source: 'RNL-2-43 Appendix A - ARO Screening Decision Tree',
  },
  {
    title: 'Negative flu swab, MRSA still active',
    context: 'A patient was on Droplet/Contact precautions while awaiting influenza testing. The result is negative, but the chart also shows MRSA positivity.',
    question: 'What should happen to isolation?',
    options: ['Discontinue isolation completely', 'Change to Contact Precautions', 'Switch to airborne only', 'No chart update is required'],
    correct: 1,
    explanation:
      'The Cerner isolation resource warns to verify all isolation reasons before discontinuing. If flu is negative but MRSA remains, isolation should be modified to Contact Precautions rather than stopped.',
    source: 'Cerner Isolation Order Management · Page 3',
  },
  {
    title: 'CPE patient uses sink',
    context: 'A CPE-positive patient has emesis in a public washroom sink after dialysis.',
    question: 'What should the nurse do?',
    options: [
      'Ask housekeeping to clean at the next routine pass',
      'Notify the DA/resource so Oxivir Plus or TB is used in addition to regular cleaning',
      'Flush with water only',
      'Document only if symptoms continue',
    ],
    correct: 1,
    explanation:
      'The CPE slide states that CPE-positive patients should avoid public washroom sinks and that bodily fluid contamination of a sink requires DA/resource notification and specific cleaning.',
    source: 'Infection Prevention deck · Slide 14',
  },
  {
    title: 'Hepatitis B vaccination timing',
    context: 'A dialysis patient is scheduled for Engerix-B but has a serious active infection today.',
    question: 'What should happen?',
    options: ['Give the vaccine regardless', 'Delay the scheduled Hepatitis B vaccine', 'Give double dose and skip monitoring', 'Switch to C. difficile isolation'],
    correct: 1,
    explanation:
      'The deleted Hepatitis B slide notes that serious active infection is a reason for delaying the scheduled Hepatitis B vaccine.',
    source: 'Deleted Slides.pptx · HBV Immunization',
  },
];

export default function InfectionControlModule({ questId, onTaskComplete, taskProgress }) {
  const [activeTask, setActiveTask] = useState(0);

  return (
    <div className="module-layout infection-module">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--task">Module</span>
          <h3 className="module-sidebar__title">Infection Control & Hep B</h3>
        </div>

        <div className="module-tasklist">
          {TASKS.map((task, index) => {
            const done = taskProgress[task.key];
            return (
              <button
                key={task.key}
                className={`module-task-btn ${activeTask === index ? 'module-task-btn--active' : ''} ${done ? 'module-task-btn--done' : ''}`}
                onClick={() => setActiveTask(index)}
              >
                <span className={`check-icon ${done ? 'check-icon--done' : 'check-icon--todo'}`}>
                  {done ? '✓' : <span style={{ fontSize: 11, color: 'var(--text-300)' }}>{index + 1}</span>}
                </span>
                <span className="module-task-btn__label">{task.label}</span>
              </button>
            );
          })}
        </div>

        <div className="module-sidebar__formula card infection-source-card">
          <div className="module-formula-title">Source Package</div>
          {SOURCE_FILES.map((file) => (
            <div className="infection-source-card__item" key={file}>{file}</div>
          ))}
        </div>
      </aside>

      <main className="module-content">
        {TASKS[activeTask].type === 'reading' && (
          <ReadingTask
            done={taskProgress.reading}
            onComplete={() => onTaskComplete(questId, 'reading')}
          />
        )}
        {TASKS[activeTask].type === 'ppe' && (
          <PPELabTask
            done={taskProgress['ppe-lab']}
            onComplete={() => onTaskComplete(questId, 'ppe-lab')}
          />
        )}
        {TASKS[activeTask].type === 'station' && (
          <StationSafetyTask
            done={taskProgress['station-safety']}
            onComplete={() => onTaskComplete(questId, 'station-safety')}
          />
        )}
        {TASKS[activeTask].type === 'isolation' && (
          <IsolationCasesTask
            done={taskProgress['isolation-cases']}
            onComplete={() => onTaskComplete(questId, 'isolation-cases')}
          />
        )}
      </main>
    </div>
  );
}

function ReadingTask({ done, onComplete }) {
  const { dispatch } = useApp();
  const [pageIdx, setPageIdx] = useState(0);
  const page = INFECTION_READING_PAGES[pageIdx];
  const isLast = pageIdx === INFECTION_READING_PAGES.length - 1;

  return (
    <div className="reading-task infection-reading fade-in">
      <div className="reading-task__header">
        <h2>{page.title}</h2>
        <span className="reading-task__page">{pageIdx + 1} / {INFECTION_READING_PAGES.length}</span>
      </div>

      {page.sections.map((section, index) => (
        <div key={index} className="reading-section">
          <h3 className="reading-section__heading">{section.heading}</h3>
          <p className="reading-section__body">
            <LinkedText
              text={section.body}
              onOpen={(target) => dispatch({ type: 'JOURNAL_OPEN', target })}
            />
          </p>
        </div>
      ))}

      <div className="infection-micro-map">
        {['Risk', 'Route', 'PPE', 'Clean zone', 'Isolation', 'Teach'].map((step, index) => (
          <div key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </div>

      <div className="reading-task__actions">
        {pageIdx > 0 && (
          <button className="btn btn--outline" onClick={() => setPageIdx((current) => current - 1)}>← Previous</button>
        )}
        <div style={{ flex: 1 }} />
        {!isLast ? (
          <button className="btn btn--primary" onClick={() => setPageIdx((current) => current + 1)}>Next →</button>
        ) : (
          <button className="btn btn--primary" onClick={onComplete} disabled={done}>
            {done ? '✓ Completed' : 'Mark as Read'}
          </button>
        )}
      </div>
    </div>
  );
}

function PPELabTask({ done, onComplete }) {
  const [phase, setPhase] = useState('builder');
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [sequence, setSequence] = useState([]);
  const [sequenceSubmitted, setSequenceSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(done);

  if (allDone) return <CompletionScreen title="PPE & Hand Hygiene Lab" onReview={() => setAllDone(false)} />;

  const scenario = PPE_SCENARIOS[idx];
  const correct = arraysEqual([...selected].sort(), [...scenario.required].sort());

  function toggle(choiceId) {
    if (submitted) return;
    setSelected((current) =>
      current.includes(choiceId) ? current.filter((id) => id !== choiceId) : [...current, choiceId],
    );
  }

  function nextScenario() {
    if (idx < PPE_SCENARIOS.length - 1) {
      setIdx((current) => current + 1);
      setSelected([]);
      setSubmitted(false);
    } else {
      setPhase('sequence');
      setSelected([]);
      setSubmitted(false);
    }
  }

  function pickStep(stepId) {
    if (sequenceSubmitted || sequence.includes(stepId)) return;
    setSequence((current) => [...current, stepId]);
  }

  function submitSequence() {
    setSequenceSubmitted(true);
  }

  function finishSequence() {
    setAllDone(true);
    onComplete();
  }

  if (phase === 'sequence') {
    const sequenceCorrect = arraysEqual(sequence, DONNING_STEPS.map((step) => step.id));
    return (
      <div className="exercise infection-task fade-in">
        <div className="exercise__header">
          <h2>Build the PPE Donning Sequence</h2>
          <span className="exercise__progress">Final step</span>
        </div>
        <p className="exercise__instruction">
          Click the steps in the order given in the source deck. This deliberately includes hand hygiene twice.
        </p>

        <div className="infection-sequence-board card">
          <div className="infection-sequence-board__picked">
            {DONNING_STEPS.map((_, index) => {
              const picked = sequence[index] && DONNING_STEPS.find((step) => step.id === sequence[index]);
              return (
                <div key={index} className={picked ? 'infection-sequence-slot infection-sequence-slot--filled' : 'infection-sequence-slot'}>
                  <span>{index + 1}</span>
                  <strong>{picked ? picked.label : 'Choose step'}</strong>
                </div>
              );
            })}
          </div>
          <div className="infection-sequence-options">
            {DONNING_STEPS.map((step) => (
              <button
                key={step.id}
                className={sequence.includes(step.id) ? 'infection-pill infection-pill--selected' : 'infection-pill'}
                onClick={() => pickStep(step.id)}
                disabled={sequence.includes(step.id) || sequenceSubmitted}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {!sequenceSubmitted ? (
          <div className="infection-action-row">
            <button className="btn btn--outline" onClick={() => setSequence([])} disabled={!sequence.length}>Reset sequence</button>
            <button className="btn btn--primary" onClick={submitSequence} disabled={sequence.length !== DONNING_STEPS.length}>Submit sequence</button>
          </div>
        ) : (
          <div className={`feedback ${sequenceCorrect ? 'feedback--correct' : 'feedback--wrong'}`}>
            <div className="feedback__icon">{sequenceCorrect ? '✓' : '✗'}</div>
            <div className="feedback__body">
              <div className="feedback__title">{sequenceCorrect ? 'Correct sequence' : 'Sequence needs repair'}</div>
              <div className="feedback__explanation">
                Source order: hand hygiene, gown, mask or respirator, eye protection, hand hygiene, gloves.
              </div>
            </div>
            {sequenceCorrect ? (
              <button className="btn btn--primary feedback__next" onClick={finishSequence}>Complete Task ✓</button>
            ) : (
              <button className="btn btn--primary feedback__next" onClick={() => { setSequence([]); setSequenceSubmitted(false); }}>Try Again</button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="exercise infection-task fade-in">
      <div className="exercise__header">
        <h2>PPE & Hand Hygiene Lab</h2>
        <span className="exercise__progress">{idx + 1} / {PPE_SCENARIOS.length}</span>
      </div>
      <p className="exercise__instruction">
        Select the protection needed for each dialysis scenario. The goal is to choose enough protection without treating every case as the same.
      </p>

      <div className="scenario-card card infection-scenario-card">
        <div className="scenario-card__name"><strong>{scenario.title}</strong></div>
        <p>{scenario.context}</p>
        <div className="infection-ppe-grid">
          {PPE_CHOICES.map((choice) => (
            <button
              key={choice.id}
              className={selected.includes(choice.id) ? 'infection-ppe-choice infection-ppe-choice--selected' : 'infection-ppe-choice'}
              onClick={() => toggle(choice.id)}
              disabled={submitted}
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>

      {!submitted ? (
        <button className="btn btn--primary" onClick={() => setSubmitted(true)} disabled={!selected.length}>Check PPE</button>
      ) : (
        <div className={`feedback ${correct ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{correct ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{correct ? 'Good PPE selection' : 'Not quite'}</div>
            <div className="feedback__explanation">
              <strong>Required:</strong> {labelsFor(scenario.required).join(', ')}.<br />
              {scenario.teaching}
              <div className="infection-source-line">{scenario.source}</div>
            </div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={correct ? nextScenario : () => { setSelected([]); setSubmitted(false); }}>
            {correct ? (idx < PPE_SCENARIOS.length - 1 ? 'Next Scenario →' : 'Build Donning Sequence →') : 'Try Again'}
          </button>
        </div>
      )}
    </div>
  );
}

function StationSafetyTask({ done, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(done);
  const item = STATION_ITEMS[idx];
  const correct = selected === item.correct;

  if (allDone) return <CompletionScreen title="Clean vs. Contaminated Station" onReview={() => setAllDone(false)} />;

  function next() {
    if (idx < STATION_ITEMS.length - 1) {
      setIdx((current) => current + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setAllDone(true);
      onComplete();
    }
  }

  return (
    <div className="exercise infection-task infection-station-task fade-in">
      <div className="exercise__header">
        <h2>Clean vs. Contaminated Station</h2>
        <span className="exercise__progress">{idx + 1} / {STATION_ITEMS.length}</span>
      </div>
      <p className="exercise__instruction">
        Dialysis stations become contaminated while patients are present. Choose what should happen before the workflow crosses back into a clean area.
      </p>

      <div className="infection-station-layout">
        <div>
          <div className="scenario-card card infection-scenario-card">
            <div className="scenario-card__name"><strong>{item.title}</strong></div>
            <p>{item.prompt}</p>
          </div>

          <div className="infection-options">
            {item.options.map((option, optionIndex) => (
              <button
                key={option}
                className={[
                  'infection-option',
                  selected === optionIndex ? 'infection-option--selected' : '',
                  submitted && optionIndex === item.correct ? 'infection-option--correct' : '',
                  submitted && selected === optionIndex && selected !== item.correct ? 'infection-option--wrong' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => !submitted && setSelected(optionIndex)}
                disabled={submitted}
              >
                <span>{String.fromCharCode(65 + optionIndex)}</span>
                {option}
              </button>
            ))}
          </div>

          {!submitted ? (
            <button className="btn btn--primary" onClick={() => setSubmitted(true)} disabled={selected === null} style={{ marginTop: 14 }}>Submit</button>
          ) : (
            <div className={`feedback ${correct ? 'feedback--correct' : 'feedback--wrong'}`}>
              <div className="feedback__icon">{correct ? '✓' : '✗'}</div>
              <div className="feedback__body">
                <div className="feedback__title">{correct ? 'Correct workflow' : 'Unsafe workflow'}</div>
                <div className="feedback__explanation">
                  {item.explanation}
                  <div className="infection-source-line">{item.source}</div>
                </div>
              </div>
              <button className="btn btn--primary feedback__next" onClick={next}>
                {idx < STATION_ITEMS.length - 1 ? 'Next Station →' : 'Complete Task ✓'}
              </button>
            </div>
          )}
        </div>

        <aside className="infection-timer-stack">
          <div className="infection-zone-card infection-zone-card--clean">
            <strong>Clean zone</strong>
            <p>Medication prep, unused supplies, clean storage.</p>
          </div>
          <div className="infection-zone-card infection-zone-card--dirty">
            <strong>Contaminated zone</strong>
            <p>Patient station while occupied, used equipment, soiled items.</p>
          </div>
          {TIMER_CARDS.map((timer) => (
            <div className="infection-timer-card" key={timer.label}>
              <span>{timer.label}</span>
              <strong>{timer.value}</strong>
              <p>{timer.note}</p>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

function IsolationCasesTask({ done, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(done);
  const scenario = ISOLATION_CASES[idx];
  const correct = selected === scenario.correct;

  if (allDone) return <CompletionScreen title="Isolation & Screening Cases" onReview={() => setAllDone(false)} />;

  function next() {
    if (idx < ISOLATION_CASES.length - 1) {
      setIdx((current) => current + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setAllDone(true);
      onComplete();
    }
  }

  return (
    <div className="exercise infection-task fade-in">
      <div className="exercise__header">
        <h2>Isolation & Screening Cases</h2>
        <span className="exercise__progress">{idx + 1} / {ISOLATION_CASES.length}</span>
      </div>
      <p className="exercise__instruction">
        Use the additional resources like a real shift: check the route, the organism, the chart, and the screening trigger before acting.
      </p>

      <div className="infection-case-card card">
        <span className="infection-case-card__label">{scenario.title}</span>
        <p>{scenario.context}</p>
        <h3>{scenario.question}</h3>
      </div>

      <div className="infection-options">
        {scenario.options.map((option, optionIndex) => (
          <button
            key={option}
            className={[
              'infection-option',
              selected === optionIndex ? 'infection-option--selected' : '',
              submitted && optionIndex === scenario.correct ? 'infection-option--correct' : '',
              submitted && selected === optionIndex && selected !== scenario.correct ? 'infection-option--wrong' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => !submitted && setSelected(optionIndex)}
            disabled={submitted}
          >
            <span>{String.fromCharCode(65 + optionIndex)}</span>
            {option}
          </button>
        ))}
      </div>

      {!submitted ? (
        <button className="btn btn--primary" onClick={() => setSubmitted(true)} disabled={selected === null} style={{ marginTop: 14 }}>Submit</button>
      ) : (
        <div className={`feedback ${correct ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{correct ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{correct ? 'Correct decision' : 'Review the isolation logic'}</div>
            <div className="feedback__explanation">
              {scenario.explanation}
              <div className="infection-source-line">{scenario.source}</div>
            </div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={next}>
            {idx < ISOLATION_CASES.length - 1 ? 'Next Case →' : 'Complete Task ✓'}
          </button>
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

function arraysEqual(a, b) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function labelsFor(ids) {
  return ids.map((id) => PPE_CHOICES.find((choice) => choice.id === id)?.label || id);
}
