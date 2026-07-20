import { useState } from 'react';
import { useApp } from '../context';
import { MOCK_USERS } from '../context';
import './LoginPage.css';

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const ROLE_LABEL = {
  student: 'Trainee',
  admin: 'Trainer / Admin',
};

export default function LoginPage() {
  const { dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function loginAs(user) {
    dispatch({ type: 'LOGIN', user });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const user = MOCK_USERS.find(
        u => u.username === username.trim() && u.password === password
      );
      if (user) {
        dispatch({ type: 'LOGIN', user });
      } else {
        setError('Incorrect username or password.');
        setLoading(false);
      }
    }, 400);
  }

  const noah = MOCK_USERS.find(u => u.username === 'noah');
  const otherUsers = MOCK_USERS.filter(u => u.username !== 'noah');

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* Header */}
        <div className="login-card__header">
          <div className="login-logo">
            <svg width="34" height="34" viewBox="0 0 30 30" fill="none" aria-hidden="true">
              <path d="M6 16h4l2.5-6 3.5 11 2.5-7 1.5 2H24" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="login-card__title">Hospital Training Portal</h1>
          <p className="login-card__subtitle">Select your account to continue</p>
        </div>

        {/* Noah tile — primary account */}
        {!showForm && noah && (
          <div className="login-accounts">
            <p className="login-accounts__group-label">Continue as</p>
            <AccountTile user={noah} onClick={() => loginAs(noah)} fullWidth />
          </div>
        )}

        {/* "Sign in with a different account" toggle */}
        <div className="login-alt">
          <button
            className="login-alt__toggle"
            onClick={() => setShowForm(v => !v)}
            aria-expanded={showForm}
          >
            {showForm ? '▴ Cancel' : '▾ Sign in with a different account'}
          </button>

          {showForm && (
            <>
              {/* Other accounts list */}
              <div className="login-alt-accounts">
                {otherUsers.map(u => (
                  <button key={u.id} className="login-alt-account" onClick={() => loginAs(u)}>
                    <div className={`login-alt-account__avatar ${u.master ? 'login-alt-account__avatar--master' : ''}`}>
                      {getInitials(u.fullName)}
                    </div>
                    <div className="login-alt-account__info">
                      <span className="login-alt-account__name">{u.fullName}</span>
                      <span className="login-alt-account__role">
                        {u.master ? 'Platform Admin' : u.title || ROLE_LABEL[u.role] || 'User'}
                      </span>
                    </div>
                    <span className="login-alt-account__arrow">→</span>
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="login-alt-divider">
                <span>or sign in with username</span>
              </div>

              {/* Username / password form */}
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="username" className="login-label">Username</label>
                  <input
                    id="username"
                    type="text"
                    className="login-input"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="login-field">
                  <label htmlFor="password" className="login-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="login-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                {error && <p className="login-error">{error}</p>}
                <button className="login-btn" type="submit" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AccountTile({ user, onClick, fullWidth }) {
  return (
    <button
      className={`account-tile ${fullWidth ? 'account-tile--full' : ''}`}
      onClick={onClick}
    >
      <div className="account-tile__avatar">
        {getInitials(user.fullName)}
      </div>
      <div className="account-tile__info">
        <span className="account-tile__name">{user.fullName}</span>
        <span className="account-tile__role">{user.title || ROLE_LABEL[user.role] || 'User'}</span>
      </div>
      <span className="account-tile__arrow">→</span>
    </button>
  );
}
