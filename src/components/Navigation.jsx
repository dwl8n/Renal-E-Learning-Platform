import { useApp } from '../context';
import './Navigation.css';

export default function Navigation() {
  const { state, dispatch } = useApp();
  const { page, badges } = state;

  const navTo = (p) => dispatch({ type: 'NAV', page: p });
  const openJournal = () => dispatch({ type: 'JOURNAL_OPEN' });

  return (
    <nav className="nav">
      <div className="nav__brand">
        <div className="nav__logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="var(--teal-400)" strokeWidth="2"/>
            <path d="M7 14 Q10 8 14 14 Q18 20 21 14" stroke="var(--red-400)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="nav__title">eTrainer</span>
      </div>

      <div className="nav__items">
        <button
          className={`nav__item ${page === 'progress' ? 'nav__item--active' : ''}`}
          onClick={() => navTo('progress')}
        >
          <MapIcon />
          <span className="nav__label">Progress</span>
        </button>

        <button
          className={`nav__item ${page === 'tasks' ? 'nav__item--active' : ''}`}
          onClick={() => navTo('tasks')}
        >
          <span className="nav__icon-wrap">
            <TaskIcon />
            {badges.tasks && <span className="nav__badge" aria-label="New content" />}
          </span>
          <span className="nav__label">Tasks</span>
        </button>

        <button
          className={`nav__item ${page === 'assessments' ? 'nav__item--active' : ''}`}
          onClick={() => navTo('assessments')}
        >
          <span className="nav__icon-wrap">
            <AssessIcon />
            {badges.assessments && <span className="nav__badge" aria-label="New content" />}
          </span>
          <span className="nav__label">Assessments</span>
        </button>

        <button
          className="nav__item"
          onClick={openJournal}
        >
          <span className="nav__icon-wrap">
            <BookIcon />
            {badges.journal && <span className="nav__badge" aria-label="New journal content" />}
          </span>
          <span className="nav__label">Journal</span>
        </button>

        <button
          className={`nav__item ${page === 'ai' ? 'nav__item--active' : ''}`}
          onClick={() => navTo('ai')}
        >
          <AIIcon />
          <span className="nav__label">AI Assistant</span>
        </button>
      </div>

      <button
        className={`nav__item nav__settings ${page === 'settings' ? 'nav__item--active' : ''}`}
        onClick={() => navTo('settings')}
      >
        <SettingsIcon />
        <span className="nav__label">Settings</span>
      </button>
    </nav>
  );
}

function MapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  );
}
function TaskIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
function AssessIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}
function AIIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="9" y1="10" x2="15" y2="10"/>
      <line x1="12" y1="7" x2="12" y2="13"/>
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}
