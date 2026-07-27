import { useState } from 'react';
import './FluidModule.css';
import './InfectionControlModule.css';

// TODO (glossary regression): DESIGN.md §10.2 specs glossary-linked terms and
// (?) buttons that deep-link into the Journal. The reusable pieces now exist —
// <LinkedText> (utils/linkGlossary) for inline terms and <RefTip> (components/
// RefTip) for the (?) button. They are NOT wired into this module yet: the
// concept cards are full <button>s, so inline links (role="button" spans) would
// nest illegally and steal the expand click. To restore linking here, split each
// card into a header <button> + a sibling detail block, then wrap the detail
// bullets in <LinkedText>. Tracked outside DESIGN.md per request.

const TASKS = [
  { key: 'reading', label: 'Dialysis Infection Risks', type: 'reading' },
  { key: 'ppe-lab', label: 'PPE & Hand Hygiene Lab', type: 'ppe' },
  { key: 'station-safety', label: 'Station Turnover Checklist', type: 'station' },
  { key: 'isolation-cases', label: 'Spot the Mistake', type: 'isolation' },
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
  { id: 'hand-hygiene', icon: '🧼', label: 'Hand hygiene' },
  { id: 'gloves', icon: '🧤', label: 'Gloves' },
  { id: 'gown', icon: '🥼', label: 'Gown' },
  { id: 'mask', icon: '😷', label: 'Surgical mask' },
  { id: 'eye', icon: '🥽', label: 'Eye protection' },
  { id: 'n95', icon: '🔵', label: 'N95 respirator' },
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

// ─── Spot the Mistake scenarios ───────────────────────────────────────────────
// Segments with err:true are the infection control mistakes to find.
// ALL segments are tappable — the challenge is knowing which ones are actually wrong.
const STM_SCENARIOS = [
  {
    title: 'C. difficile Precautions',
    intro: 'A patient with confirmed C. difficile diarrhea has finished dialysis. Review the nurse\'s actions carefully and flag any infection control errors.',
    segments: [
      { text: 'Nurse L dons gown and gloves before entering, completes the necessary care, and removes her PPE in the anteroom. ', err: false },
      { text: 'She then cleans her hands using the alcohol-based hand rub dispenser mounted near the exit.', err: true, why: 'C. difficile produces spores that are not destroyed by alcohol-based hand rubs. After caring for a C. difficile patient, hand hygiene must be performed with soap and water to mechanically remove spores — ABHR is insufficient.' },
      { text: ' The charge nurse confirms the room requires terminal cleaning with a sporicidal disinfectant at the required contact time. ', err: false },
      { text: 'The patient\'s diarrhea resolved yesterday morning. Nurse L documents that the patient is asymptomatic and removes the isolation precautions.', err: true, why: 'C. difficile isolation cannot be lifted based on symptom resolution alone. Precautions must remain in place until the patient has been free of diarrhea AND stools have returned to normal for at least 48 hours — one day is not sufficient.' },
    ],
  },
  {
    title: 'Reading the Isolation Sign',
    intro: 'Several patients on the unit have different isolation precautions in place. Review the decisions made and flag anything that does not follow GRH policy.',
    segments: [
      { text: 'Patient A has a green Droplet/Contact sign. Nurse M enters wearing gown and gloves and begins a head-to-toe assessment at the bedside, without adding a mask or eye protection. ', err: true, why: 'GRH Droplet/Contact precautions require mask and eye protection whenever you are within 2 metres of the patient. A bedside assessment places the nurse well within this range — gown and gloves alone are not sufficient.' },
      { text: 'Patient B has a pink Contact sign for MRSA. Nurse M enters wearing gown and gloves to change a dressing, and does not add a mask. ', err: false },
      { text: 'A physiotherapy student needs to drop a rehabilitation referral form in Patient A\'s room. Nurse M tells her that gown and gloves are only required for direct patient contact, so she can walk in without PPE. ', err: true, why: 'GRH Droplet/Contact precautions (green sign) require gown and gloves for all persons entering the room — not only direct care providers. The 2-metre rule determines whether mask and eye protection must be added, but entry itself requires gown and gloves regardless of purpose.' },
      { text: 'Patient C is on Bed Space precautions (white/yellow sign). A family member arrives to sit with the patient and read to them. Nurse M confirms they do not need to don gown and gloves since they are not providing any direct care.', err: false },
    ],
  },
  {
    title: 'The Transient Patient',
    intro: 'A patient who received hemodialysis at a clinic in Portugal for eight weeks returns to the WRHN renal program. Review the nurse\'s admission decisions and flag any errors.',
    segments: [
      { text: 'Nurse R initiates MRSA and VRE admission swabs as part of the standard ARO screening protocol for a returning transient. ', err: false },
      { text: 'She completes the screening orders and prepares to start the patient\'s treatment, noting that results will be followed up when they come back.', err: true, why: 'A patient returning from out-of-country dialysis or hospitalization also requires MDR-GNR (multi-drug-resistant gram-negative rod) screening and notification to Infection Prevention and Control — in addition to standard MRSA and VRE swabs. International travel specifically triggers these additional steps, which were not completed.' },
      { text: ' The patient mentions their hepatitis B vaccination was completed years ago at another centre and they feel well. Nurse R confirms that a hepatitis B and C serology panel is still required with the initial bloodwork, ', err: false },
      { text: 'but defers repeating the hepatitis B serology since the patient\'s last result two years ago confirmed protective anti-HBs levels.', err: true, why: 'Annual hepatitis B serology (HBsAg, anti-HBc, anti-HBs) is required for all hemodialysis patients regardless of prior immune status. Immunity can wane in immunocompromised patients, and a protective result from two years ago does not satisfy the annual surveillance requirement.' },
    ],
  },
];

export default function InfectionControlModule({ questId, onTaskComplete, taskProgress }) {
  const [activeTask, setActiveTask] = useState(0);

  return (
    <div className="module-layout infection-module">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--task">Task</span>
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

const IC_CONCEPTS = [
  {
    icon: '🦠',
    title: 'High Infection Risk',
    summary: 'Dialysis patients face repeated bloodstream access, weakened immunity, and shared equipment exposure.',
    bullets: [
      'Major risks: Hepatitis B/C, Staphylococcus aureus bloodstream infections, AROs, influenza.',
      'Each catheter or needle access point is a potential portal for bloodstream infection.',
      'The shared unit environment (chairs, machines, water supply) amplifies transmission risk.',
    ],
  },
  {
    icon: '🧼',
    title: 'Hand Hygiene — 4 Moments',
    summary: 'Clean hands before patient contact, before aseptic procedures, after body fluid exposure, and after patient surroundings.',
    bullets: [
      'Alcohol-based hand rub is preferred unless hands are visibly soiled.',
      'Gloves never replace hand hygiene — clean gloves are treated like clean hands.',
      'Change gloves when moving from a contaminated to a clean task.',
    ],
  },
  {
    icon: '🧤',
    title: 'PPE Selection',
    summary: 'Gloves, gown, and face protection required during treatment initiation, discontinuation, and any splash-risk procedures.',
    bullets: [
      'Do not use the same gloves for more than one patient.',
      'N95 respirator required for airborne/contact precautions — surgical mask is not sufficient.',
      'Don PPE before entering the patient space; remove and discard before leaving.',
    ],
  },
  {
    icon: '📦',
    title: 'Clean vs. Contaminated Zones',
    summary: 'The patient station is contaminated while occupied. Anything taken there cannot return to the clean area.',
    bullets: [
      'Prepare medications in a clean area, away from patient stations.',
      'Single-dose vials are for one patient only — discard after use, even if medication remains.',
      'Needles and syringes are single-use and must never be re-capped or reused.',
    ],
  },
  {
    icon: '🏷️',
    title: 'Isolation Precautions',
    summary: 'The sign on the room or bed space tells you exactly what PPE to put on before entering.',
    bullets: [
      'C. difficile: private room when possible, sporicidal cleaning with 10 min contact time, dedicated toileting equipment.',
      'CPE: private room required, notify Infection Prevention and Control.',
      'When precautions are upgraded, replace all PPE — the existing set may be contaminated.',
    ],
  },
  {
    icon: '⏱️',
    title: 'Disinfectant Contact Times',
    summary: 'Surfaces must stay visibly wet for the full contact time — wiping early means disinfection did not occur.',
    bullets: [
      'Virex II 256: 10 minutes on dialysis machine surfaces and chair.',
      'Oxivir Plus: 5 minutes for routine room or bed-space cleaning.',
      'C. difficile terminal clean: 10 minutes with a sporicidal or bleach-based product.',
    ],
  },
  {
    icon: '💉',
    title: 'Hepatitis B Screening',
    summary: 'All renal patients are screened on admission and annually. Non-immune patients are offered immunization.',
    bullets: [
      'Recombivax 40 mcg IM: doses at month 0, 1, and 6. (Switched from Engerix-B — 4-dose series if started on Engerix-B.)',
      'Watch for anaphylaxis for 20 minutes after each injection.',
      'Serious active infection is a reason to delay the scheduled dose.',
    ],
  },
];

function ReadingTask({ done, onComplete }) {
  const [expanded, setExpanded] = useState(null);

  function toggle(i) {
    setExpanded((prev) => (prev === i ? null : i));
  }

  return (
    <div className="reading-task infection-reading fade-in">
      <div className="reading-task__header">
        <h2>Dialysis Infection Risks</h2>
        <span className="reading-task__page">Key Concepts</span>
      </div>
      <p className="ic-overview__intro">
        Tap any card to expand it. The full reading is saved to your Journal when you mark this task complete.
      </p>

      <div className="ic-concepts">
        {IC_CONCEPTS.map((concept, i) => {
          const isOpen = expanded === i;
          return (
            <button
              key={i}
              className={`ic-concept ${isOpen ? 'ic-concept--open' : ''}`}
              onClick={() => toggle(i)}
            >
              <div className="ic-concept__header">
                <span className="ic-concept__icon">{concept.icon}</span>
                <div className="ic-concept__header-text">
                  <span className="ic-concept__title">{concept.title}</span>
                  <span className="ic-concept__summary">{concept.summary}</span>
                </div>
                <span className="ic-concept__arrow">{isOpen ? '▲' : '▼'}</span>
              </div>
              {isOpen && (
                <ul className="ic-concept__detail">
                  {concept.bullets.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      <p className="ic-overview__journal-note">
        📖 The full reading will be added to your Journal when you mark this task complete.
      </p>

      <div className="reading-task__actions">
        <div style={{ flex: 1 }} />
        <button className="btn btn--primary" onClick={onComplete} disabled={done}>
          {done ? '✓ Completed' : 'Mark as Read'}
        </button>
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
              <span className="infection-ppe-choice__icon">{choice.icon}</span>
              <span>{choice.label}</span>
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

const TURNOVER_STEPS = [
  { id: 'hh-before',     icon: '🧼', label: 'Hand hygiene',          detail: 'Before starting turnover' },
  { id: 'ppe-on',        icon: '🧤', label: 'Don PPE',               detail: 'Gloves and gown' },
  { id: 'dispose',       icon: '🗑️', label: 'Disconnect & dispose',  detail: 'Tubing, dialyzer, sharps' },
  { id: 'clear-station', icon: '📦', label: 'Clear the station',     detail: 'Remove all single-use supplies' },
  { id: 'virex',         icon: '🧴', label: 'Apply Virex II 256',    detail: 'Machine, chair, armrests, surfaces' },
  { id: 'contact-time',  icon: '⏱️', label: 'Wait 10 min',           detail: 'Wet contact time — do not wipe early' },
  { id: 'ppe-off',       icon: '🙌', label: 'Remove PPE',            detail: 'Then perform hand hygiene' },
  { id: 'setup',         icon: '✅', label: 'Set up clean',          detail: 'Supplies for next patient' },
];

function StationSafetyTask({ done, onComplete }) {
  const [sequence, setSequence] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(done);
  const correctOrder = TURNOVER_STEPS.map((s) => s.id);
  const sequenceCorrect = submitted && arraysEqual(sequence, correctOrder);

  if (allDone) return <CompletionScreen title="Station Turnover Checklist" onReview={() => setAllDone(false)} />;

  function pickStep(id) {
    if (submitted || sequence.includes(id)) return;
    setSequence((prev) => [...prev, id]);
  }

  function reset() {
    setSequence([]);
    setSubmitted(false);
  }

  function finish() {
    setAllDone(true);
    onComplete();
  }

  return (
    <div className="exercise infection-task fade-in">
      <div className="exercise__header">
        <h2>Station Turnover Checklist</h2>
        <span className="exercise__progress">{sequence.length} / {TURNOVER_STEPS.length} placed</span>
      </div>
      <p className="exercise__instruction">
        Place the 8 steps in the order you would follow when turning over a dialysis station between patients.
      </p>

      <div className="infection-station-layout">
        <div className="infection-turnover-main">
          {/* Sequence slots */}
          <div className="infection-slot-grid">
            {TURNOVER_STEPS.map((_, i) => {
              const placedStep = sequence[i] ? TURNOVER_STEPS.find((s) => s.id === sequence[i]) : null;
              const isCorrect = submitted && placedStep && placedStep.id === correctOrder[i];
              const isWrong   = submitted && placedStep && placedStep.id !== correctOrder[i];
              return (
                <div
                  key={i}
                  className={[
                    'infection-slot',
                    placedStep ? 'infection-slot--filled' : '',
                    isCorrect  ? 'infection-slot--correct' : '',
                    isWrong    ? 'infection-slot--wrong' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span className="infection-slot__num">{i + 1}</span>
                  {placedStep ? (
                    <>
                      <span className="infection-slot__icon">{placedStep.icon}</span>
                      <span className="infection-slot__label">{placedStep.label}</span>
                    </>
                  ) : (
                    <span className="infection-slot__empty">—</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Option pills */}
          <div className="infection-step-options">
            {TURNOVER_STEPS.map((step) => {
              const used = sequence.includes(step.id);
              return (
                <button
                  key={step.id}
                  className={`infection-step-pill ${used ? 'infection-step-pill--used' : ''}`}
                  onClick={() => pickStep(step.id)}
                  disabled={used || submitted}
                >
                  <span className="infection-step-pill__icon">{step.icon}</span>
                  <span className="infection-step-pill__label">{step.label}</span>
                  <span className="infection-step-pill__detail">{step.detail}</span>
                </button>
              );
            })}
          </div>

          {!submitted ? (
            <div className="infection-action-row">
              <button className="btn btn--outline" onClick={reset} disabled={!sequence.length}>Reset</button>
              <button className="btn btn--primary" onClick={() => setSubmitted(true)} disabled={sequence.length !== TURNOVER_STEPS.length}>Check order</button>
            </div>
          ) : sequenceCorrect ? (
            <div className="feedback feedback--correct">
              <div className="feedback__icon">✓</div>
              <div className="feedback__body">
                <div className="feedback__title">Correct turnover sequence</div>
                <div className="feedback__explanation">PPE before contaminated work, Virex contact time respected, clean setup only after hand hygiene. This order protects staff and the next patient.</div>
              </div>
              <button className="btn btn--primary feedback__next" onClick={finish}>Complete Task ✓</button>
            </div>
          ) : (
            <div className="feedback feedback--wrong">
              <div className="feedback__icon">✗</div>
              <div className="feedback__body">
                <div className="feedback__title">Order needs adjustment</div>
                <div className="feedback__explanation">Steps in red are out of place. Key rules: don PPE before touching contaminated items; apply Virex and wait the full 10 min before setting up.</div>
              </div>
              <button className="btn btn--primary feedback__next" onClick={reset}>Try Again</button>
            </div>
          )}
        </div>

        <aside className="infection-timer-stack">
          <div className="infection-zone-card infection-zone-card--clean">
            <strong>🟢 Clean zone</strong>
            <p>Medication prep, unused supplies, clean storage.</p>
          </div>
          <div className="infection-zone-card infection-zone-card--dirty">
            <strong>🟡 Contaminated zone</strong>
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
  const [marked, setMarked] = useState(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(done);
  const scenario = STM_SCENARIOS[idx];

  if (allDone) return <CompletionScreen title="Spot the Mistake" onReview={() => setAllDone(false)} />;

  const errorSegments = scenario.segments.filter((s) => s.err);
  const markedErrors = [...marked].filter((i) => scenario.segments[i]?.err);
  const missedErrors = errorSegments.filter((_, ei) => {
    const segIdx = scenario.segments.indexOf(errorSegments[ei]);
    return !marked.has(segIdx);
  });
  const falsePositives = [...marked].filter((i) => !scenario.segments[i]?.err);
  const allCorrect = submitted && markedErrors.length === errorSegments.length && falsePositives.length === 0;

  function toggle(i) {
    if (submitted || !scenario.segments[i].err && false) return; // any segment is tappable
    if (submitted) return;
    setMarked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function advance() {
    if (idx < STM_SCENARIOS.length - 1) {
      setIdx((i) => i + 1);
      setMarked(new Set());
      setSubmitted(false);
    } else {
      setAllDone(true);
      onComplete();
    }
  }

  function retry() {
    setMarked(new Set());
    setSubmitted(false);
  }

  return (
    <div className="exercise infection-task fade-in">
      <div className="exercise__header">
        <h2>Spot the Mistake</h2>
        <span className="exercise__progress">{idx + 1} / {STM_SCENARIOS.length}</span>
      </div>

      <div className="stm-card card">
        <span className="infection-case-card__label">{scenario.title}</span>
        <p className="stm-intro">{scenario.intro}</p>
        <p className="stm-passage">
          {scenario.segments.map((seg, i) => {
            const isMarked = marked.has(i);
            const isError = seg.err;
            let cls = 'stm-seg stm-seg--clickable';
            if (isMarked && !submitted) cls += ' stm-seg--marked';
            if (submitted && isError && isMarked) cls += ' stm-seg--found';
            if (submitted && isError && !isMarked) cls += ' stm-seg--missed';
            if (submitted && !isError && isMarked) cls += ' stm-seg--false';
            return (
              <span
                key={i}
                className={cls}
                onClick={() => toggle(i)}
                title={submitted && isError ? seg.why : undefined}
              >
                {seg.text}
              </span>
            );
          })}
        </p>
        {!submitted && (
          <p className="stm-hint">Tap any phrase to flag it as an error. Tap again to unflag. Not every segment contains a mistake.</p>
        )}
      </div>

      {submitted && (
        <div className="stm-results">
          {scenario.segments.map((seg, i) => {
            if (!seg.err) return null;
            const found = marked.has(i);
            return (
              <div key={i} className={`stm-result-item ${found ? 'stm-result-item--found' : 'stm-result-item--missed'}`}>
                <span className="stm-result-item__icon">{found ? '✓' : '✗'}</span>
                <div>
                  <div className="stm-result-item__label">"{seg.text.trim()}"</div>
                  <div className="stm-result-item__why">{seg.why}</div>
                </div>
              </div>
            );
          })}
          {falsePositives.length > 0 && (
            <div className="stm-false-note">
              {falsePositives.length} phrase{falsePositives.length > 1 ? 's' : ''} flagged incorrectly — re-read the highlighted sections to review.
            </div>
          )}
        </div>
      )}

      {!submitted ? (
        <div className="infection-action-row" style={{ marginTop: 16 }}>
          <button className="btn btn--outline" onClick={() => setMarked(new Set())} disabled={!marked.size}>Clear flags</button>
          <button className="btn btn--primary" onClick={() => setSubmitted(true)} disabled={!marked.size}>Submit</button>
        </div>
      ) : (
        <div className={`feedback ${allCorrect ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{allCorrect ? '✓' : missedErrors.length > 0 ? '✗' : '⚠'}</div>
          <div className="feedback__body">
            <div className="feedback__title">
              {allCorrect
                ? 'All mistakes found'
                : missedErrors.length > 0
                  ? `${missedErrors.length} mistake${missedErrors.length > 1 ? 's' : ''} missed`
                  : 'Review the explanations above'}
            </div>
            <div className="feedback__explanation">
              {allCorrect
                ? 'Good eye — you caught every infection control error in this scenario.'
                : 'Review the explanations and try again, or move to the next scenario.'}
            </div>
          </div>
          {!allCorrect && (
            <button className="btn btn--outline feedback__next" onClick={retry}>Try Again</button>
          )}
          <button className="btn btn--primary feedback__next" onClick={advance}>
            {idx < STM_SCENARIOS.length - 1 ? 'Next Scenario →' : 'Complete Task ✓'}
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
