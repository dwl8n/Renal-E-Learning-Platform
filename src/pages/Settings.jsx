import { useState } from 'react';
import { useApp } from '../context';
import './Settings.css';

export default function Settings() {
  const { dispatch } = useApp();
  const [darkMode, setDarkMode] = useState(false);
  const [reduceAnimations, setReduceAnimations] = useState(false);
  const [textSize, setTextSize] = useState('medium');
  const [confirmReset, setConfirmReset] = useState(false);

  function handleReset() {
    dispatch({ type: 'RESET_PROGRESS' });
    setConfirmReset(false);
  }

  return (
    <div className="page fade-in">
      <div className="page-inner" style={{maxWidth:680}}>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customise your learning experience.</p>

        {/* Profile */}
        <SettingsSection title="Profile" badge="Stub">
          <SettingsRow label="Name" desc="Your display name">
            <input className="settings-input" type="text" defaultValue="Orientation Learner" disabled />
          </SettingsRow>
          <SettingsRow label="Role" desc="Your current role in the unit">
            <input className="settings-input" type="text" defaultValue="RN — Hemodialysis Orientation" disabled />
          </SettingsRow>
          <SettingsRow label="Unit" desc="Your dialysis unit">
            <input className="settings-input" type="text" defaultValue="HD Unit — Prototype" disabled />
          </SettingsRow>
          <div className="settings-stub-note">Profile editing will be available in a future release once user accounts are implemented.</div>
        </SettingsSection>

        {/* Display */}
        <SettingsSection title="Display">
          <SettingsRow label="Dark Mode" desc="Darker colour scheme for low-light environments">
            <ToggleSwitch value={darkMode} onChange={setDarkMode} disabled />
          </SettingsRow>
          <SettingsRow label="Reduce Animations" desc="Minimise motion effects throughout the app">
            <ToggleSwitch value={reduceAnimations} onChange={setReduceAnimations} disabled />
          </SettingsRow>
          <SettingsRow label="Text Size" desc="Adjust the base font size">
            <div className="settings-select-group">
              {['small', 'medium', 'large'].map(s => (
                <button
                  key={s}
                  className={`settings-select-btn ${textSize === s ? 'settings-select-btn--active' : ''}`}
                  onClick={() => setTextSize(s)}
                  disabled
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </SettingsRow>
          <div className="settings-stub-note">Display preferences are not yet persisted — they will save automatically once user accounts are added.</div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" badge="Stub">
          <SettingsRow label="Training Reminders" desc="Get reminders to continue your orientation">
            <ToggleSwitch value={false} onChange={() => {}} disabled />
          </SettingsRow>
          <SettingsRow label="Completion Alerts" desc="Notify when you complete a module or assessment">
            <ToggleSwitch value={true} onChange={() => {}} disabled />
          </SettingsRow>
          <div className="settings-stub-note">Notifications will be configurable once the platform is connected to user accounts.</div>
        </SettingsSection>

        {/* Progress */}
        <SettingsSection title="Demo Progress">
          <SettingsRow label="Reset Demo Progress" desc="Clears module progress and points for restarting the demo">
            {!confirmReset ? (
              <button className="btn btn--outline btn--sm" onClick={() => setConfirmReset(true)}>Reset Progress</button>
            ) : (
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn--danger btn--sm" onClick={handleReset}>Confirm Reset</button>
                <button className="btn btn--ghost btn--sm" onClick={() => setConfirmReset(false)}>Cancel</button>
              </div>
            )}
          </SettingsRow>
          {confirmReset && (
            <div className="settings-warn">This will reset module progress, points, and activity feed data. This action cannot be undone.</div>
          )}
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About eTrainer">
          <div className="settings-about-blurb">
            <p>eTrainer is a blended e-learning platform for hemodialysis nurse onboarding, developed in partnership with the <strong>WRHN Renal Program</strong>.</p>
            <p>Built to answer three questions: <em>Is the learner prepared? Is the trainer informed? Is competency protected?</em></p>
            <p className="settings-about-note">This is a working proof of concept. Clinical competency sign-off remains with the trainer — the platform supports preparation, not replacement of in-person supervision.</p>
          </div>
          <SettingsRow label="Version" desc="Prototype build"><span className="settings-value">0.1.0 — Proof of Concept</span></SettingsRow>
          <SettingsRow label="Content" desc="Orientation package"><span className="settings-value">WRHN Hemodialysis Orientation v1</span></SettingsRow>
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({ title, badge, children }) {
  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">{title}</h2>
        {badge && <span className="badge badge--grey">{badge}</span>}
      </div>
      <div className="settings-section__body card">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ label, desc, children }) {
  return (
    <div className="settings-row">
      <div className="settings-row__label-group">
        <span className="settings-row__label">{label}</span>
        {desc && <span className="settings-row__desc">{desc}</span>}
      </div>
      <div className="settings-row__control">{children}</div>
    </div>
  );
}

function ToggleSwitch({ value, onChange, disabled }) {
  return (
    <label className={`toggle-label ${disabled ? 'toggle-label--disabled' : ''}`}>
      <input type="checkbox" className="toggle-input" checked={value} onChange={e => onChange(e.target.checked)} disabled={disabled} />
      <span className="toggle-track" />
    </label>
  );
}
