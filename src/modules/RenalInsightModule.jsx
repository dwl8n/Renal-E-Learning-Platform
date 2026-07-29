import { useState } from 'react';
import './FluidModule.css';
import './SoftwareModule.css';

const SIDE_NAV = ['Hemo Session', 'Orders', 'Lab Results', 'Clinical Functions', 'Alerts', 'Reports', 'About'];
const BOTTOM_TABS = ['Day Hemo Order', 'Pre dialysis', 'Intra dialysis', 'Post dialysis', 'Nurses Worksheet', 'Observ.', 'Medication List'];

function RIChrome({ children, activeTab = 'Day Hemo Order', activeNav = 'Hemo Session', hotspots = null, onHotspot = null, visited = new Set() }) {
  return (
    <div className="ri-window">
      <div className="ri-titlebar">Renal Insight — Hemodialysis</div>
      <div className="ri-body">
        <div className="ri-sidenav">
          {SIDE_NAV.map((n) => (<div key={n} className={`ri-navbtn ${n === activeNav ? 'ri-navbtn--active' : ''}`}>{n}</div>))}
          <div className="ri-navbtn ri-navbtn--yellow ri-navbtn--save">Save</div>
        </div>
        <div className="ri-screen">
          {children}
          {hotspots && hotspots.map((h) => (
            <button key={h.id} className={`ri-hotspot ${visited.has(h.id) ? 'ri-hotspot--seen' : ''}`} style={{ left: h.x, top: h.y }} onClick={() => onHotspot && onHotspot(h.id)}>{h.id}</button>
          ))}
        </div>
      </div>
      <div className="ri-tabbar">{BOTTOM_TABS.map((t) => (<div key={t} className={`ri-tab ${t === activeTab ? 'ri-tab--active' : ''}`}>{t}</div>))}</div>
    </div>
  );
}

function RIField({ label, value, muted = false }) {
  return (
    <div className="ri-field">
      <span className="ri-field__label">{label}</span>
      <span className={`ri-field__value ${muted ? 'ri-field__value--muted' : ''}`}>{value}</span>
    </div>
  );
}

function DayOrderForm({ dialysate = '—', kValue = '—', duration = '4.00', bloodFlow = '350', highlightDrop = false, onDrop, onDragOver, dropActive = false }) {
  return (
    <div className="ri-form">
      <div className="ri-form__banner">Day's Hemodialysis Order</div>
      <div className="ri-grid">
        <RIField label="Dialysis Process" value="Hemodiafiltration" />
        <RIField label="Procedure" value="CONVENTIONAL (1–4 Treatments)" />
        <RIField label="Access Type" value="Permanent central venous line" />
        <RIField label="Access Site" value="Left jugular" muted />
      </div>
      <div className="ri-form__banner">Parameters</div>
      <div className="ri-grid ri-grid--params">
        <RIField label="Dialyzer" value="Elisio 25H" />
        <div className={`ri-field ${highlightDrop ? 'ri-field--drop' : ''} ${dropActive ? 'ri-field--drop-active' : ''}`} onDrop={onDrop} onDragOver={onDragOver}>
          <span className="ri-field__label">Dialysate</span>
          <span className={`ri-field__value ${dialysate === '—' ? 'ri-field__value--empty' : ''}`}>{dialysate}</span>
          {highlightDrop && dialysate === '—' && <span className="ri-field__drophint">drop here</span>}
        </div>
        <RIField label="Duration" value={`${duration} h`} />
        <RIField label="K+" value={`${kValue} mmol/L`} muted />
        <RIField label="Target Weight" value="104.50 kg" />
        <RIField label="Blood Flow" value={`${bloodFlow} mL/min`} />
      </div>
    </div>
  );
}

const TOUR_HOTSPOTS = [
  { id: 1, x: '2%', y: '6%', title: 'Side navigation', body: 'Move between the Hemo Session, Orders, Lab Results, Clinical Functions and Alerts areas. Most charting during a treatment happens under Hemo Session.' },
  { id: 2, x: '30%', y: '20%', title: "Day's Hemodialysis Order", body: "The core order for today's treatment: process, access, dialyzer, dialysate, duration and target weight. Confirm this matches the patient's current order before you start." },
  { id: 3, x: '52%', y: '55%', title: 'Dialysate / K+', body: 'The dialysate ("bath") sets the potassium concentration removed during treatment. This is the field you change when the Potassium Protocol indicates a different bath.' },
  { id: 4, x: '30%', y: '90%', title: 'Bottom tabs', body: 'Switch between Day Hemo Order, Pre / Intra / Post dialysis records, the Nurses Worksheet, Observations, and the Medication List.' },
  { id: 5, x: '90%', y: '2%', title: 'Save', body: 'Always Save after entering or changing data. Unsaved charting is not part of the record and will not be visible to the next nurse.' },
];

function InterfaceTour({ done, onComplete }) {
  const [visited, setVisited] = useState(new Set());
  const [active, setActive] = useState(null);
  const allSeen = visited.size >= TOUR_HOTSPOTS.length;

  function open(id) { setActive(id); setVisited(v => new Set([...v, id])); }
  const activeSpot = TOUR_HOTSPOTS.find(h => h.id === active);

  return (
    <div className="ri-task fade-in">
      <div className="ri-task__head"><h2>Renal Insight — Interface Tour</h2><span className="exercise__progress">{visited.size} / {TOUR_HOTSPOTS.length} explored</span></div>
      <p className="exercise__instruction">Click each numbered marker to learn what that part of the screen does. Explore all five to finish.</p>
      <RIChrome hotspots={TOUR_HOTSPOTS} onHotspot={open} visited={visited}><DayOrderForm dialysate="~K1.0-A1246" kValue="1.000" /></RIChrome>
      {activeSpot && (
        <div className="ri-callout fade-in" key={activeSpot.id}>
          <div className="ri-callout__num">{activeSpot.id}</div>
          <div><div className="ri-callout__title">{activeSpot.title}</div><div className="ri-callout__body">{activeSpot.body}</div></div>
        </div>
      )}
      {allSeen && <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={onComplete} disabled={done}>{done ? '✓ Completed' : 'Finish Tour ✓'}</button>}
    </div>
  );
}

const CARTRIDGES = [{ id: '3K', label: '~K3.0-A1234', k: '3.000' }, { id: '2K', label: '~K2.0-A1240', k: '2.000' }, { id: '1K', label: '~K1.0-A1246', k: '1.000' }];
const CORRECT_CART = '1K';

function DayOrderTask({ done, onComplete }) {
  const [picked, setPicked] = useState(null);
  const [dropped, setDropped] = useState(null);
  const [dropActive, setDropActive] = useState(false);
  const [saved, setSaved] = useState(false);
  const [allDone, setAllDone] = useState(!!done);

  const placedCart = CARTRIDGES.find(c => c.id === dropped);
  const isCorrect = dropped === CORRECT_CART;

  function place(id) { setDropped(id); setPicked(null); setSaved(false); }
  function onDrop(e) { e.preventDefault(); setDropActive(false); const id = e.dataTransfer.getData('text/plain'); if (id) place(id); }
  function zoneClick() { if (picked) place(picked); }

  if (allDone) return (
    <div className="completion-screen fade-in">
      <div className="completion-screen__icon">✓</div>
      <h2>Task Complete</h2>
      <p><strong>Set the Day Hemo Order</strong> has been marked complete.</p>
      <button className="btn btn--outline btn--sm" onClick={() => { setAllDone(false); setDropped(null); setSaved(false); }}>Try again</button>
    </div>
  );

  return (
    <div className="ri-task fade-in">
      <div className="ri-task__head"><h2>Set the Day Hemo Order</h2></div>
      <div className="scenario-card card" style={{ marginBottom: 14 }}>
        <div className="scenario-card__name">Patient: <strong>Ms. E. Hartmann</strong> · ICHD 3×/week, on protocol</div>
        <div className="scenario-hint"><span>Task:</span>Pre-dialysis K⁺ is <strong>5.6 mmol/L</strong>; she is currently prescribed a <strong>3K</strong> bath. Per the Potassium Protocol, drag the correct dialysate concentrate onto the Dialysate field, then Save.</div>
      </div>
      <div className="ri-cartridges" onDragOver={(e) => e.preventDefault()}>
        <span className="ri-cartridges__label">Dialysate concentrates:</span>
        {CARTRIDGES.map(c => (
          <div key={c.id} className={`ri-cartridge ${picked === c.id ? 'ri-cartridge--picked' : ''} ${dropped === c.id ? 'ri-cartridge--used' : ''}`}
            draggable={dropped !== c.id} onDragStart={(e) => e.dataTransfer.setData('text/plain', c.id)}
            onClick={() => setPicked(p => p === c.id ? null : c.id)} title="Drag onto the Dialysate field (or click, then click the field)">
            <span className="ri-cartridge__k">{c.id}</span><span className="ri-cartridge__code">{c.label}</span>
          </div>
        ))}
      </div>
      {picked && <div className="ri-pickhint">Selected {picked} — now click the highlighted Dialysate field.</div>}
      <div onClick={zoneClick}>
        <RIChrome><DayOrderForm dialysate={placedCart ? placedCart.label : '—'} kValue={placedCart ? placedCart.k : '—'} highlightDrop={!dropped} dropActive={dropActive} onDragOver={(e) => { e.preventDefault(); setDropActive(true); }} onDrop={onDrop} /></RIChrome>
      </div>
      <div className="ri-actions">
        <button className="btn btn--primary" onClick={() => setSaved(true)} disabled={!dropped}>Save</button>
        {dropped && !saved && <span className="ri-actions__hint">Dialysate set to {placedCart.label}. Click Save to record it.</span>}
      </div>
      {saved && (
        <div className={`feedback ${isCorrect ? 'feedback--correct' : 'feedback--wrong'}`}>
          <div className="feedback__icon">{isCorrect ? '✓' : '✗'}</div>
          <div className="feedback__body">
            <div className="feedback__title">{isCorrect ? 'Correct bath saved' : 'Wrong concentrate'}</div>
            <div className="feedback__explanation">{isCorrect
              ? 'Pre-K 5.6 (≥ 5.5 row) with a current 3K bath maps to a 1K bath. You dragged ~K1.0-A1246 and saved — exactly right. A change like this must also be documented with a K Protocol note and follow-up electrolytes.'
              : `You saved ${placedCart.label}. For a pre-K of 5.6 on a current 3K bath, the protocol requires a 1K bath (~K1.0). Remove it and drag the 1K concentrate instead.`}</div>
          </div>
          {isCorrect
            ? <button className="btn btn--primary feedback__next" onClick={() => { setAllDone(true); onComplete?.(); }}>Complete Task ✓</button>
            : <button className="btn btn--outline feedback__next" onClick={() => { setDropped(null); setSaved(false); }}>Try again</button>}
        </div>
      )}
    </div>
  );
}

function KNoteTask({ done, onComplete }) {
  const [kResult, setKResult] = useState('');
  const [changeReq, setChangeReq] = useState(null);
  const [fromBath, setFromBath] = useState('');
  const [toBath, setToBath] = useState('');
  const [lytes, setLytes] = useState(false);
  const [second, setSecond] = useState(null);
  const [checked, setChecked] = useState(false);
  const [allDone, setAllDone] = useState(!!done);

  const valid = kResult.trim() === '5.6' && changeReq === 'Y' && fromBath === '3K' && toBath === '1K' && lytes === true && second === 'N';

  if (allDone) return (
    <div className="completion-screen fade-in">
      <div className="completion-screen__icon">✓</div>
      <h2>Task Complete</h2>
      <p><strong>Complete the K Protocol Note</strong> has been marked complete.</p>
    </div>
  );

  const problems = [];
  if (checked && !valid) {
    if (kResult.trim() !== '5.6') problems.push('Enter the K⁺ result from this treatment (5.6).');
    if (changeReq !== 'Y') problems.push('A change WAS required (5.6 on a 3K bath → 1K), so select Yes.');
    if (fromBath !== '3K' || toBath !== '1K') problems.push('The change was from 3K to 1K.');
    if (!lytes) problems.push('Order follow-up electrolytes before the next session.');
    if (second !== 'N') problems.push('This is the initial change, not a second consecutive one — select No.');
  }

  return (
    <div className="ri-task fade-in">
      <div className="ri-task__head"><h2>Complete the K Protocol Progress Note</h2></div>
      <p className="exercise__instruction">Fill in the K Protocol phrase in the Progress Notes for Ms. Hartmann (K⁺ 5.6, bath changed 3K → 1K this treatment).</p>
      <RIChrome activeTab="Observ.">
        <div className="ri-note">
          <div className="ri-note__title">note: Potassium Protocol:</div>
          <div className="ri-note__row"><span className="ri-note__n">1.</span><span>K⁺ result:<input className="ri-note__inp" value={kResult} onChange={e => setKResult(e.target.value)} placeholder="mmol/L" /></span></div>
          <div className="ri-note__row">
            <span className="ri-note__n">2.</span>
            <span>Acid concentrate change required as per Potassium Adjustment Table?
              <label className="ri-radio"><input type="radio" name="chg" checked={changeReq === 'N'} onChange={() => setChangeReq('N')} /> N — continue</label>
              <label className="ri-radio"><input type="radio" name="chg" checked={changeReq === 'Y'} onChange={() => setChangeReq('Y')} /> Y — changed from
                <select className="ri-note__sel" value={fromBath} onChange={e => setFromBath(e.target.value)}><option value="">—</option><option>3K</option><option>2K</option><option>1K</option></select> to
                <select className="ri-note__sel" value={toBath} onChange={e => setToBath(e.target.value)}><option value="">—</option><option>3K</option><option>2K</option><option>1K</option></select>
              </label>
            </span>
          </div>
          <div className="ri-note__row"><span className="ri-note__n">3.</span><span>IF YES:<label className="ri-radio"><input type="checkbox" checked={lytes} onChange={e => setLytes(e.target.checked)} /> Electrolytes pre next session</label></span></div>
          <div className="ri-note__row">
            <span className="ri-note__n">4.</span>
            <span>Second consecutive acid concentrate change?
              <label className="ri-radio"><input type="radio" name="sec" checked={second === 'Y'} onChange={() => setSecond('Y')} /> Yes</label>
              <label className="ri-radio"><input type="radio" name="sec" checked={second === 'N'} onChange={() => setSecond('N')} /> No</label>
            </span>
          </div>
        </div>
      </RIChrome>
      {!checked && <button className="btn btn--primary" style={{ marginTop: 16 }} onClick={() => setChecked(true)}>Save note</button>}
      {checked && (valid ? (
        <div className="feedback feedback--correct">
          <div className="feedback__icon">✓</div>
          <div className="feedback__body"><div className="feedback__title">Note complete and correct</div><div className="feedback__explanation">You recorded the result, the change from 3K to 1K, the follow-up electrolytes, and correctly marked this as an initial (not second consecutive) change.</div></div>
          <button className="btn btn--primary feedback__next" onClick={() => { setAllDone(true); onComplete?.(); }}>Complete Task ✓</button>
        </div>
      ) : (
        <div className="feedback feedback--wrong">
          <div className="feedback__icon">✗</div>
          <div className="feedback__body"><div className="feedback__title">A few fields need fixing</div><div className="feedback__explanation"><ul className="ri-problems">{problems.map((p, i) => (<li key={i}>{p}</li>))}</ul></div></div>
          <button className="btn btn--outline feedback__next" onClick={() => setChecked(false)}>Fix it</button>
        </div>
      ))}
    </div>
  );
}

export default function RenalInsightModule({ questId, onTaskComplete, taskProgress }) {
  const [activeTask, setActiveTask] = useState(0);
  const tasks = [
    { key: 'tour', label: 'Interface Tour' },
    { key: 'day-order', label: 'Set the Day Hemo Order' },
    { key: 'k-note', label: 'Complete the K Protocol Note' },
  ];

  return (
    <div className="module-layout">
      <aside className="module-sidebar">
        <div className="module-sidebar__header">
          <span className="tag tag--task">Software</span>
          <h3 className="module-sidebar__title">Renal Insight</h3>
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
          <div className="module-formula-title">Renal Insight</div>
          <p style={{ fontSize: 12, color: 'var(--text-500)', lineHeight: 1.5, margin: 0 }}>The dialysis-specific charting system. You'll document the day's order, treatment data, and progress notes here.</p>
        </div>
      </aside>

      <main className="module-content ri-content">
        {tasks[activeTask].key === 'tour' && <InterfaceTour done={taskProgress['tour']} onComplete={() => onTaskComplete(questId, 'tour')} />}
        {tasks[activeTask].key === 'day-order' && <DayOrderTask done={taskProgress['day-order']} onComplete={() => onTaskComplete(questId, 'day-order')} />}
        {tasks[activeTask].key === 'k-note' && <KNoteTask done={taskProgress['k-note']} onComplete={() => onTaskComplete(questId, 'k-note')} />}
      </main>
    </div>
  );
}
