import { useState } from 'react';
import './EmergencyCodesModule.css';

const CODES = [
  {
    id: 'red',
    name: 'Code Red',
    short: 'Fire',
    color: '#b71c1c',
    bg: '#ffebee',
    description: 'A fire has been detected, or smoke is visible in the unit.',
    mnemonic: [
      { letter: 'R', word: 'Rescue', detail: 'Remove anyone from the room. Call out "Code Red, [location]."' },
      { letter: 'A', word: 'Alert', detail: 'Activate the nearest fire pull station. Call Switchboard (ext. 77): "Code Red, [unit name]."' },
      { letter: 'C', word: 'Confine', detail: 'Close all doors in the fire area. Clear equipment from corridors.' },
      { letter: 'E', word: 'Evacuate', detail: 'Evacuate the fire area as directed by the Charge Nurse.' },
    ],
    roles: [
      {
        label: 'Nursing',
        steps: [
          'Begin discontinuation of dialysis treatment as directed by the Charge Nurse.',
          'Address O₂ therapy — switch patients requiring oxygen to portable tanks.',
          'Address IV therapy — remove non-required lines, or direct the DA to unplug required lines.',
          'If escalating to Code Green: perform emergency discontinuation of hemodialysis.',
          'Once all patients are off machines: gather supplies and assist with transfer to the Evacuation Triage Centre.',
        ],
      },
      {
        label: 'Dialysis Assistants',
        steps: [
          'Shut off the O₂ valve to the affected area. Place O₂-dependent patients on portable tanks.',
          'Ensure "off" supplies are ready at each station.',
          'If Code Green: distribute emergency evacuation bundles (green bin) to each station.',
          'Gather HD supplies for triage: sodium citrate, saline syringes, gloves, masks, CVC caps, gauze.',
          'Assist with patient transfer to the Evacuation Triage Centre.',
        ],
      },
      {
        label: 'Allied & Clerical',
        steps: [
          'Clear hallways of chairs and equipment.',
          'Direct traffic to the affected area or evacuation centre as directed.',
          'If Code Green: assist with patient transfer and census tracking.',
        ],
      },
    ],
    callout: 'Know where your unit\'s O₂ shutoff valve and emergency evacuation bundles (green bin) are located. Patients on a machine may need to be disconnected urgently — urgency is determined by the Charge Nurse.',
  },
  {
    id: 'green',
    name: 'Code Green',
    short: 'Evacuation',
    color: '#2e7d32',
    bg: '#e8f5e9',
    description: 'Evacuation of the unit is required. Code Green is typically declared after a Code Red escalates.',
    levels: [
      { label: 'Level 1 — Stand By', desc: 'Prepare for possible evacuation. Ensure off supplies and green bins are ready. Do not move patients yet.' },
      { label: 'Level 2 — Horizontal', desc: 'Move patients to another area on the same floor using dialysis chairs, wheelchairs, or stretchers.' },
      { label: 'Level 3 — Vertical', desc: 'Move patients to a different floor via stairwells. Clear chairs and equipment from the stairwell entrance.' },
    ],
    roles: [
      {
        label: 'Nursing',
        steps: [
          'Begin emergency discontinuation of hemodialysis. Urgency is set by the Charge Nurse.',
          'Non-imminent threat: discontinue per usual protocol.',
          'Imminent threat to life: stop pump → clamp and separate blood lines → evacuate patient. Procedures differ for fistula/graft, CVC, and femoral catheter patients.',
          'Transfer with patient, addressing O₂ and IV needs.',
          'Verify patient head count at the Evacuation Triage Centre.',
        ],
      },
      {
        label: 'Dialysis Assistants',
        steps: [
          'Distribute emergency evacuation bundles from the green bin to each station.',
          'Assist with O₂ switchover and IV equipment breakdown.',
          'Gather HD triage supplies: sodium citrate, saline syringes, 10cc syringes, gloves, masks, CVC caps, gauze, bandaids.',
          'Assist with patient transfer to the Evacuation Triage Centre.',
        ],
      },
      {
        label: 'Allied & Clerical',
        steps: [
          '1 person designated to receive patients at the triage centre using the Discharge/Transfer Status Sheet.',
          '1 person designated to retrieve patient charts — only if safe and time allows.',
          'All others: clear hallways and assist with patient escorts to the triage centre.',
        ],
      },
    ],
    callout: 'All patients must leave in dialysis chairs, wheelchairs, or stretchers — not on foot if unsteady. Emergency discontinuation steps differ for fistula/graft vs. CVC vs. femoral catheter patients.',
  },
  {
    id: 'blue',
    name: 'Code Blue',
    short: 'Medical Emergency',
    color: '#1565c0',
    bg: '#e3f2fd',
    description: 'A patient or staff member is in cardiac or respiratory arrest.',
    roles: [
      {
        label: 'Nursing',
        steps: [
          'Call out "Code Blue, [location]" and activate the code button, or call Switchboard (ext. 77).',
          'Begin CPR immediately if the patient is unresponsive with no pulse or is not breathing.',
          'Clear the area immediately around the patient for the Code Blue response team.',
          'Determine whether the patient needs to be disconnected from the dialysis machine to allow full response team access.',
          'Stay with the patient and follow direction from the response team.',
        ],
      },
      {
        label: 'Dialysis Assistants',
        steps: [
          'Retrieve the crash cart if directed by the nurse.',
          'Clear the immediate area around the patient.',
          'Assist the nurse as directed.',
        ],
      },
      {
        label: 'Allied & Clerical',
        steps: [
          'Keep other patients calm and redirect them away from the area.',
          'Direct the Code Blue response team to the correct location.',
          'Clear corridors so equipment and the team can reach the patient.',
        ],
      },
    ],
    callout: 'If the patient is connected to a dialysis machine during a Code Blue, the nurse must quickly assess whether disconnection is needed to allow full CPR and response team access. Follow the Charge Nurse\'s direction.',
  },
];

export default function EmergencyCodesModule({ questId, onTaskComplete, taskProgress }) {
  const [selectedId, setSelectedId] = useState(null);

  function openCode(id) {
    setSelectedId(id);
    const key = `card-${id}`;
    if (!taskProgress[key]) {
      onTaskComplete(questId, key);
    }
  }

  const selectedCode = selectedId ? CODES.find((c) => c.id === selectedId) : null;

  if (selectedCode) {
    return (
      <CodeCard
        code={selectedCode}
        allCodes={CODES}
        taskProgress={taskProgress}
        onBack={() => setSelectedId(null)}
        onNavigate={openCode}
      />
    );
  }

  return (
    <CodeOverview
      codes={CODES}
      taskProgress={taskProgress}
      onSelect={openCode}
    />
  );
}

function CodeOverview({ codes, taskProgress, onSelect }) {
  const viewedCount = codes.filter((c) => taskProgress[`card-${c.id}`]).length;

  return (
    <div className="ec-overview fade-in">
      <div className="ec-overview__header">
        <span className="tag tag--task">Task</span>
        <h2 className="ec-overview__title">Emergency Codes</h2>
        {viewedCount > 0 && (
          <p className="ec-overview__progress">{viewedCount} of {codes.length} reviewed</p>
        )}
      </div>

      <div className="ec-overview__grid">
        {codes.map((code) => {
          const viewed = !!taskProgress[`card-${code.id}`];
          return (
            <button
              key={code.id}
              className={`ec-tile ${viewed ? 'ec-tile--viewed' : ''}`}
              style={{ '--code-color': code.color, '--code-bg': code.bg }}
              onClick={() => onSelect(code.id)}
            >
              <div className="ec-tile__band">
                <div className="ec-tile__band-text">
                  <span className="ec-tile__name">{code.name}</span>
                  <span className="ec-tile__short">{code.short}</span>
                </div>
                {viewed && (
                  <span className="ec-tile__check" aria-label="Reviewed">
                    <CheckIcon />
                  </span>
                )}
              </div>
              <div className="ec-tile__body">
                <p className="ec-tile__desc">{code.description}</p>
                <span className="ec-tile__cta">{viewed ? 'Review again' : 'Learn this code'} →</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CodeCard({ code, allCodes, taskProgress, onBack, onNavigate }) {
  return (
    <div className="ec-card">
      <div className="ec-card__band" style={{ background: code.color }}>
        <button className="ec-card__back" onClick={onBack}>
          ← All codes
        </button>
        <div className="ec-card__band-content">
          <p className="ec-card__name">{code.name}</p>
          <p className="ec-card__short">{code.short}</p>
          <p className="ec-card__desc">{code.description}</p>
        </div>
      </div>

      <div className="ec-card__scroll">
        {code.mnemonic && (
          <section className="ec-section">
            <h4 className="ec-section__title">R.A.C.E.</h4>
            <div className="ec-race">
              {code.mnemonic.map(({ letter, word, detail }) => (
                <div key={letter} className="ec-race__step">
                  <div className="ec-race__letter" style={{ background: code.color }}>{letter}</div>
                  <div className="ec-race__info">
                    <strong>{word}</strong>
                    <span>{detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {code.levels && (
          <section className="ec-section">
            <h4 className="ec-section__title">Escalation Levels</h4>
            <div className="ec-levels">
              {code.levels.map((level) => (
                <div key={level.label} className="ec-level" style={{ borderLeftColor: code.color }}>
                  <strong className="ec-level__label">{level.label}</strong>
                  <p className="ec-level__desc">{level.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="ec-section">
          <h4 className="ec-section__title">Response by Role</h4>
          <div className="ec-roles">
            {code.roles.map((role) => (
              <div key={role.label} className="ec-role">
                <h5 className="ec-role__label" style={{ color: code.color }}>{role.label}</h5>
                <ol className="ec-role__steps">
                  {role.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <div className="ec-callout" style={{ borderColor: code.color, background: code.bg }}>
          <strong className="ec-callout__label" style={{ color: code.color }}>Dialysis unit note</strong>
          <p>{code.callout}</p>
        </div>
      </div>

      <nav className="ec-dots" aria-label="Code navigation">
        {allCodes.map((c) => {
          const viewed = !!taskProgress[`card-${c.id}`];
          const isCurrent = c.id === code.id;
          return (
            <button
              key={c.id}
              className={`ec-dot ${isCurrent ? 'ec-dot--current' : ''} ${viewed ? 'ec-dot--viewed' : ''}`}
              style={isCurrent ? { background: c.color, borderColor: c.color } : viewed ? { borderColor: c.color } : {}}
              onClick={() => onNavigate(c.id)}
              aria-label={`${c.name}${viewed ? ' — reviewed' : ''}`}
              aria-current={isCurrent ? 'true' : undefined}
            >
              {viewed && !isCurrent && (
                <span className="ec-dot__check" style={{ color: c.color }}>
                  <SmallCheckIcon />
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SmallCheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
