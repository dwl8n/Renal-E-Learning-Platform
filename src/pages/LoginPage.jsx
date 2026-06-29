import { useState } from 'react';
import { useApp } from '../context';
import { MOCK_USERS } from '../context';
import './LoginPage.css';

export default function LoginPage() {
  const { dispatch } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

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

  const master   = MOCK_USERS.filter(u => u.master);
  const trainers = MOCK_USERS.filter(u => u.role === 'admin' && !u.master);
  const trainees = MOCK_USERS.filter(u => u.role === 'student');

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
          <p className="login-card__subtitle">Sign in to access assigned courses and policy learning</p>
        </div>

        {/* Form */}
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

        {/* Sample credentials */}
        <details className="login-creds">
          <summary className="login-creds__toggle">Sample credentials</summary>
          <div className="login-creds__body">
            <p className="login-creds__group-label">Master Regulator</p>
            {master.map(u => (
              <div key={u.id} className="login-creds__row">
                <span className="login-creds__name">{u.fullName}</span>
                <code className="login-creds__code">{u.username} / {u.password}</code>
              </div>
            ))}
            <p className="login-creds__group-label" style={{ marginTop: 10 }}>Trainers</p>
            {trainers.map(u => (
              <div key={u.id} className="login-creds__row">
                <span className="login-creds__name">{u.fullName}</span>
                <code className="login-creds__code">{u.username} / {u.password}</code>
              </div>
            ))}
            <p className="login-creds__group-label" style={{ marginTop: 10 }}>Trainees</p>
            {trainees.map(u => (
              <div key={u.id} className="login-creds__row">
                <span className="login-creds__name">{u.fullName}</span>
                <code className="login-creds__code">{u.username} / {u.password}</code>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
