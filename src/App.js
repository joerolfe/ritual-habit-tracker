import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MonthView from './components/MonthView';
import YearOverview from './components/YearOverview';
import TodayView from './components/TodayView';
import HabitStatsModal from './components/HabitStatsModal';
import Onboarding from './components/Onboarding';
import LandingPage from './components/LandingPage';
import AuthPage, { loadSession, clearSession } from './components/AuthPage';

const STORAGE_KEYS = {
  habits:     'ritual_habits',
  completions:'ritual_completions',
  intentions: 'ritual_intentions',
  onboarded:  'ritual_onboarded',
};

export const HABIT_COLORS = [
  '#ff6b6b', '#ff9f43', '#ffd93d', '#6bcb77',
  '#4d96ff', '#c77dff', '#ff85a1', '#00c9a7',
  '#ff6b35', '#74c0fc',
];

function ensureColors(habits) {
  return habits.map((h, i) => ({
    ...h,
    color: h.color || HABIT_COLORS[i % HABIT_COLORS.length],
  }));
}

function loadFromStorage(key, defaultValue) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : defaultValue;
  } catch { return defaultValue; }
}

const DEFAULT_HABITS = [
  { id: 'h1', name: 'Morning Meditation', color: HABIT_COLORS[3] },
  { id: 'h2', name: 'Exercise',           color: HABIT_COLORS[1] },
  { id: 'h3', name: 'Read',               color: HABIT_COLORS[4] },
];

function getInitialScreen() {
  // If there's an active session, go straight to the app
  if (loadSession()) return 'app';
  // If they've used the app as a guest (habits exist), go straight to app
  if (localStorage.getItem(STORAGE_KEYS.habits)) return 'app';
  return 'landing';
}

function App() {
  const today = new Date();

  // ── Auth / screen state ─────────────────────────────────────────────
  const [screen,      setScreen]      = useState(getInitialScreen); // 'landing' | 'auth' | 'app'
  const [authMode,    setAuthMode]    = useState('login');           // 'login' | 'signup'
  const [currentUser, setCurrentUser] = useState(() => loadSession());
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ── App state ───────────────────────────────────────────────────────
  const [habits, setHabits] = useState(() =>
    ensureColors(loadFromStorage(STORAGE_KEYS.habits, DEFAULT_HABITS))
  );
  const [completions, setCompletions] = useState(() =>
    loadFromStorage(STORAGE_KEYS.completions, {})
  );
  const [intentions, setIntentions] = useState(() =>
    loadFromStorage(STORAGE_KEYS.intentions, {})
  );
  const [onboarded, setOnboarded] = useState(() => {
    if (loadFromStorage(STORAGE_KEYS.onboarded, false)) return true;
    return !!localStorage.getItem(STORAGE_KEYS.habits);
  });

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [view,         setView]         = useState('today');
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [statsHabit,   setStatsHabit]   = useState(null);

  // ── Persistence ──────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.habits,      JSON.stringify(habits));      }, [habits]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.completions,  JSON.stringify(completions)); }, [completions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.intentions,   JSON.stringify(intentions));  }, [intentions]);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = () => setShowUserMenu(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  // ── Auth handlers ────────────────────────────────────────────────────
  const handleAuth = useCallback((user) => {
    setCurrentUser(user);
    setScreen('app');
  }, []);

  const handleGuest = useCallback(() => {
    setCurrentUser(null);
    setScreen('app');
  }, []);

  const handleSignOut = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setShowUserMenu(false);
    setScreen('landing');
  }, []);

  const openLogin = useCallback(() => {
    setAuthMode('login');
    setScreen('auth');
  }, []);

  const openSignup = useCallback(() => {
    setAuthMode('signup');
    setScreen('auth');
  }, []);

  // ── Habit handlers ────────────────────────────────────────────────────
  const toggleCompletion = useCallback((habitId, year, month, day) => {
    const key = `${habitId}|${year}|${month}|${day}`;
    setCompletions(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const isCompleted = useCallback(
    (habitId, year, month, day) => !!completions[`${habitId}|${year}|${month}|${day}`],
    [completions]
  );

  const setIntention = useCallback((dateKey, text) => {
    setIntentions(prev => ({ ...prev, [dateKey]: text }));
  }, []);

  const addHabit = useCallback((name, color) => {
    setHabits(prev => {
      const c = color || HABIT_COLORS[prev.length % HABIT_COLORS.length];
      return [...prev, { id: `h${Date.now()}`, name, color: c }];
    });
  }, []);

  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  const editHabit = useCallback((id, name, color) => {
    setHabits(prev => prev.map(h =>
      h.id === id ? { ...h, name, ...(color ? { color } : {}) } : h
    ));
  }, []);

  const reorderHabits = useCallback((fromIndex, toIndex) => {
    setHabits(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const prevMonth = useCallback(() => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
  }, [currentMonth]);

  const completeOnboarding = useCallback((initialHabits) => {
    if (initialHabits && initialHabits.length > 0) setHabits(initialHabits);
    setOnboarded(true);
    localStorage.setItem(STORAGE_KEYS.onboarded, JSON.stringify(true));
    setView('today');
  }, []);

  // ── Avatar helper ─────────────────────────────────────────────────────
  const initials = currentUser
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : null;

  // ── Render screens ────────────────────────────────────────────────────
  if (screen === 'landing') {
    return <LandingPage onLogin={openLogin} onSignup={openSignup} />;
  }

  if (screen === 'auth') {
    return (
      <AuthPage
        initialMode={authMode}
        onAuth={handleAuth}
        onGuest={handleGuest}
        onBack={() => setScreen('landing')}
      />
    );
  }

  // ── Main app ──────────────────────────────────────────────────────────
  return (
    <div className="app">
      {!onboarded && <Onboarding onComplete={completeOnboarding} />}

      <header className="app-header">
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(o => !o)}
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <span /><span /><span />
          </button>
          <div className="app-brand">
            <span className="app-name">Ritual</span>
          </div>
          <span className="header-sep" />
        </div>

        <div className="header-center">
          <div className="view-toggle-group">
            <button className={`view-toggle-btn ${view === 'today' ? 'active' : ''}`} onClick={() => setView('today')}>Today</button>
            <button className={`view-toggle-btn ${view === 'month' ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
            <button className={`view-toggle-btn ${view === 'year'  ? 'active' : ''}`} onClick={() => setView('year')}>Year</button>
          </div>
        </div>

        <div className="header-right">
          <span className="header-date">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>

          {currentUser ? (
            <div className="user-menu-wrap" onMouseDown={e => e.stopPropagation()}>
              <button
                className="user-avatar-btn"
                onClick={() => setShowUserMenu(v => !v)}
                title={currentUser.name}
              >
                <span className="user-avatar">{initials}</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-dropdown-info">
                    <span className="user-dropdown-name">{currentUser.name}</span>
                    <span className="user-dropdown-email">{currentUser.email}</span>
                  </div>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item danger" onClick={handleSignOut}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ marginRight: 8 }}>
                      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      <path d="M10 5l3 3-3 3M13 8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="header-signin-btn" onClick={openLogin}>Sign in</button>
          )}
        </div>
      </header>

      <div className="app-body">
        <Sidebar
          open={sidebarOpen}
          habits={habits}
          completions={completions}
          onAdd={addHabit}
          onDelete={deleteHabit}
          onEdit={editHabit}
          onReorder={reorderHabits}
          onShowStats={setStatsHabit}
        />

        <main className="main-content">
          {view === 'today' && (
            <TodayView
              habits={habits}
              completions={completions}
              intentions={intentions}
              isCompleted={isCompleted}
              onToggle={toggleCompletion}
              onSetIntention={setIntention}
            />
          )}
          {view === 'month' && (
            <MonthView
              habits={habits}
              year={currentYear}
              month={currentMonth}
              isCompleted={isCompleted}
              onToggle={toggleCompletion}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
            />
          )}
          {view === 'year' && (
            <YearOverview
              habits={habits}
              year={currentYear}
              isCompleted={isCompleted}
              onYearChange={setCurrentYear}
              onSelectMonth={(month) => { setCurrentMonth(month); setView('month'); }}
            />
          )}
        </main>
      </div>

      {statsHabit && (
        <HabitStatsModal
          habit={statsHabit}
          completions={completions}
          onClose={() => setStatsHabit(null)}
        />
      )}
    </div>
  );
}

export default App;
