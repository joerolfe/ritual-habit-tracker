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
import BottomNav from './components/BottomNav';
import HabitTemplates from './components/HabitTemplates';
import AchievementsModal from './components/AchievementsModal';
import PremiumModal from './components/PremiumModal';
import { computeAchievements } from './utils/achievements';
import { scheduleAllReminders, requestPermission } from './utils/notifications';
import { getOverallStreak } from './utils/streaks';
import { HABIT_COLORS } from './utils/constants';

const STORAGE_KEYS = {
  habits:       'ritual_habits',
  completions:  'ritual_completions',
  intentions:   'ritual_intentions',
  notes:        'ritual_notes',
  shields:      'ritual_shields',
  achievements: 'ritual_achievements',
  onboarded:    'ritual_onboarded',
  milestones:   'ritual_milestones',
};

export { HABIT_COLORS };

function ensureHabitDefaults(habits) {
  return habits.map((h, i) => ({
    icon:  '⭐',
    days:  [0,1,2,3,4,5,6],
    ...h,
    color: h.color || HABIT_COLORS[i % HABIT_COLORS.length],
  }));
}

function load(key, def) {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; }
  catch { return def; }
}

const DEFAULT_HABITS = [
  { id: 'h1', name: 'Morning Meditation', icon: '🧘', color: HABIT_COLORS[3], days: [0,1,2,3,4,5,6] },
  { id: 'h2', name: 'Exercise',           icon: '💪', color: HABIT_COLORS[1], days: [1,2,3,4,5] },
  { id: 'h3', name: 'Read',               icon: '📚', color: HABIT_COLORS[4], days: [0,1,2,3,4,5,6] },
];

function getInitialScreen() {
  if (loadSession()) return 'app';
  if (localStorage.getItem(STORAGE_KEYS.habits)) return 'app';
  return 'landing';
}

function App() {
  const today = new Date();

  // ── Auth / screen state ───────────────────────────────────────────────────
  const [screen,       setScreen]      = useState(getInitialScreen);
  const [authMode,     setAuthMode]    = useState('login');
  const [currentUser,  setCurrentUser] = useState(() => loadSession());
  const [showUserMenu, setShowUserMenu] = useState(false);

  // ── Mobile state ──────────────────────────────────────────────────────────
  const [mobileHabits,  setMobileHabits]  = useState(false);
  const [mobileProfile, setMobileProfile] = useState(false);

  // ── App state ─────────────────────────────────────────────────────────────
  const [habits,       setHabits]       = useState(() => ensureHabitDefaults(load(STORAGE_KEYS.habits, DEFAULT_HABITS)));
  const [completions,  setCompletions]  = useState(() => load(STORAGE_KEYS.completions, {}));
  const [intentions,   setIntentions]   = useState(() => load(STORAGE_KEYS.intentions, {}));
  const [notes,        setNotes]        = useState(() => load(STORAGE_KEYS.notes, {}));
  const [shields,      setShields]      = useState(() => load(STORAGE_KEYS.shields, 0));
  const [achievements, setAchievements] = useState(() => load(STORAGE_KEYS.achievements, {}));
  const [milestones,   setMilestones]   = useState(() => load(STORAGE_KEYS.milestones, []));
  const [onboarded,    setOnboarded]    = useState(() => {
    if (load(STORAGE_KEYS.onboarded, false)) return true;
    return !!localStorage.getItem(STORAGE_KEYS.habits);
  });

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [view,         setView]         = useState('today');
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [statsHabit,   setStatsHabit]   = useState(null);
  const [showTemplates,  setShowTemplates]  = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPremium,    setShowPremium]    = useState(false);

  // ── Persistence ───────────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.habits,       JSON.stringify(habits));       }, [habits]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.completions,   JSON.stringify(completions));  }, [completions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.intentions,    JSON.stringify(intentions));   }, [intentions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.notes,         JSON.stringify(notes));        }, [notes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.shields,       JSON.stringify(shields));      }, [shields]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.achievements,  JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.milestones,    JSON.stringify(milestones));   }, [milestones]);

  // ── Notification scheduling ───────────────────────────────────────────────
  useEffect(() => {
    if (habits.some(h => h.reminderTime)) {
      requestPermission().then(perm => {
        if (perm === 'granted') scheduleAllReminders(habits);
      });
    }
  }, [habits]);

  // ── Achievement & shield computation ─────────────────────────────────────
  useEffect(() => {
    const computed = computeAchievements(habits, completions);
    setAchievements(prev => {
      const hasNew = Object.keys(computed).some(k => !prev[k]);
      return hasNew ? { ...prev, ...computed } : prev;
    });
  }, [habits, completions]);

  // Award shields for perfect weeks (multiples of 7 overall streak)
  useEffect(() => {
    const overall = getOverallStreak(habits, completions);
    const milestone = Math.floor(overall / 7) * 7;
    if (milestone > 0 && !milestones.includes(milestone)) {
      setShields(s => s + 1);
      setMilestones(prev => [...prev, milestone]);
    }
  }, [completions, habits]); // eslint-disable-line

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = () => setShowUserMenu(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  // Close mobile panels on view change
  useEffect(() => {
    setMobileHabits(false);
    setMobileProfile(false);
  }, [view]);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleAuth   = useCallback((user) => { setCurrentUser(user); setScreen('app'); }, []);
  const handleGuest  = useCallback(() => { setCurrentUser(null); setScreen('app'); }, []);
  const handleSignOut = useCallback(() => {
    clearSession(); setCurrentUser(null); setShowUserMenu(false); setScreen('landing');
  }, []);
  const openLogin  = useCallback(() => { setAuthMode('login');  setScreen('auth'); }, []);
  const openSignup = useCallback(() => { setAuthMode('signup'); setScreen('auth'); }, []);

  // ── Habit handlers ────────────────────────────────────────────────────────
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

  const addNote = useCallback((habitId, year, month, day, text) => {
    const key = `${habitId}|${year}|${month}|${day}`;
    setNotes(prev => text ? { ...prev, [key]: text } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)));
  }, []);

  const useShield = useCallback((habitId, year, month, day) => {
    if (shields <= 0) return;
    const key = `${habitId}|${year}|${month}|${day}`;
    setCompletions(prev => ({ ...prev, [key]: true }));
    setShields(s => Math.max(0, s - 1));
  }, [shields]);

  const addHabit = useCallback((name, color, icon, days, reminderTime) => {
    setHabits(prev => {
      const c = color || HABIT_COLORS[prev.length % HABIT_COLORS.length];
      return [...prev, {
        id: `h${Date.now()}`,
        name,
        color: c,
        icon: icon || '⭐',
        days: days || [0,1,2,3,4,5,6],
        reminderTime: reminderTime || null,
        createdAt: Date.now(),
      }];
    });
  }, []);

  const addHabitFromTemplate = useCallback((template) => {
    setHabits(prev => [...prev, {
      id:          `h${Date.now()}`,
      name:        template.name,
      color:       template.color || HABIT_COLORS[prev.length % HABIT_COLORS.length],
      icon:        template.icon  || '⭐',
      days:        template.days  || [0,1,2,3,4,5,6],
      reminderTime: template.reminderTime || null,
      category:    template.category || null,
      createdAt:   Date.now(),
    }]);
  }, []);

  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  const editHabit = useCallback((id, name, color, icon, days, reminderTime) => {
    setHabits(prev => prev.map(h =>
      h.id === id
        ? { ...h, name, ...(color ? { color } : {}), icon: icon || h.icon, days: days || h.days, reminderTime: reminderTime !== undefined ? reminderTime : h.reminderTime }
        : h
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
    if (initialHabits?.length > 0) setHabits(initialHabits);
    setOnboarded(true);
    localStorage.setItem(STORAGE_KEYS.onboarded, JSON.stringify(true));
    setView('today');
  }, []);

  // ── Avatar ────────────────────────────────────────────────────────────────
  const initials = currentUser
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : null;

  // ── Profile panel (mobile) ────────────────────────────────────────────────
  const profilePanel = (
    <div className="profile-panel">
      <div className="profile-panel-header">
        {currentUser ? (
          <>
            <div className="profile-avatar-lg">{initials}</div>
            <div className="profile-user-info">
              <span className="profile-name">{currentUser.name}</span>
              <span className="profile-email">{currentUser.email}</span>
            </div>
          </>
        ) : (
          <div className="profile-guest">
            <span className="profile-guest-icon">👤</span>
            <span className="profile-guest-label">Guest Mode</span>
          </div>
        )}
      </div>
      <div className="profile-actions">
        <button className="profile-action-btn" onClick={() => { setShowAchievements(true); setMobileProfile(false); }}>
          🏆 Achievements
        </button>
        <button className="profile-action-btn" onClick={() => { setShowPremium(true); setMobileProfile(false); }}>
          👑 Go Premium
        </button>
        {currentUser ? (
          <button className="profile-action-btn danger" onClick={handleSignOut}>
            Sign Out
          </button>
        ) : (
          <button className="profile-action-btn" onClick={openLogin}>
            Sign In
          </button>
        )}
      </div>
    </div>
  );

  // ── Screens ───────────────────────────────────────────────────────────────
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

  // ── Main app ──────────────────────────────────────────────────────────────
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

          {/* Achievements / Premium buttons (desktop) */}
          <button className="header-icon-btn" onClick={() => setShowAchievements(true)} title="Achievements">🏆</button>
          <button className="header-icon-btn" onClick={() => setShowPremium(true)} title="Premium">👑</button>

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
        {/* Desktop sidebar */}
        <Sidebar
          open={sidebarOpen}
          habits={habits}
          completions={completions}
          onAdd={addHabit}
          onDelete={deleteHabit}
          onEdit={editHabit}
          onReorder={reorderHabits}
          onShowStats={setStatsHabit}
          onShowTemplates={() => setShowTemplates(true)}
        />

        {/* Mobile habits drawer */}
        {mobileHabits && (
          <div className="mobile-drawer-overlay" onClick={() => setMobileHabits(false)}>
            <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
              <Sidebar
                open={true}
                habits={habits}
                completions={completions}
                onAdd={addHabit}
                onDelete={deleteHabit}
                onEdit={editHabit}
                onReorder={reorderHabits}
                onShowStats={(h) => { setStatsHabit(h); setMobileHabits(false); }}
                onShowTemplates={() => { setShowTemplates(true); setMobileHabits(false); }}
              />
            </div>
          </div>
        )}

        {/* Mobile profile drawer */}
        {mobileProfile && (
          <div className="mobile-drawer-overlay" onClick={() => setMobileProfile(false)}>
            <div className="mobile-drawer profile-drawer" onClick={e => e.stopPropagation()}>
              {profilePanel}
            </div>
          </div>
        )}

        <main className="main-content">
          {view === 'today' && (
            <TodayView
              habits={habits}
              completions={completions}
              intentions={intentions}
              notes={notes}
              shields={shields}
              isCompleted={isCompleted}
              onToggle={toggleCompletion}
              onSetIntention={setIntention}
              onAddNote={addNote}
              onUseShield={useShield}
              currentUser={currentUser}
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

      {/* Bottom nav (mobile) */}
      <BottomNav
        view={view}
        onSetView={(v) => { setView(v); setMobileHabits(false); setMobileProfile(false); }}
        onHabits={() => setMobileHabits(v => !v)}
        onProfile={() => setMobileProfile(v => !v)}
        habitsActive={mobileHabits}
        profileActive={mobileProfile}
      />

      {/* Modals */}
      {statsHabit && (
        <HabitStatsModal
          habit={statsHabit}
          completions={completions}
          achievements={achievements}
          onClose={() => setStatsHabit(null)}
        />
      )}
      {showTemplates && (
        <HabitTemplates
          onAdd={addHabitFromTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
      {showAchievements && (
        <AchievementsModal
          habits={habits}
          completions={completions}
          achievements={achievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
      {showPremium && (
        <PremiumModal onClose={() => setShowPremium(false)} />
      )}
    </div>
  );
}

export default App;
