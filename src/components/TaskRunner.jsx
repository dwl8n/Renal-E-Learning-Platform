import { useState } from 'react';
import { useApp } from '../context';
import { LinkedText } from '../utils/linkGlossary';
import RefTip from './RefTip';
import './TaskRunner.css';

// ─── Generic segmented-task runner ────────────────────────────────────────────
// A task is an ordered list of heterogeneous `segments`. The runner walks the
// learner through them, owns the shared footer (progress + Continue), and
// records answers so later segments (callbacks) can refer back to earlier ones.
//
// Segment types: character | hook | prose | figure | question | callback | decision
// `figure` segments delegate rendering to figureRenderers[seg.kind] so the
// runner stays decoupled from any domain-specific visual (e.g. the BVM curve).

function isGated(seg, answer) {
  switch (seg.type) {
    case 'hook':
      return Array.isArray(seg.options) && answer == null; // must make a guess
    case 'question':
      if (answer == null) return true;
      return seg.gating === 'block' && !answer.correct; // block until correct
    case 'decision':
      return answer == null; // must choose (bad choices still advance to debrief)
    default:
      return false; // character | prose | figure | callback are read-only
  }
}

export default function TaskRunner({ title, segments, figureRenderers = {}, onComplete, done }) {
  const { dispatch } = useApp();
  const openJournal = (target) => dispatch({ type: 'JOURNAL_OPEN', target });

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(!!done);

  if (finished) {
    return (
      <div className="completion-screen fade-in">
        <div className="completion-screen__icon">✓</div>
        <h2>Task Complete</h2>
        <p><strong>{title}</strong> has been marked as complete.</p>
        <button
          className="btn btn--outline btn--sm"
          onClick={() => { setFinished(false); setIdx(0); setAnswers({}); }}
        >Review again</button>
      </div>
    );
  }

  const seg = segments[idx];
  const key = seg.id || `${seg.type}-${idx}`;
  const answer = answers[key];
  const setAnswer = (val) => setAnswers(a => ({ ...a, [key]: val }));
  const isLast = idx === segments.length - 1;
  const gated = isGated(seg, answer);

  function advance() {
    if (isLast) { setFinished(true); onComplete?.(); }
    else setIdx(i => i + 1);
  }

  return (
    <div className="task-runner fade-in">
      <div className="task-runner__header">
        <h2>{title}</h2>
        <span className="task-runner__progress">{idx + 1} / {segments.length}</span>
      </div>

      <div className="task-runner__stage" key={idx}>
        <Segment
          seg={seg}
          answer={answer}
          setAnswer={setAnswer}
          openJournal={openJournal}
          figureRenderers={figureRenderers}
        />
      </div>

      <div className="task-runner__footer">
        <div className="task-runner__dots" aria-hidden="true">
          {segments.map((_, i) => (
            <span key={i} className={`trdot ${i === idx ? 'trdot--active' : ''} ${i < idx ? 'trdot--done' : ''}`} />
          ))}
        </div>
        <button className="btn btn--primary" onClick={advance} disabled={gated}>
          {isLast ? 'Complete Task ✓' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}

// ─── Segment dispatch ─────────────────────────────────────────────────────────
function Segment({ seg, answer, setAnswer, openJournal, figureRenderers }) {
  switch (seg.type) {
    case 'character': return <CharacterSeg seg={seg} />;
    case 'hook':      return <HookSeg seg={seg} answer={answer} setAnswer={setAnswer} />;
    case 'prose':     return <ProseSeg seg={seg} openJournal={openJournal} />;
    case 'figure':    return <FigureSeg seg={seg} figureRenderers={figureRenderers} />;
    case 'question':  return <QuestionSeg seg={seg} answer={answer} setAnswer={setAnswer} />;
    case 'callback':  return <CallbackSeg seg={seg} />;
    case 'decision':  return <DecisionSeg seg={seg} answer={answer} setAnswer={setAnswer} />;
    default:          return <p className="trseg-fallback">Unknown segment type: {seg.type}</p>;
  }
}

function CharacterSeg({ seg }) {
  return (
    <div className="trseg trseg-character card">
      <div className="trseg-character__head">
        <span className="trseg-character__avatar" aria-hidden="true">🧑</span>
        <div>
          <div className="trseg-character__name">{seg.name}</div>
          {seg.context && <div className="trseg-character__context">{seg.context}</div>}
        </div>
      </div>
      {seg.vitals && (
        <div className="trseg-character__vitals">
          {Object.entries(seg.vitals).map(([k, v]) => (
            <div key={k} className="trvital">
              <span className="trvital__label">{k.toUpperCase()}</span>
              <span className="trvital__value">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HookSeg({ seg, answer, setAnswer }) {
  const guessed = answer != null;
  return (
    <div className="trseg trseg-hook">
      <div className="trseg-hook__badge">Think about it</div>
      <p className="trseg-hook__prompt">{seg.prompt}</p>
      {Array.isArray(seg.options) && (
        <div className="trseg-hook__options">
          {seg.options.map((opt, i) => (
            <button
              key={i}
              className={`trseg-hook__option ${answer === i ? 'trseg-hook__option--picked' : ''}`}
              onClick={() => !guessed && setAnswer(i)}
              disabled={guessed}
            >
              {opt.text || opt}
            </button>
          ))}
        </div>
      )}
      {guessed && seg.teaser && (
        <p className="trseg-hook__teaser fade-in">{seg.teaser}</p>
      )}
    </div>
  );
}

function ProseSeg({ seg, openJournal }) {
  return (
    <div className="trseg trseg-prose">
      {seg.heading && (
        <h3 className="trseg-prose__heading">
          {seg.heading}
          {seg.ref && <RefTip {...seg.ref} />}
        </h3>
      )}
      <div className="trseg-prose__body">
        <LinkedText text={seg.body} onOpen={openJournal} />
      </div>
    </div>
  );
}

function FigureSeg({ seg, figureRenderers }) {
  const Renderer = figureRenderers[seg.kind];
  return (
    <div className="trseg trseg-figure">
      {Renderer
        ? <Renderer seg={seg} />
        : <p className="trseg-fallback">No renderer for figure kind: {seg.kind}</p>}
      {seg.caption && <p className="trseg-figure__caption">{seg.caption}</p>}
    </div>
  );
}

function QuestionSeg({ seg, answer, setAnswer }) {
  const answered = answer != null;
  function choose(i) {
    if (answered) return;
    setAnswer({ choice: i, correct: !!seg.options[i].correct });
  }
  return (
    <div className="trseg trseg-question">
      <p className="trseg-question__prompt">{seg.prompt}</p>
      <div className="trseg-question__options">
        {seg.options.map((opt, i) => {
          const picked = answered && answer.choice === i;
          const cls = ['trseg-option',
            picked ? 'trseg-option--picked' : '',
            answered && opt.correct ? 'trseg-option--correct' : '',
            picked && !opt.correct ? 'trseg-option--wrong' : '',
          ].filter(Boolean).join(' ');
          return (
            <button key={i} className={cls} onClick={() => choose(i)} disabled={answered}>
              <span className="trseg-option__letter">{String.fromCharCode(65 + i)}</span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`trseg-feedback ${answer.correct ? 'trseg-feedback--good' : 'trseg-feedback--bad'} fade-in`}>
          {seg.options[answer.choice].feedback}
        </div>
      )}
    </div>
  );
}

function CallbackSeg({ seg }) {
  return (
    <div className="trseg trseg-callback">
      <span className="trseg-callback__icon" aria-hidden="true">↩</span>
      <p className="trseg-callback__text">{seg.text}</p>
    </div>
  );
}

function DecisionSeg({ seg, answer, setAnswer }) {
  const decided = answer != null;
  const chosen = decided ? seg.options[answer.choice] : null;
  return (
    <div className="trseg trseg-decision">
      <div className="trseg-decision__situation card">
        <div className="trseg-decision__label">Your call</div>
        <p>{seg.situation}</p>
      </div>
      <div className="trseg-decision__options">
        {seg.options.map((opt, i) => {
          const picked = decided && answer.choice === i;
          const cls = ['trseg-option',
            picked ? `trseg-option--${opt.outcome === 'good' ? 'correct' : 'wrong'}` : '',
            decided && !picked ? 'trseg-option--dim' : '',
          ].filter(Boolean).join(' ');
          return (
            <button
              key={i}
              className={cls}
              onClick={() => !decided && setAnswer({ choice: i, outcome: opt.outcome })}
              disabled={decided}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
      {decided && (
        <div className={`trseg-outcome trseg-outcome--${chosen.outcome} fade-in`}>
          <div className="trseg-outcome__head">
            {chosen.outcome === 'good' ? '✓ ' : '✗ '}{chosen.consequence}
          </div>
          {chosen.debrief && <div className="trseg-outcome__debrief">{chosen.debrief}</div>}
        </div>
      )}
    </div>
  );
}
