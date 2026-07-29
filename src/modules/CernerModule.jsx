import { useState } from 'react';
import './FluidModule.css';
import './SoftwareModule.css';

const CERNER_MENU = ['Summary', 'Orders', 'Care Plan', 'MAR', 'Results', 'Notes', 'Documentation'];

function CernerChrome({ children, activeMenu = 'Orders', hotspots = null, onHotspot = null, visited = new Set() }) {
  return (
    <div className="cn-window">
      <div className="cn-topbar"><span className="cn-topbar__logo">Cerner PowerChart</span><span className="cn-topbar__menu">Task&nbsp;&nbsp;Edit&nbsp;&nbsp;View&nbsp;&nbsp;Patient&nbsp;&nbsp;Chart&nbsp;&nbsp;Links&nbsp;&nbsp;Help</span></div>
      <div className="cn-banner">
        <div className="cn-banner__name">HARTMANN, Ella&nbsp;<span className="cn-banner__sub">Female · 64 yrs · MRN 55-40-21</span></div>
        <div className="cn-banner__allergy">⚠ Allergies: Penicillin</div>
        <div className="cn-banner__loc">Renal / HD Chair 7</div>
      </div>
      <div className="cn-body">
        <div className="cn-menu">{CERNER_MENU.map((m) => (<div key={m} className={`cn-menuitem ${m === activeMenu ? 'cn-menuitem--active' : ''}`}>{m}</div>))}</div>
        <div className="cn-screen">
          {children}
          {hotspots && hotspots.map((h) => (
            <button key={h.id} className={`cn-hotspot ${visited.has(h.id) ? 'cn-hotspot--seen' : ''}`} style={{ left: h.x, top: h.y }} onClick={() => onHotspot && onHotspot(h.id)}>{h.id}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

const CN_HOTSPOTS = [
  { id: 1, x: '30%', y: '2%', title: 'Patient banner', body: 'Always confirm you are in the correct patient’s chart. The banner shows name, MRN, age, allergies and location — check it before you document anything.' },
  { id: 2, x: '2%', y: '38%', title: 'Chart menu', body: 'Navigate between Orders, Care Plan, the MAR (medication record), Results and Notes. Isolation orders live under Orders.' },
  { id: 3, x: '50%', y: '30%', title: 'Orders area', body: 'Where you place, modify and review orders — including additional (isolation) precautions. Orders here are visible to the whole care team.' },
  { id: 4, x: '55%', y: '70%', title: 'Sign / complete', body: 'Orders and notes are not active until you Sign them. An unsigned isolation order will not display on the patient’s door.' },
];

function CernerTour({ done, onComplete }) {
  const [visited, setVisited] = useState(new Set());
  const [active, setActive] = useState(null);
  const allSeen = visited.size >= CN_HOTSPOTS.length;

  function open(id) { setActive(id); setVisited(v => new Set([...v, id])); }
  const spot = CN_HOTSPOTS.find(h => h.id === active);

  return (
    <div className="ri-task fade-in">
      <div className="ri-task__head"><h2>Cerner — Interface Tour</h2><span className="exercise__progress">{visited.size} / {CN_HOTSPOTS.length} explored</span></div>
      <p className="exercise__instruction">Click each marker to learn the part of the Cerner chart. Explore all four to finish.</p>
      <CernerChrome hotspots={CN_HOTSPOTS} onHotspot={open} visited={visited}>
        <div className="cn-orders"><div className="cn-orders__head">Orders — Additional Precautions</div><div className="cn-orders__empty">No active isolation orders</div></div>
      </CernerChrome>
      {spot && (
        <div className="ri-callout fade-in" key={spot.id}>
          <div className="ri-callout__num">{spot.id}</div>
          <div><div className="ri-callout__title">{spot.title}</div><div className="ri-callout__body">{spot.body}</div></div>
        </div>
      )}
      {allSeen && <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={onComplete} disabled={done}>{done ? '✓ Completed' : 'Finish Tour ✓'}</button>}
    </div>
  );
}

const PRECAUTIONS = [{ id: 'contact', label: 'Contact', color: '#e08a1e' }, { id: 'droplet', label: 'Droplet', color: '#2f8f4e' }, { id: 'airborne', label: 'Airborne', color: '#c0392b' }, { id: 'contact-plus', label: 'Contact Plus', color: '#7d3c98' }];
const ISO_CASES = [
  { id: 1, patient: 'Bed 3 — new admission, stool positive for C. difficile toxin.', answer: 'contact-plus', why: 'C. difficile requires Contact Plus: private room where possible, dedicated equipment, sporicidal cleaning, and gloves/gown — alcohol gel is not sporicidal, so soap-and-water hand hygiene is used.' },
  { id: 2, patient: 'Bed 5 — screening returned MRSA positive on admission.', answer: 'contact', why: 'MRSA (and VRE) are managed with Contact precautions: gloves and gown on entry, dedicated or disinfected equipment.' },
  { id: 3, patient: 'Bed 8 — febrile with confirmed influenza A.', answer: 'droplet', why: 'Influenza is spread by respiratory droplets — Droplet precautions (mask within the patient space, plus standard precautions) are indicated.' },
];

function IsolationTask({ done, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [dropped, setDropped] = useState(null);
  const [dropActive, setDropActive] = useState(false);
  const [signed, setSigned] = useState(false);
  const [allDone, setAllDone] = useState(!!done);

  const c = ISO_CASES[idx];
  const isCorrect = dropped === c.answer;
  const placed = PRECAUTIONS.find(p => p.id === dropped);

  function place(id) { setDropped(id); setPicked(null); setSigned(false); }
  function onDrop(e) { e.preventDefault(); setDropActive(false); const id = e.dataTransfer.getData('text/plain'); if (id) place(id); }
  function next() {
    if (idx < ISO_CASES.length - 1) { setIdx(i => i + 1); setDropped(null); setSigned(false); setPicked(null); }
    else { setAllDone(true); onComplete?.(); }
  }

  if (allDone) return (
    <div className="completion-screen fade-in">
      <div className="completion-screen__icon">✓</div>
      <h2>Task Complete</h2>
      <p><strong>Place Isolation Orders</strong> has been marked complete.</p>
      <button className="btn btn--outline btn--sm" onClick={() => { setAllDone(false); setIdx(0); setDropped(null); setSigned(false); }}>Review again</button>
    </div>
  );

  return (
    <div className="ri-task fade-in">
      <div className="ri-task__head"><h2>Place Isolation Orders</h2><span className="exercise__progress">{idx + 1} / {ISO_CASES.length}</span></div>
      <div className="scenario-card card" style={{ marginBottom: 12 }}><div className="scenario-hint"><span>Patient:</span>{c.patient}</div></div>
      <div className="cn-signs" onDragOver={(e) => e.preventDefault()}>
        <span className="cn-signs__label">Precaution signs:</span>
        {PRECAUTIONS.map(p => (
          <div key={p.id} className={`cn-sign ${picked === p.id ? 'cn-sign--picked' : ''} ${dropped === p.id ? 'cn-sign--used' : ''}`}
            style={{ '--sign': p.color }} draggable={dropped !== p.id} onDragStart={(e) => e.dataTransfer.setData('text/plain', p.id)}
            onClick={() => setPicked(prev => prev === p.id ? null : p.id)} title="Drag onto the order (or click, then click the order zone)">
            {p.label}
          </div>
        ))}
      </div>
      {picked && <div className="ri-pickhint">Selected "{PRECAUTIONS.find(p => p.id === picked).label}" — now click the order drop zone.</div>}
      <div onClick={() => { if (picked) place(picked); }}>
        <CernerChrome>
          <div className="cn-orders">
            <div className="cn-orders__head">Orders — Add Additional Precaution</div>
            <div className={`cn-drop ${!dropped ? 'cn-drop--empty' : ''} ${dropActive ? 'cn-drop--active' : ''}`} onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDropActive(true); }} onDragLeave={() => setDropActive(false)}>
              {placed ? <span className="cn-drop__chip" style={{ '--sign': placed.color }}>{placed.label} Precautions</span> : <span className="cn-drop__hint">Drag a precaution sign here</span>}
            </div>
          </div>
        </CernerChrome>
      </div>
      <div className="ri-actions">
        <button className="btn btn--primary" onClick={() => setSigned(true)} disabled={!dropped}>Sign order</button>
        {dropped && !signed && <span className="ri-actions__hint">Ready to sign {placed.label} Precautions.</span>}
      </div>
      {signed && (
        <div className={`feedback ${isCorrect ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{isCorrect ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{isCorrect ? 'Correct precautions ordered' : 'Wrong precaution type'}</div>
            <div className="feedback__explanation">{isCorrect ? c.why : `${placed.label} is not the best fit here. ${c.why}`}</div>
          </div>
          {isCorrect
            ? <button className="btn btn--primary feedback__next" onClick={next}>{idx < ISO_CASES.length - 1 ? 'Next patient →' : 'Complete Task ✓'}</button>
            : <button className="btn btn--outline feedback__next" onClick={() => { setDropped(null); setSigned(false); }}>Try again</button>}
        </div>
      )}
    </div>
  );
}

const HANDOFF_ITEMS = [
  { id: 'a', text: 'Treatment tolerated: 2.4 L removed, reached target weight, stable BPs.', good: true },
  { id: 'b', text: 'One episode of hypotension at hour 2 — UF reduced, 200 mL saline given, recovered.', good: true },
  { id: 'c', text: 'Contact Plus precautions in place for C. difficile; equipment dedicated.', good: true },
  { id: 'd', text: 'Follow-up electrolytes ordered for next treatment (K protocol change).', good: true },
  { id: 'e', text: 'Patient was "difficult" and complained a lot today.', good: false },
  { id: 'f', text: 'My personal guess about the patient’s home situation.', good: false },
  { id: 'g', text: 'Access site: left jugular CVC, exit site clean, dry, intact.', good: true },
];

function HandoffTask({ done, onComplete }) {
  const [chosen, setChosen] = useState(new Set());
  const [checked, setChecked] = useState(false);
  const [allDone, setAllDone] = useState(!!done);

  function toggle(id) { if (checked) return; setChosen(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  const goodIds = HANDOFF_ITEMS.filter(i => i.good).map(i => i.id);
  const valid = goodIds.every(id => chosen.has(id)) && [...chosen].every(id => goodIds.includes(id));

  if (allDone) return (
    <div className="completion-screen fade-in">
      <div className="completion-screen__icon">✓</div>
      <h2>Task Complete</h2>
      <p><strong>End-of-Shift Handoff</strong> has been marked complete.</p>
    </div>
  );

  return (
    <div className="ri-task fade-in">
      <div className="ri-task__head"><h2>End-of-Shift Handoff</h2></div>
      <p className="exercise__instruction">Select every item that belongs in Ms. Hartmann's end-of-shift documentation — and leave out anything that doesn't. Good handoff is factual, objective, and complete.</p>
      <CernerChrome activeMenu="Documentation">
        <div className="cn-orders">
          <div className="cn-orders__head">Documentation — Shift Handoff Note</div>
          <div className="cn-handoff">
            {HANDOFF_ITEMS.map(item => {
              const on = chosen.has(item.id);
              const showState = checked ? (item.good ? 'good' : (on ? 'bad' : '')) : '';
              return (
                <label key={item.id} className={`cn-handoff__item ${on ? 'cn-handoff__item--on' : ''} cn-handoff__item--${showState}`}>
                  <input type="checkbox" checked={on} onChange={() => toggle(item.id)} disabled={checked} />
                  <span>{item.text}</span>
                  {checked && item.good && <span className="cn-tag cn-tag--good">include</span>}
                  {checked && !item.good && on && <span className="cn-tag cn-tag--bad">leave out</span>}
                </label>
              );
            })}
          </div>
        </div>
      </CernerChrome>
      {!checked ? (
        <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => setChecked(true)} disabled={chosen.size === 0}>Sign handoff</button>
      ) : (
        <div className={`feedback ${valid ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{valid ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{valid ? 'Clear, objective handoff' : 'Review your selections'}</div>
            <div className="feedback__explanation">{valid
              ? 'You included the treatment summary, the hypotension event and response, isolation status, follow-up labs, and the access assessment — and left out subjective, non-clinical remarks.'
              : 'A good handoff includes the objective clinical facts and excludes subjective judgements or personal opinions. Adjust and sign again.'}</div>
          </div>
          {valid
            ? <button className="btn btn--primary feedback__next" onClick={() => { setAllDone(true); onComplete?.(); }}>Complete Task ✓</button>
            : <button className="btn btn--outline feedback__next" onClick={() => setChecked(false)}>Fix it</button>}
        </div>
      )}
    </div>
  );
}

export default function CernerModule({ questId, onTaskComplete, taskProgress }) {
  const [activeTask, setActiveTask] = useState(0);
  const tasks = [
    { key: 'tour', label: 'Interface Tour' },
    { key: 'isolation', label: 'Place Isolation Orders' },
    { key: 'handoff', label: 'End-of-Shift Handoff' },
  ];

  return (
    <div className="module-layout">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--task">Software</span>
          <h3 className="module-sidebar__title">Cerner</h3>
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
          <div className="module-formula-title">Cerner</div>
          <p style={{ fontSize: 12, color: 'var(--text-500)', lineHeight: 1.5, margin: 0 }}>The hospital-wide record. In dialysis you'll use it for isolation orders, care plans, and shift documentation.</p>
        </div>
      </aside>

      <main className="module-content ri-content">
        {tasks[activeTask].key === 'tour' && <CernerTour done={taskProgress['tour']} onComplete={() => onTaskComplete(questId, 'tour')} />}
        {tasks[activeTask].key === 'isolation' && <IsolationTask done={taskProgress['isolation']} onComplete={() => onTaskComplete(questId, 'isolation')} />}
        {tasks[activeTask].key === 'handoff' && <HandoffTask done={taskProgress['handoff']} onComplete={() => onTaskComplete(questId, 'handoff')} />}
      </main>
    </div>
  );
}
