import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { BVM_READING_PAGES } from '../data';
import './FluidModule.css';
import './FluidRemovalModule.css';

// ─── Coordinate system ────────────────────────────────────────────────────────
// ViewBox "0 0 420 200", plot area x:55–390, y:22–175
// RBV: 74%–107% → y=175 (bottom) to y=22 (top)
const toY = (rbv) => Math.round(175 - (rbv - 74) * (153 / 33));
const toX = (hr)  => Math.round(55  + hr  * (335 / 4));
const Y_85 = toY(85);

// ─── Jagged path generation ───────────────────────────────────────────────────
function seededRng(seed) {
  let s = ((seed * 1664525) + 1013904223) | 0;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 4294967296;
  };
}

function smoothstep(t) { return t * t * (3 - 2 * t); }

// noJitterLast: suppress noise on final point so base/continuation paths join cleanly
function generatePath(keypoints, { jitter = 0.75, stepsPerHour = 10, seed = 1, noJitterLast = false } = {}) {
  const rng = seededRng(seed);
  const startT = keypoints[0][0];
  const endT = keypoints[keypoints.length - 1][0];
  const spanT = endT - startT;
  const n = Math.round(spanT * stepsPerHour);
  const pts = [];

  for (let i = 0; i <= n; i++) {
    const t = startT + (i / n) * spanT;
    let rbv = keypoints[0][1];
    for (let j = 0; j < keypoints.length - 1; j++) {
      const [t0, v0] = keypoints[j];
      const [t1, v1] = keypoints[j + 1];
      if (t >= t0 && t <= t1 + 1e-9) {
        rbv = v0 + (v1 - v0) * smoothstep((t - t0) / (t1 - t0));
        break;
      }
    }
    const suppressNoise = i === 0 || (noJitterLast && i === n);
    pts.push([t, rbv + (suppressNoise ? 0 : (rng() - 0.5) * 2 * jitter)]);
  }

  return pts.map(([t, v], i) => `${i === 0 ? 'M' : 'L'} ${toX(t)},${toY(v)}`).join(' ');
}

// ─── RBV paths ────────────────────────────────────────────────────────────────
const PATHS = {
  ideal: generatePath(
    [[0,100],[0.4,94],[0.8,91],[1.2,89.8],[2,89.1],[3,88.6],[4,88.3]],
    { jitter: 0.75, stepsPerHour: 10, seed: 101 }
  ),
  steep: generatePath(
    [[0,100],[0.3,93.5],[0.6,88.5],[1,85.5],[1.5,83.8],[2,82.8],[2.5,82.3]],
    { jitter: 0.75, stepsPerHour: 10, seed: 202 }
  ),
  plateau: generatePath(
    [[0,100],[0.5,98.5],[1,97.5],[1.5,96.5],[2,95],[2.6,91],[3,86.5],[3.5,82],[4,78]],
    { jitter: 0.75, stepsPerHour: 10, seed: 303 }
  ),
  recovery: generatePath(
    [[0,100],[0.3,94.5],[0.6,91],[1,88.5],[1.5,87],[2,86],[2.5,85.5],[3,85.2],[3.1,85.8],[3.5,86.5],[4,87.5]],
    { jitter: 0.6, stepsPerHour: 12, seed: 404 }
  ),
};

// ─── UFR area paths ───────────────────────────────────────────────────────────
const UFR_MAX_PX = 100;

function makeUFRArea(profile) {
  const topY = (f) => 175 - Math.round(f * UFR_MAX_PX);
  const segs = [];
  let prevY = topY(profile[0][1]);
  segs.push(`M ${toX(0)},175 L ${toX(0)},${prevY}`);
  for (let i = 1; i < profile.length; i++) {
    const [t, f] = profile[i];
    const x = toX(t), y = topY(f);
    segs.push(`L ${x},${prevY}`);
    if (y !== prevY) segs.push(`L ${x},${y}`);
    prevY = y;
  }
  segs.push(`L ${toX(profile[profile.length - 1][0])},175 Z`);
  return segs.join(' ');
}

const UFR = {
  constant:     makeUFRArea([[0,1.0],[4,1.0]]),
  stopped_2_5:  makeUFRArea([[0,1.0],[2.5,1.0],[2.5,0.0],[4,0.0]]),
  reduced_at_3: makeUFRArea([[0,1.0],[3.0,1.0],[3.0,0.38],[4,0.38]]),
};

// ─── Tour stops ───────────────────────────────────────────────────────────────
const TOUR_STOPS = [
  { revealTo: 0 },
  {
    revealTo: 0.14,
    title: 'RBV starts at 100%',
    body: 'At the start of each treatment, the BVM sets a relative baseline of 100%. This is specific to this patient at this moment — not a universal value. A drop in RBV means blood is becoming more concentrated as fluid is removed. The yellow bar at the bottom shows the current UFR setting — it stays constant when no adjustments are made.',
  },
  {
    revealTo: 0.48,
    title: 'Steep initial drop, then leveling: the normal pattern',
    body: "Early in treatment, interstitial fluid is plentiful and vascular refill is fast — the RBV drops quickly at first. As refill keeps pace, the decline gradually slows and the curve flattens. This exponential shape (steep then leveling) is the expected, healthy pattern.",
  },
  {
    revealTo: 0.78,
    title: 'Approaching the 85% threshold',
    body: "The red dashed line marks 85% — the policy minimum. At this point in a real treatment you'd be monitoring closely: blood pressure, patient symptoms, and the direction of the line. A line still dropping steeply here demands action.",
  },
  {
    revealTo: 1.0,
    title: 'Treatment complete: safe removal achieved',
    body: 'The line stayed above 85% the entire session. The curve leveled off comfortably above the threshold — a hallmark of a treatment where vascular refill kept pace with fluid removal throughout.',
  },
];

// ─── Interpretation scenarios ─────────────────────────────────────────────────
const INTERPRET = [
  {
    id: 'steep', title: 'Scenario A',
    context: "Patient gained 3.5 L since last session. UFR set at 900 mL/hr for a 4-hour treatment. At the 2-hour check, the patient appears pale and reports feeling dizzy. The graph stops at the point where nursing intervened — notice what happened to the yellow UFR area.",
    pathD: PATHS.steep, ufrPath: UFR.stopped_2_5,
    question: 'What does this graph pattern suggest?',
    options: [
      'The patient is tolerating treatment well',
      'RBV dropped too fast — vascular refill could not keep up, requiring intervention',
      'Vascular refill is outpacing fluid removal',
      'The BVM reading is likely inaccurate at this point',
    ],
    correct: 1,
    explanation: "The steep, rapid decline crossing 85% — combined with the patient's symptoms and the nurse stopping the UFR (yellow area drops to zero at the intervention point) — indicates vascular depletion outpacing refill. This patient needed intervention: UFR reduced, BP assessed, charge nurse notified.",
  },
  {
    id: 'plateau', title: 'Scenario B',
    context: 'Patient begins with a gentle, comfortable decline. Around the 2.5-hour mark, RBV starts dropping more steeply and crosses the 85% threshold by hour 3. The UFR (yellow area) remained constant throughout.',
    pathD: PATHS.plateau, ufrPath: UFR.constant,
    question: "Why might RBV drop more steeply in the second half of the treatment?",
    options: [
      'Blood flow rate was accidentally increased',
      "The patient's interstitial fluid reserve was exhausted — vascular refill slowed significantly",
      'The dialysate sodium concentration changed mid-treatment',
      'The BVM sensor needs recalibration at this stage',
    ],
    correct: 1,
    explanation: "This is the \"reservoir effect.\" Early in treatment, plentiful interstitial fluid enables rapid vascular refill. As that reserve depletes, refill slows — and RBV drops faster even at the same constant UFR. This is why vigilant mid-treatment monitoring matters: the warning signs appear before the steep drop.",
  },
  {
    id: 'recovery', title: 'Scenario C',
    context: 'RBV declined and approached 85% at hour 3. The nurse reduced the UFR (see the yellow area step down) and the patient received a 100 mL saline flush. RBV then began to rise.',
    pathD: PATHS.recovery, ufrPath: UFR.reduced_at_3,
    question: 'What causes RBV to rise after the 3-hour intervention?',
    options: [
      'A BVM sensor error caused by the saline flush',
      "The patient's dry weight was reset during treatment",
      'With UFR reduced, vascular refill temporarily exceeded the removal rate — partially restoring blood volume',
      'Saline directly increased blood volume without affecting RBV',
    ],
    correct: 2,
    explanation: "When UFR is reduced (visible as the yellow area stepping down), vascular refill continues drawing fluid from interstitial spaces — but now faster than fluid is being removed. RBV rises. The saline bolus also adds intravascular volume. This intentional recovery allowed the team to cautiously resume a lower UFR and complete the treatment safely.",
  },
];

// ─── Prediction scenarios (interactive: hover to preview, click to select) ────
// Each has a base path (first 1.5h shown) and per-choice continuations
const PREDICT_DEFS = [
  {
    id: 'p1', title: 'Scenario 1',
    splitTime: 1.5, splitRBV: 90.3,
    context: 'Mrs. K. has accumulated only 0.8 kg since her last session. Dry weight is 66 kg. Treatment is 4 hours at a standard UFR. She reports feeling well at the start.',
    question: 'How does this treatment proceed from here? Hover the options to preview.',
    baseKeys: [[0,100],[0.3,95.5],[0.6,92.5],[1,91],[1.5,90.3]],
    baseSeed: 501,
    choices: [
      { id: 'a', label: 'Continues to drop, crossing 85%',         keys: [[1.5,90.3],[2,87],[2.5,84.5],[3,83],[4,82]],         seed: 511 },
      { id: 'b', label: 'Gradually levels off, stays above 88%',   keys: [[1.5,90.3],[2,89.8],[2.5,89.5],[3,89.3],[4,89.1]], seed: 512 },
      { id: 'c', label: 'Approaches 85% then partially recovers',  keys: [[1.5,90.3],[2,88.5],[2.5,87.2],[3,86.5],[3.2,87],[4,88]], seed: 513 },
    ],
    correct: 'b',
    explanation: 'With only 0.8 kg to remove, the UFR is low and the interstitial reservoir is not under significant stress. After the steep initial drop, the curve quickly levels off well above 85% and stays there. This patient tolerated treatment comfortably with no intervention needed.',
  },
  {
    id: 'p2', title: 'Scenario 2',
    splitTime: 1.5, splitRBV: 86,
    context: 'Mr. T. gained 3.9 kg over the weekend and arrived mildly short of breath. He has a history of cramping and intradialytic hypotension. UFR is set at 975 mL/hr.',
    question: 'How does this treatment proceed from here? Hover the options to preview.',
    baseKeys: [[0,100],[0.3,93.5],[0.6,89.5],[1,87],[1.5,86]],
    baseSeed: 502,
    choices: [
      { id: 'a', label: 'Levels off and stabilizes just above 85%',    keys: [[1.5,86],[2,85.8],[2.5,85.5],[3,85.5],[4,85.4]],         seed: 521 },
      { id: 'b', label: 'Crosses 85%, requires nursing intervention',   keys: [[1.5,86],[2,84.5],[2.5,83],[3,82.5],[3.5,82]],           seed: 522 },
      { id: 'c', label: 'Recovers on its own back toward 90%',          keys: [[1.5,86],[2,86.5],[2.5,87],[3,88],[4,89]],               seed: 523 },
    ],
    correct: 'b',
    explanation: "With 3.9 kg to remove at 975 mL/hr and a history of intradialytic complications, vascular refill cannot keep pace and RBV crosses 85%. This patient needs intervention: reduce UFR, assess BP, notify the charge nurse. Completing his fluid removal safely likely requires a longer session or modified UFR profile.",
  },
];

// Generate paths from definitions once at module load
const PREDICT = PREDICT_DEFS.map(s => ({
  ...s,
  basePath: generatePath(s.baseKeys, { jitter: 0.65, stepsPerHour: 10, seed: s.baseSeed, noJitterLast: true }),
  choices: s.choices.map(c => ({
    ...c,
    path: generatePath(c.keys, { jitter: 0.65, stepsPerHour: 10, seed: c.seed }),
  })),
}));

// ─── Main export ──────────────────────────────────────────────────────────────
export default function FluidRemovalModule({ questId, onTaskComplete, taskProgress }) {
  const [activeTask, setActiveTask] = useState(0);
  const tasks = [
    { key: 'reading',   label: 'The BVM Explained'   },
    { key: 'graph-tour',    label: 'Reading the Graph'   },
    { key: 'graph-predict', label: 'Predict the Outcome' },
  ];

  return (
    <div className="module-layout">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--task">Task Quest</span>
          <h3 className="module-sidebar__title">Intradialytic Fluid Removal</h3>
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
          <div className="module-formula-title">BVM Reference</div>
          <div className="module-formula"><span className="module-formula__name">RBV baseline</span><code>100%</code></div>
          <div className="module-formula"><span className="module-formula__name">Policy minimum</span><code>85%</code></div>
          <div className="module-formula"><span className="module-formula__name">Check every</span><code>30 min</code></div>
          <div className="module-formula__limit">Below 85%: intervene immediately</div>
        </div>
      </aside>

      <main className="module-content">
        {tasks[activeTask].key === 'reading' && (
          <BVMReadingTask done={taskProgress['reading']} onComplete={() => onTaskComplete(questId, 'reading')} />
        )}
        {tasks[activeTask].key === 'graph-tour' && (
          <GraphTourTask done={taskProgress['graph-tour']} onComplete={() => onTaskComplete(questId, 'graph-tour')} />
        )}
        {tasks[activeTask].key === 'graph-predict' && (
          <GraphPredictTask done={taskProgress['graph-predict']} onComplete={() => onTaskComplete(questId, 'graph-predict')} />
        )}
      </main>
    </div>
  );
}

// ─── Task 1: Reading ──────────────────────────────────────────────────────────
function BVMReadingTask({ done, onComplete }) {
  const [pageIdx, setPageIdx] = useState(0);
  const page = BVM_READING_PAGES[pageIdx];
  const isLast = pageIdx === BVM_READING_PAGES.length - 1;

  return (
    <div className="reading-task fade-in">
      <div className="reading-task__header">
        <h2>{page.title}</h2>
        <span className="reading-task__page">{pageIdx + 1} / {BVM_READING_PAGES.length}</span>
      </div>
      {page.sections.map((s, i) => (
        <div key={i} className="reading-section">
          <h3 className="reading-section__heading">{s.heading}</h3>
          <p className="reading-section__body">{s.body}</p>
        </div>
      ))}
      <div className="reading-task__actions">
        {pageIdx > 0 && <button className="btn btn--outline" onClick={() => setPageIdx(p => p - 1)}>← Previous</button>}
        <div style={{ flex: 1 }} />
        {!isLast
          ? <button className="btn btn--primary" onClick={() => setPageIdx(p => p + 1)}>Next →</button>
          : <button className="btn btn--primary" onClick={onComplete} disabled={done}>{done ? '✓ Completed' : 'Mark as Read'}</button>
        }
      </div>
    </div>
  );
}

// ─── Task 2: Guided Tour + Interpretation ─────────────────────────────────────
function GraphTourTask({ done, onComplete }) {
  const [phase, setPhase] = useState('tour');
  const [tourStep, setTourStep] = useState(0);
  const [interpIdx, setInterpIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const scenario = INTERPRET[interpIdx];

  function startInterpret() { setPhase('interpret'); setInterpIdx(0); setSelected(null); setSubmitted(false); }

  function nextInterpret() {
    if (interpIdx < INTERPRET.length - 1) { setInterpIdx(i => i + 1); setSelected(null); setSubmitted(false); }
    else onComplete();
  }

  if (phase === 'tour') {
    const stop = TOUR_STOPS[tourStep];
    const isLastStep = tourStep === TOUR_STOPS.length - 1;
    return (
      <div className="graph-task fade-in">
        <div className="graph-task__header">
          <h2>Reading the BVM Graph</h2>
          {tourStep > 0 && <span className="graph-task__step">Step {tourStep} of {TOUR_STOPS.length - 1}</span>}
        </div>

        <BVMGraphDisplay pathD={PATHS.ideal} ufrPath={UFR.constant} revealPct={stop.revealTo} />

        {tourStep === 0 ? (
          <div className="tour-intro">
            <p>This is a Blood Volume Monitor graph. The vertical axis shows <strong>RBV%</strong> (Relative Blood Volume) and the horizontal axis is treatment time in hours.</p>
            <p>The red dashed line marks <strong>85%</strong> — the policy minimum. If RBV drops below this threshold, immediate intervention is required.</p>
            <button className="btn btn--primary" onClick={() => setTourStep(1)}>Begin Tour →</button>
          </div>
        ) : (
          <div className="tour-annotation fade-in" key={tourStep}>
            <div className="tour-annotation__title">{stop.title}</div>
            <p className="tour-annotation__body">{stop.body}</p>
            <div className="tour-annotation__action">
              {!isLastStep
                ? <button className="btn btn--primary btn--sm" onClick={() => setTourStep(s => s + 1)}>Continue →</button>
                : <button className="btn btn--primary" onClick={startInterpret}>Now interpret some graphs →</button>
              }
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="graph-task fade-in">
      <div className="graph-task__header">
        <h2>Interpret the Graph</h2>
        <span className="graph-task__step">{scenario.title} · {interpIdx + 1} of {INTERPRET.length}</span>
      </div>
      <div className="interp-context card">
        <div className="interp-context__label">Clinical context</div>
        <p>{scenario.context}</p>
      </div>
      <BVMGraphDisplay pathD={scenario.pathD} ufrPath={scenario.ufrPath} revealPct={1} />
      <div className="interp-question">
        <p className="interp-question__text">{scenario.question}</p>
        <div className="interp-options">
          {scenario.options.map((opt, i) => (
            <button
              key={i}
              className={['interp-option',
                selected === i ? 'interp-option--selected' : '',
                submitted && i === scenario.correct ? 'interp-option--correct' : '',
                submitted && selected === i && i !== scenario.correct ? 'interp-option--wrong' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => !submitted && setSelected(i)}
              disabled={submitted}
            >
              <span className="interp-option__letter">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>
      </div>
      {!submitted ? (
        <button className="btn btn--primary" onClick={() => setSubmitted(true)} disabled={selected === null} style={{ marginTop: 12 }}>Submit Answer</button>
      ) : (
        <div className={`feedback ${selected === scenario.correct ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{selected === scenario.correct ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{selected === scenario.correct ? 'Correct!' : 'Incorrect'}</div>
            <div className="feedback__explanation">{scenario.explanation}</div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={nextInterpret}>
            {interpIdx < INTERPRET.length - 1 ? 'Next Scenario →' : 'Task Complete ✓'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Task 3: Predict (hover to preview, click to select) ─────────────────────
function GraphPredictTask({ done, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(done);

  const s = PREDICT[idx];

  // Before submit: hovered takes display priority over selected for live preview;
  // selected shows as solid when nothing is hovered.
  const displayId  = submitted ? selected : (hovered || selected);
  const displayChoice = displayId ? s.choices.find(c => c.id === displayId) : null;
  const isGhost = !submitted && displayId !== selected; // hovering a different option = ghost preview

  const contColor = submitted
    ? (selected === s.correct ? '#22c55e' : '#ef4444')
    : isGhost ? 'rgba(20,184,166,0.8)' : 'var(--teal-500)';
  const contOpacity = submitted ? 1 : isGhost ? 0.55 : 1;

  const showCorrectPath = submitted && selected !== s.correct
    ? s.choices.find(c => c.id === s.correct)?.path : null;

  function next() {
    if (idx < PREDICT.length - 1) { setIdx(i => i + 1); setHovered(null); setSelected(null); setSubmitted(false); }
    else { setAllDone(true); onComplete(); }
  }

  if (allDone) {
    return (
      <div className="completion-screen fade-in">
        <div className="completion-screen__icon">✓</div>
        <h2>Task Complete</h2>
        <p><strong>Predict the Outcome</strong> has been marked as complete.</p>
        <button className="btn btn--outline btn--sm" onClick={() => setAllDone(false)}>Review again</button>
      </div>
    );
  }

  return (
    <div className="graph-task fade-in">
      <div className="graph-task__header">
        <h2>Predict the Outcome</h2>
        <span className="graph-task__step">{s.title} · {idx + 1} of {PREDICT.length}</span>
      </div>
      <div className="interp-context card">
        <div className="interp-context__label">Clinical scenario</div>
        <p>{s.context}</p>
      </div>
      <p className="predict-question">{s.question}</p>

      <PredictGraphDisplay
        basePath={s.basePath}
        splitTime={s.splitTime}
        splitRBV={s.splitRBV}
        displayPath={displayChoice?.path}
        displayColor={contColor}
        displayOpacity={contOpacity}
        correctPath={showCorrectPath}
      />

      <div className="predict-choices-v2">
        {s.choices.map(choice => {
          const isHov = !submitted && hovered === choice.id;
          const isSel = selected === choice.id;
          const isCorr = submitted && choice.id === s.correct;
          const isWrong = submitted && isSel && !isCorr;
          return (
            <button
              key={choice.id}
              className={['predict-choice-v2',
                isHov ? 'predict-choice-v2--hovered' : '',
                isSel && !submitted ? 'predict-choice-v2--selected' : '',
                isCorr ? 'predict-choice-v2--correct' : '',
                isWrong ? 'predict-choice-v2--wrong' : '',
              ].filter(Boolean).join(' ')}
              onMouseEnter={() => !submitted && setHovered(choice.id)}
              onMouseLeave={() => !submitted && setHovered(null)}
              onClick={() => !submitted && setSelected(choice.id)}
              disabled={submitted}
            >
              <span className="predict-choice-v2__letter">{choice.id.toUpperCase()}</span>
              <span className="predict-choice-v2__label">{choice.label}</span>
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button className="btn btn--primary" onClick={() => setSubmitted(true)} disabled={!selected} style={{ marginTop: 12 }}>
          Submit Answer
        </button>
      ) : (
        <div className={`feedback ${selected === s.correct ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{selected === s.correct ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{selected === s.correct ? 'Correct!' : 'Incorrect — the correct path is shown in green above'}</div>
            <div className="feedback__explanation">{s.explanation}</div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={next}>
            {idx < PREDICT.length - 1 ? 'Next Scenario →' : 'Complete Task ✓'}
          </button>
        </div>
      )}
    </div>
  );
}

// Prediction graph: shows base path + animates a continuation on hover/select
function PredictGraphDisplay({ basePath, splitTime, splitRBV, displayPath, displayColor, displayOpacity, correctPath }) {
  const splitX = toX(splitTime);
  const splitY = toY(splitRBV);
  return (
    <div className="bvm-graph">
      <svg viewBox="0 0 420 200" className="bvm-graph__svg" role="img" aria-label="BVM prediction graph">
        <GraphAxes />
        {/* Prediction split line */}
        <line x1={splitX} y1="22" x2={splitX} y2="175" stroke="var(--grey-200)" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x={splitX + 4} y="30" fontSize="7.5" fill="var(--text-300)" fontStyle="italic">predict →</text>
        {/* Base path (fully drawn, always visible) */}
        <path d={basePath} stroke="var(--teal-600)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Correct answer overlay (dashed green, shown only when wrong selected) */}
        {correctPath && (
          <path d={correctPath} stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7 4" opacity="0.85" />
        )}
        {/* Hovered/selected continuation (animated draw) */}
        {displayPath && (
          <AnimatedContinuation key={displayPath} path={displayPath} color={displayColor} opacity={displayOpacity} />
        )}
        <circle cx={toX(0)} cy={toY(100)} r="4" fill="var(--teal-600)" />
        <circle cx={splitX} cy={splitY} r="4.5" fill="var(--teal-600)" stroke="var(--surface)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Animates a path in from the left using stroke-dashoffset on each mount
function AnimatedContinuation({ path, color, opacity = 1 }) {
  const ref = useRef(null);
  const [len, setLen] = useState(9999);
  const [offset, setOffset] = useState(9999);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setReady(false);
    setOffset(9999);
    if (ref.current) {
      const l = ref.current.getTotalLength();
      setLen(l);
      setOffset(l);
    }
  }, [path]);

  useEffect(() => {
    if (len < 9999) {
      const t = setTimeout(() => { setReady(true); setOffset(0); }, 20);
      return () => clearTimeout(t);
    }
  }, [len, path]);

  return (
    <path
      ref={ref}
      d={path}
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={len}
      strokeDashoffset={offset}
      opacity={opacity}
      style={{ transition: ready ? 'stroke-dashoffset 0.5s ease-out' : 'none' }}
    />
  );
}

// ─── Shared SVG components ────────────────────────────────────────────────────
function BVMGraphDisplay({ pathD, ufrPath, revealPct = 1, animDuration = 1500 }) {
  const pathRef = useRef(null);
  const [pathLen, setPathLen] = useState(9999);
  const [animReady, setAnimReady] = useState(false);

  useLayoutEffect(() => {
    setAnimReady(false);
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, [pathD]);

  useEffect(() => {
    if (pathLen < 9999) {
      const t = setTimeout(() => setAnimReady(true), 50);
      return () => clearTimeout(t);
    }
  }, [pathLen]);

  const dashOffset = pathLen * (1 - Math.min(revealPct, 1));

  return (
    <div className="bvm-graph">
      <svg viewBox="0 0 420 200" className="bvm-graph__svg" role="img" aria-label="Blood Volume Monitor graph">
        {ufrPath && revealPct > 0 && (
          <path d={ufrPath} fill="rgba(251,191,36,0.32)" stroke="rgba(245,158,11,0.65)" strokeWidth="1" />
        )}
        <GraphAxes />
        {ufrPath && revealPct > 0 && (
          <text x="57" y="173" fontSize="7.5" fill="rgba(161,110,12,0.85)" fontWeight="600">UFR</text>
        )}
        <path
          ref={pathRef}
          d={pathD}
          stroke="var(--teal-600)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLen}
          strokeDashoffset={dashOffset}
          style={{ transition: animReady ? `stroke-dashoffset ${animDuration}ms ease-out` : 'none' }}
        />
        {revealPct > 0 && <circle cx={toX(0)} cy={toY(100)} r="4" fill="var(--teal-600)" />}
      </svg>
    </div>
  );
}

function GraphAxes({ mini = false }) {
  const yLabels = [100, 95, 90, 85, 80, 75];
  const xLabels = [0, 1, 2, 3, 4];
  return (
    <>
      <line x1="55" y1="22" x2="55" y2="175" stroke="var(--grey-300)" strokeWidth="1" />
      <line x1="55" y1="175" x2="390" y2="175" stroke="var(--grey-300)" strokeWidth="1" />
      {yLabels.map(rbv => {
        const y = toY(rbv), is85 = rbv === 85;
        return (
          <g key={rbv}>
            <line x1="55" y1={y} x2="390" y2={y}
              stroke={is85 ? '#ef4444' : 'var(--grey-100)'}
              strokeWidth={is85 ? 1.5 : 0.8}
              strokeDasharray={is85 ? '5 4' : undefined}
            />
            {!mini && (
              <text x="50" y={y + 4} textAnchor="end" fontSize="9"
                fill={is85 ? '#dc2626' : 'var(--text-300)'}
                fontWeight={is85 ? '700' : 'normal'}
              >{rbv}%</text>
            )}
          </g>
        );
      })}
      {!mini && (
        <>
          <text x="393" y={Y_85 + 4}  fontSize="8.5" fill="#dc2626" fontWeight="700">85%</text>
          <text x="393" y={Y_85 + 13} fontSize="7.5" fill="#dc2626">min</text>
        </>
      )}
      {xLabels.map(h => {
        const x = toX(h);
        return (
          <g key={h}>
            <line x1={x} y1="175" x2={x} y2="179" stroke="var(--grey-300)" strokeWidth="1" />
            {!mini && <text x={x} y="191" textAnchor="middle" fontSize="9" fill="var(--text-300)">{h}:00</text>}
          </g>
        );
      })}
      {!mini && (
        <>
          <text x="222" y="200" textAnchor="middle" fontSize="9" fill="var(--text-300)">Time (hours)</text>
          <text x="12" y="100" textAnchor="middle" fontSize="9" fill="var(--text-300)" transform="rotate(-90 12 100)">RBV %</text>
        </>
      )}
    </>
  );
}
