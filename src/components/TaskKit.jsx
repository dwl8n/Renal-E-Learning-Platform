import { useState } from 'react';
import { useApp } from '../context';
import { LinkedText } from '../utils/linkGlossary';
import RefTip from './RefTip';
import './TaskKit.css';

// ─── Shared task primitives ────────────────────────────────────────────────────
// Reusable across Vascular Access and Patient Care: Fluids modules, matching
// DESIGN.md's note that documentation practice, matching, and step-ordering are
// reused formats. Each primitive owns its own completion screen so callers just
// pass `done`/`onComplete`, matching the convention used elsewhere (FluidModule,
// InfectionControlModule).

export function TaskComplete({ title, onReview }) {
  return (
    <div className="completion-screen fade-in">
      <div className="completion-screen__icon">✓</div>
      <h2>Task Complete</h2>
      <p><strong>{title}</strong> has been marked as complete.</p>
      <button className="btn btn--outline btn--sm" onClick={onReview}>Review again</button>
    </div>
  );
}

// ─── Multi-page reading task ────────────────────────────────────────────────────
// `pages`: [{ title, sections: [{ heading, body, ref? }] }]. Supports inline
// glossary links and RefTip deep-links, matching FluidModule's reading pattern.
export function ReadingTask({ pages, done, onComplete }) {
  const { dispatch } = useApp();
  const openJournal = (target) => dispatch({ type: 'JOURNAL_OPEN', target });
  const [pageIdx, setPageIdx] = useState(0);
  const page = pages[pageIdx];
  const isLast = pageIdx === pages.length - 1;

  return (
    <div className="reading-task fade-in">
      <div className="reading-task__header">
        <h2>{page.title}</h2>
        <span className="reading-task__page">{pageIdx + 1} / {pages.length}</span>
      </div>
      {page.sections.map((section, i) => (
        <div key={i} className="reading-section">
          <h3 className="reading-section__heading">
            {section.heading}
            {section.ref && <RefTip {...section.ref} />}
          </h3>
          <p className="reading-section__body">
            <LinkedText text={section.body} onOpen={openJournal} />
          </p>
        </div>
      ))}
      <div className="reading-task__actions">
        {pageIdx > 0 && <button className="btn btn--outline" onClick={() => setPageIdx(p => p - 1)}>← Previous</button>}
        <div style={{ flex: 1 }} />
        {!isLast
          ? <button className="btn btn--primary" onClick={() => setPageIdx(p => p + 1)}>Next →</button>
          : <button className="btn btn--primary" onClick={onComplete} disabled={done}>{done ? '✓ Completed' : 'Mark as Read'}</button>}
      </div>
    </div>
  );
}

// ─── Step ordering exercise ────────────────────────────────────────────────────
// `steps` given in the CORRECT order; the picker list is shuffled deterministically.
function shuffle(arr, seed = 7) {
  const a = [...arr];
  let s = seed;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function StepOrder({ title, instruction, steps, correctExplanation, wrongExplanation, done, onComplete }) {
  const [options] = useState(() => shuffle(steps));
  const [sequence, setSequence] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(!!done);

  if (allDone) return <TaskComplete title={title} onReview={() => setAllDone(false)} />;

  const correctOrder = steps.map(s => s.id);
  const isCorrect = submitted && sequence.every((id, i) => id === correctOrder[i]);

  function pick(id) {
    if (submitted || sequence.includes(id)) return;
    setSequence(s => [...s, id]);
  }
  function reset() { setSequence([]); setSubmitted(false); }
  function finish() { setAllDone(true); onComplete?.(); }

  return (
    <div className="exercise fade-in">
      <div className="exercise__header">
        <h2>{title}</h2>
        <span className="exercise__progress">{sequence.length} / {steps.length} placed</span>
      </div>
      <p className="exercise__instruction">{instruction}</p>

      <div className="tk-slots">
        {steps.map((_, i) => {
          const placedId = sequence[i];
          const placed = placedId ? steps.find(s => s.id === placedId) : null;
          const good = submitted && placed && placed.id === correctOrder[i];
          const bad = submitted && placed && placed.id !== correctOrder[i];
          return (
            <div key={i} className={`tk-slot ${placed ? 'tk-slot--filled' : ''} ${good ? 'tk-slot--good' : ''} ${bad ? 'tk-slot--bad' : ''}`}>
              <span className="tk-slot__num">{i + 1}</span>
              {placed
                ? <><span className="tk-slot__icon">{placed.icon}</span><span className="tk-slot__label">{placed.label}</span></>
                : <span className="tk-slot__empty">—</span>}
            </div>
          );
        })}
      </div>

      <div className="tk-pills">
        {options.map(step => {
          const used = sequence.includes(step.id);
          return (
            <button key={step.id} className={`tk-pill ${used ? 'tk-pill--used' : ''}`} onClick={() => pick(step.id)} disabled={used || submitted}>
              <span className="tk-pill__icon">{step.icon}</span>
              <span className="tk-pill__body">
                <span className="tk-pill__label">{step.label}</span>
                {step.detail && <span className="tk-pill__detail">{step.detail}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <div className="tk-actions">
          <button className="btn btn--outline" onClick={reset} disabled={!sequence.length}>Reset</button>
          <button className="btn btn--primary" onClick={() => setSubmitted(true)} disabled={sequence.length !== steps.length}>Check order</button>
        </div>
      ) : isCorrect ? (
        <div className="feedback feedback--correct">
          <div className="feedback__icon">✓</div>
          <div className="feedback__body">
            <div className="feedback__title">Correct sequence</div>
            <div className="feedback__explanation">{correctExplanation}</div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={finish}>Complete Task ✓</button>
        </div>
      ) : (
        <div className="feedback feedback--wrong">
          <div className="feedback__icon">✗</div>
          <div className="feedback__body">
            <div className="feedback__title">Order needs adjustment</div>
            <div className="feedback__explanation">{wrongExplanation}</div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={reset}>Try Again</button>
        </div>
      )}
    </div>
  );
}

// ─── Matching exercise ──────────────────────────────────────────────────────────
// `pairs`: [{ id, left, right }]. Tap a left pill then a right pill to match them.
export function MatchGrid({ title, instruction, leftLabel, rightLabel, pairs, done, onComplete }) {
  const [rightOrder] = useState(() => shuffle(pairs));
  const [matched, setMatched] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [wrongFlash, setWrongFlash] = useState(null); // { left, right }
  const [allDone, setAllDone] = useState(!!done);

  if (allDone) return <TaskComplete title={title} onReview={() => setAllDone(false)} />;

  const isComplete = matched.length === pairs.length;

  function pickLeft(id) {
    if (matched.includes(id)) return;
    setSelectedLeft(id);
    setWrongFlash(null);
  }
  function pickRight(id) {
    if (!selectedLeft || matched.includes(id)) return;
    if (selectedLeft === id) {
      setMatched(m => [...m, id]);
      setSelectedLeft(null);
    } else {
      setWrongFlash({ left: selectedLeft, right: id });
      setTimeout(() => setWrongFlash(null), 550);
      setSelectedLeft(null);
    }
  }
  function finish() { setAllDone(true); onComplete?.(); }

  return (
    <div className="exercise fade-in">
      <div className="exercise__header">
        <h2>{title}</h2>
        <span className="exercise__progress">{matched.length} / {pairs.length} matched</span>
      </div>
      <p className="exercise__instruction">{instruction}</p>

      <div className="tk-match-grid">
        <div className="tk-match-col">
          <div className="tk-match-col__label">{leftLabel}</div>
          {pairs.map(p => {
            const isMatched = matched.includes(p.id);
            const isSel = selectedLeft === p.id;
            const isWrong = wrongFlash?.left === p.id;
            return (
              <button key={p.id} className={`tk-match-pill ${isMatched ? 'tk-match-pill--matched' : ''} ${isSel ? 'tk-match-pill--selected' : ''} ${isWrong ? 'tk-match-pill--wrong' : ''}`}
                onClick={() => pickLeft(p.id)} disabled={isMatched}>
                {p.left}
              </button>
            );
          })}
        </div>
        <div className="tk-match-col">
          <div className="tk-match-col__label">{rightLabel}</div>
          {rightOrder.map(p => {
            const isMatched = matched.includes(p.id);
            const isWrong = wrongFlash?.right === p.id;
            return (
              <button key={p.id} className={`tk-match-pill ${isMatched ? 'tk-match-pill--matched' : ''} ${isWrong ? 'tk-match-pill--wrong' : ''}`}
                onClick={() => pickRight(p.id)} disabled={isMatched}>
                {p.right}
              </button>
            );
          })}
        </div>
      </div>

      {isComplete && (
        <div className="feedback feedback--correct">
          <div className="feedback__icon">✓</div>
          <div className="feedback__body">
            <div className="feedback__title">All matched correctly</div>
            <div className="feedback__explanation">Nice work — every pair is matched.</div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={finish}>Complete Task ✓</button>
        </div>
      )}
    </div>
  );
}

// ─── Mock documentation / charting form ─────────────────────────────────────────
// `fields`: [{ key, label, type: 'select'|'text', options?, correct, placeholder? }]
export function DocForm({ title, scenario, fields, done, onComplete }) {
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(!!done);

  if (allDone) return <TaskComplete title={title} onReview={() => setAllDone(false)} />;

  const allFilled = fields.every(f => (values[f.key] ?? '').toString().trim().length > 0);
  const isCorrect = (f) => {
    const v = (values[f.key] ?? '').toString().trim().toLowerCase();
    const correct = f.correct.toString().trim().toLowerCase();
    return f.type === 'text' ? v.length > 0 : v === correct;
  };
  const allCorrect = submitted && fields.every(isCorrect);

  function setVal(key, v) { setValues(vals => ({ ...vals, [key]: v })); }
  function finish() { setAllDone(true); onComplete?.(); }

  return (
    <div className="exercise fade-in">
      <div className="exercise__header">
        <h2>{title}</h2>
      </div>
      {scenario && (
        <div className="scenario-card card">
          <div className="scenario-card__name">Scenario</div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-500)', lineHeight: 1.55 }}>{scenario}</p>
        </div>
      )}

      <div className="tk-form">
        {fields.map(f => {
          const wrong = submitted && !isCorrect(f);
          const good = submitted && isCorrect(f);
          return (
            <div key={f.key} className={`tk-field ${wrong ? 'tk-field--wrong' : ''} ${good ? 'tk-field--good' : ''}`}>
              <label className="tk-field__label">{f.label}</label>
              {f.type === 'select' ? (
                <select className="tk-field__select" value={values[f.key] ?? ''} disabled={submitted}
                  onChange={e => setVal(f.key, e.target.value)}>
                  <option value="" disabled>Select…</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input className="tk-field__input" type="text" value={values[f.key] ?? ''} disabled={submitted}
                  placeholder={f.placeholder || ''} onChange={e => setVal(f.key, e.target.value)} />
              )}
              {wrong && f.hint && <div className="tk-field__hint">{f.hint}</div>}
            </div>
          );
        })}
      </div>

      {!submitted ? (
        <div className="tk-actions">
          <button className="btn btn--primary" onClick={() => setSubmitted(true)} disabled={!allFilled}>Submit Documentation</button>
        </div>
      ) : allCorrect ? (
        <div className="feedback feedback--correct">
          <div className="feedback__icon">✓</div>
          <div className="feedback__body">
            <div className="feedback__title">Charted correctly</div>
            <div className="feedback__explanation">Every field matches what this scenario calls for.</div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={finish}>Complete Task ✓</button>
        </div>
      ) : (
        <div className="feedback feedback--wrong">
          <div className="feedback__icon">✗</div>
          <div className="feedback__body">
            <div className="feedback__title">A few fields need a second look</div>
            <div className="feedback__explanation">Fields in red don't match the scenario. Review the hints and try again.</div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={() => setSubmitted(false)}>Try Again</button>
        </div>
      )}
    </div>
  );
}

// ─── Sequential MCQ scenarios ───────────────────────────────────────────────────
// `scenarios`: [{ id, title, context, question, options, correct, explanation }]
export function ScenarioSet({ title, scenarios, done, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [allDone, setAllDone] = useState(!!done);

  if (allDone) return <TaskComplete title={title} onReview={() => setAllDone(false)} />;

  const s = scenarios[idx];
  const isLast = idx === scenarios.length - 1;

  function next() {
    if (isLast) { setAllDone(true); onComplete?.(); }
    else { setIdx(i => i + 1); setSelected(null); setSubmitted(false); }
  }

  return (
    <div className="exercise fade-in">
      <div className="exercise__header">
        <h2>{title}</h2>
        <span className="exercise__progress">{s.title || `Scenario ${idx + 1}`} · {idx + 1} of {scenarios.length}</span>
      </div>
      <div className="scenario-card card">
        <div className="scenario-card__name">Clinical context</div>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-500)', lineHeight: 1.55 }}>{s.context}</p>
      </div>
      <p className="exercise__instruction" style={{ fontWeight: 600, color: 'var(--text-700)' }}>{s.question}</p>
      <div className="tk-pills tk-pills--stack">
        {s.options.map((opt, i) => {
          const picked = selected === i;
          const showCorrect = submitted && i === s.correct;
          const showWrong = submitted && picked && i !== s.correct;
          return (
            <button key={i}
              className={`tk-mcq ${picked ? 'tk-mcq--picked' : ''} ${showCorrect ? 'tk-mcq--correct' : ''} ${showWrong ? 'tk-mcq--wrong' : ''}`}
              onClick={() => !submitted && setSelected(i)} disabled={submitted}>
              <span className="tk-mcq__letter">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button className="btn btn--primary" onClick={() => setSubmitted(true)} disabled={selected === null} style={{ marginTop: 12 }}>Submit Answer</button>
      ) : (
        <div className={`feedback ${selected === s.correct ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{selected === s.correct ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{selected === s.correct ? 'Correct!' : 'Incorrect'}</div>
            <div className="feedback__explanation">{s.explanation}</div>
          </div>
          <button className="btn btn--primary feedback__next" onClick={next}>{isLast ? 'Complete Task ✓' : 'Next Scenario →'}</button>
        </div>
      )}
    </div>
  );
}
