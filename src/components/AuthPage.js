import React, { useState } from 'react';
import {
  isConfigured as isSupabaseConfigured,
  supabaseSignUp,
  supabaseSignIn,
  supabaseSignOut,
} from '../utils/supabase';

// ── localStorage fallback (used when Supabase is not configured) ──────────────

const STORAGE_KEYS = {
  users:   'ritual_users',
  session: 'ritual_session',
};

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]'); }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function hashPassword(p) {
  return btoa(unescape(encodeURIComponent(p)));
}

export function saveSession(user) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user));
}

export function loadSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.session)); }
  catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
  // also sign out from Supabase if configured
  supabaseSignOut().catch(() => {});
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AuthPage({ initialMode = 'login', onAuth, onGuest, onBack }) {
  const [mode,     setMode]     = useState(initialMode);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [info,     setInfo]     = useState('');

  const clearForm = () => { setName(''); setEmail(''); setPassword(''); setError(''); setInfo(''); };
  const switchMode = (m) => { setMode(m); clearForm(); };

  const validate = () => {
    if (mode === 'signup' && !name.trim()) return 'Please enter your name.';
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');
    setInfo('');

    // ── Supabase path ───────────────────────────────────────────────────────
    if (isSupabaseConfigured()) {
      try {
        let user;
        if (mode === 'signup') {
          user = await supabaseSignUp(email.trim(), password, name.trim());
          if (!user) {
            // Supabase may require email confirmation
            setInfo('Check your email to confirm your account, then sign in.');
            setLoading(false);
            return;
          }
        } else {
          user = await supabaseSignIn(email.trim(), password);
        }
        saveSession(user);
        onAuth(user);
      } catch (ex) {
        setError(ex.message || 'Authentication failed.');
      }
      setLoading(false);
      return;
    }

    // ── localStorage fallback ───────────────────────────────────────────────
    setTimeout(() => {
      const users = loadUsers();
      const hash  = hashPassword(password);

      if (mode === 'login') {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) { setError('No account found with that email.'); setLoading(false); return; }
        if (user.passwordHash !== hash) { setError('Incorrect password.'); setLoading(false); return; }
        const session = { id: user.id, name: user.name, email: user.email };
        saveSession(session);
        onAuth(session);
      } else {
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          setError('An account with that email already exists.'); setLoading(false); return;
        }
        const newUser = {
          id:           `u${Date.now()}`,
          name:         name.trim(),
          email:        email.toLowerCase().trim(),
          passwordHash: hash,
          createdAt:    new Date().toISOString(),
        };
        saveUsers([...users, newUser]);
        const session = { id: newUser.id, name: newUser.name, email: newUser.email };
        saveSession(session);
        onAuth(session);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="auth-screen">
      <button className="auth-back-btn" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <div className="auth-card">
        <div className="auth-brand">Ritual</div>

        {isSupabaseConfigured() && (
          <div className="auth-cloud-badge">☁️ Cloud sync enabled</div>
        )}

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login'  ? 'active' : ''}`} onClick={() => switchMode('login')}>Sign in</button>
          <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>Create account</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="auth-field">
              <label className="auth-label">Full name</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Alex Johnson"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                autoFocus
                maxLength={50}
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus={mode === 'login'}
              maxLength={100}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              maxLength={100}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {info  && <div className="auth-info">{info}</div>}

          <button
            className={`auth-submit ${loading ? 'loading' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : mode === 'login' ? (
              'Sign in'
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button className="auth-guest-btn" onClick={onGuest}>
          Continue as guest
        </button>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>Don't have an account? <button className="auth-switch-link" onClick={() => switchMode('signup')}>Sign up</button></>
          ) : (
            <>Already have an account? <button className="auth-switch-link" onClick={() => switchMode('login')}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
