import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import GoalsView from './components/GoalsView';
import InsightsView from './components/InsightsView';
import FocusTimer from './components/FocusTimer';
import WeeklyReview, { shouldShowWeeklyReview } from './components/WeeklyReview';
import ExportModal from './components/ExportModal';
import HealthView from './components/HealthView';
import TrackerView from './components/TrackerView';
import AICoachView from './components/AICoachView';
import JournalView from './components/JournalView';
import ProfileView from './components/ProfileView';
import { computeAchievements } from './utils/achievements';
import { scheduleAllReminders, requestPermission, scheduleStreakRescue, scheduleMorningBrief } from './utils/notifications';
import { getOverallStreak } from './utils/streaks';
import { HABIT_COLORS } from './utils/constants';
import { isConfigured as isSupabaseConfigured, syncUp, syncDown, subscribeToSync, unsubscribeFromSync } from './utils/supabase';
import { parseNaturalLanguage } from './utils/nlParser';

const STORAGE_KEYS = {
  habits:           'ritual_habits',
  completions:      'ritual_completions',
  intentions:       'ritual_intentions',
  notes:            'ritual_notes',
  shields:          'ritual_shields',
  achievements:     'ritual_achievements',
  onboarded:        'ritual_onboarded',
  milestones:       'ritual_milestones',
  moods:            'ritual_moods',
  water:            'ritual_water',
  sleep:            'ritual_sleep',
  gratitude:        'ritual_gratitude',
  goals:            'ritual_goals',
  challenges:       'ritual_challenges',
  weeklyReviews:    'ritual_reviews',
  archivedHabits:   'ritual_archived',
  theme:            'ritual_theme',
  briefTime:        'ritual_brief_time',
  screenTime:       'ritual_screen',
  screenGoal:       'ritual_screen_goal',
  journal:          'ritual_journal',
  // Health suite
  nutrition:        'ritual_nutrition',
  nutritionGoals:   'ritual_nutrition_goals',
  workouts:         'ritual_workouts',
  bodyMeasurements: 'ritual_body',
  wellbeing:        'ritual_wellbeing',
  period:           'ritual_period',
  habitStacks:      'ritual_habit_stacks',
  recipes:          'ritual_recipes',
  mealPlans:        'ritual_meal_plans',
  bonusXP:          'ritual_bonus_xp',
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

  // ── Core app state ────────────────────────────────────────────────────────
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

  // ── New self-improvement state ────────────────────────────────────────────
  const [moods,          setMoods]          = useState(() => load(STORAGE_KEYS.moods, {}));
  const [water,          setWater]          = useState(() => load(STORAGE_KEYS.water, {}));
  const [sleep,          setSleep]          = useState(() => load(STORAGE_KEYS.sleep, {}));
  const [gratitude,      setGratitude]      = useState(() => load(STORAGE_KEYS.gratitude, {}));
  const [goals,          setGoals]          = useState(() => load(STORAGE_KEYS.goals, []));
  const [challenges,     setChallenges]     = useState(() => load(STORAGE_KEYS.challenges, []));
  const [weeklyReviews,  setWeeklyReviews]  = useState(() => load(STORAGE_KEYS.weeklyReviews, {}));
  const [archivedHabits, setArchivedHabits] = useState(() => load(STORAGE_KEYS.archivedHabits, []));
  const [theme,          setTheme]          = useState(() => load(STORAGE_KEYS.theme, 'dark'));
  const [briefTime,      setBriefTime]      = useState(() => load(STORAGE_KEYS.briefTime, '08:00')); // eslint-disable-line
  const [screenTime,     setScreenTime]     = useState(() => load(STORAGE_KEYS.screenTime, {}));
  const [screenGoal,     setScreenGoal]     = useState(() => load(STORAGE_KEYS.screenGoal, 3));

  const [journal,          setJournal]          = useState(() => load(STORAGE_KEYS.journal, {}));

  // ── Health suite state ────────────────────────────────────────────────────
  const [nutrition,        setNutrition]        = useState(() => load(STORAGE_KEYS.nutrition, {}));
  const [nutritionGoals,   setNutritionGoals]   = useState(() => load(STORAGE_KEYS.nutritionGoals, { calories: 2000, protein: 150, carbs: 200, fat: 65 }));
  const [workouts,         setWorkouts]         = useState(() => load(STORAGE_KEYS.workouts, []));
  const [bodyMeasurements, setBodyMeasurements] = useState(() => load(STORAGE_KEYS.bodyMeasurements, []));
  const [wellbeing,        setWellbeing]        = useState(() => load(STORAGE_KEYS.wellbeing, {}));
  const [period,           setPeriod]           = useState(() => load(STORAGE_KEYS.period, {}));

  const [habitStacks,  setHabitStacks]  = useState(() => load('ritual_habit_stacks', []));
  const [recipes,      setRecipes]      = useState(() => load('ritual_recipes', []));
  const [mealPlans,    setMealPlans]    = useState(() => load('ritual_meal_plans', {}));
  const [bonusXP,      setBonusXP]      = useState(() => load('ritual_bonus_xp', 0));

  // ── NL Logger UI state ────────────────────────────────────────────────────
  const [showNLLog,    setShowNLLog]    = useState(false);
  const [nlInput,      setNLInput]      = useState('');
  const [nlParsed,     setNLParsed]     = useState(null);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [view,         setView]         = useState('today');
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [statsHabit,   setStatsHabit]   = useState(null);
  const [showTemplates,    setShowTemplates]    = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPremium,      setShowPremium]      = useState(false);
  const [showFocusTimer,   setShowFocusTimer]   = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showExport,       setShowExport]       = useState(false);
  const [isPremium,        setIsPremium]        = useState(() => { // eslint-disable-line
    try { return JSON.parse(localStorage.getItem('ritual_premium') || 'false'); } catch { return false; }
  });

  // ── Persistence ───────────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.habits,        JSON.stringify(habits));        }, [habits]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.completions,   JSON.stringify(completions));   }, [completions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.intentions,    JSON.stringify(intentions));    }, [intentions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.notes,         JSON.stringify(notes));         }, [notes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.shields,       JSON.stringify(shields));       }, [shields]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.achievements,  JSON.stringify(achievements));  }, [achievements]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.milestones,    JSON.stringify(milestones));    }, [milestones]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.moods,         JSON.stringify(moods));         }, [moods]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.water,         JSON.stringify(water));         }, [water]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.sleep,         JSON.stringify(sleep));         }, [sleep]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.gratitude,     JSON.stringify(gratitude));     }, [gratitude]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.goals,         JSON.stringify(goals));         }, [goals]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.challenges,    JSON.stringify(challenges));    }, [challenges]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.weeklyReviews, JSON.stringify(weeklyReviews)); }, [weeklyReviews]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.archivedHabits,JSON.stringify(archivedHabits));}, [archivedHabits]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.theme,         JSON.stringify(theme));         }, [theme]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.screenTime,    JSON.stringify(screenTime));    }, [screenTime]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.screenGoal,    JSON.stringify(screenGoal));    }, [screenGoal]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.journal,          JSON.stringify(journal));          }, [journal]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.nutrition,        JSON.stringify(nutrition));        }, [nutrition]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.nutritionGoals,   JSON.stringify(nutritionGoals));   }, [nutritionGoals]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.workouts,         JSON.stringify(workouts));         }, [workouts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.bodyMeasurements, JSON.stringify(bodyMeasurements)); }, [bodyMeasurements]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.wellbeing,        JSON.stringify(wellbeing));        }, [wellbeing]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.period,           JSON.stringify(period));           }, [period]);
  useEffect(() => { localStorage.setItem('ritual_habit_stacks', JSON.stringify(habitStacks)); }, [habitStacks]);
  useEffect(() => { localStorage.setItem('ritual_recipes',      JSON.stringify(recipes));     }, [recipes]);
  useEffect(() => { localStorage.setItem('ritual_meal_plans',   JSON.stringify(mealPlans));   }, [mealPlans]);
  useEffect(() => { localStorage.setItem('ritual_bonus_xp',     JSON.stringify(bonusXP));     }, [bonusXP]);

  // ── Theme ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (theme === 'light') document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }, [theme]);

  // ── Notification scheduling ───────────────────────────────────────────────
  useEffect(() => {
    const hasReminders = habits.some(h => h.reminderTime);
    if (hasReminders) {
      requestPermission().then(perm => {
        if (perm === 'granted') {
          scheduleAllReminders(habits);
          scheduleStreakRescue(habits, completions);
          scheduleMorningBrief(habits, briefTime);
        }
      });
    }
  }, [habits, completions, briefTime]);

  // ── Electron keyboard shortcuts ──────────────────────────────────────────
  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.onShortcut((key) => {
      if (key === 'journal')     setView('journal');
      if (key === 'new-habit')   setSidebarOpen(true);
      if (key === 'focus-timer') setShowFocusTimer(true);
    });
    return () => window.electronAPI.removeShortcutListener();
  }, []);

  // ── Supabase realtime sync ────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || !isSupabaseConfigured()) return;
    const channel = subscribeToSync(currentUser.id, (row) => {
      if (row.habits)        setHabits(ensureHabitDefaults(row.habits));
      if (row.completions)   setCompletions(row.completions);
      if (row.goals)         setGoals(row.goals);
      if (row.sleep_data)    setSleep(row.sleep_data);
      if (row.moods)         setMoods(row.moods);
      if (row.water)         setWater(row.water);
    });
    return () => unsubscribeFromSync(channel);
  }, [currentUser]); // eslint-disable-line

  // ── Achievement & shield computation ─────────────────────────────────────
  useEffect(() => {
    const computed = computeAchievements(habits, completions);
    setAchievements(prev => {
      const hasNew = Object.keys(computed).some(k => !prev[k]);
      return hasNew ? { ...prev, ...computed } : prev;
    });
  }, [habits, completions]);

  // Award shields for perfect weeks
  useEffect(() => {
    const overall = getOverallStreak(habits, completions);
    const milestone = Math.floor(overall / 7) * 7;
    if (milestone > 0 && !milestones.includes(milestone)) {
      setShields(s => s + 1);
      setMilestones(prev => [...prev, milestone]);
    }
  }, [completions, habits]); // eslint-disable-line

  // ── Weekly review prompt ──────────────────────────────────────────────────
  useEffect(() => {
    if (shouldShowWeeklyReview(weeklyReviews)) {
      const timer = setTimeout(() => setShowWeeklyReview(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line

  // ── Supabase: pull data on login ──────────────────────────────────────────
  useEffect(() => {
    if (!currentUser || !isSupabaseConfigured()) return;
    syncDown(currentUser.id).then(data => {
      if (!data) return;
      if (data.habits?.length)         setHabits(ensureHabitDefaults(data.habits));
      if (data.completions)             setCompletions(data.completions);
      if (data.notes)                   setNotes(data.notes);
      if (data.moods)                   setMoods(data.moods);
      if (data.water)                   setWater(data.water);
      if (data.sleep_data)              setSleep(data.sleep_data);
      if (data.gratitude)               setGratitude(data.gratitude);
      if (data.goals?.length)           setGoals(data.goals);
      if (data.challenges?.length)      setChallenges(data.challenges);
      if (data.archived_habits?.length) setArchivedHabits(data.archived_habits);
      if (typeof data.shields === 'number') setShields(data.shields);
      if (data.milestones?.length)      setMilestones(data.milestones);
      if (data.achievements)            setAchievements(prev => ({ ...prev, ...data.achievements }));
      if (data.weekly_reviews)          setWeeklyReviews(data.weekly_reviews);
      if (data.intentions)              setIntentions(data.intentions);
    });
  }, [currentUser?.id]); // eslint-disable-line

  // ── Supabase: push data on change (debounced 3s) ──────────────────────────
  const syncTimer = useRef(null);
  useEffect(() => {
    if (!currentUser || !isSupabaseConfigured()) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncUp(currentUser.id, {
        habits, completions, notes, moods, water,
        sleep_data: sleep, gratitude, goals, challenges,
        archived_habits: archivedHabits, shields, milestones,
        achievements, weekly_reviews: weeklyReviews, intentions,
      });
    }, 3000);
    return () => clearTimeout(syncTimer.current);
  }, [habits, completions, notes, moods, water, sleep, gratitude, goals, challenges, archivedHabits, shields, milestones, achievements, weeklyReviews, intentions]); // eslint-disable-line

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

  // GDPR: delete all local data + sign out
  const handleDeleteAccount = useCallback(() => {
    if (!window.confirm('This will permanently delete all your local data. This cannot be undone. Continue?')) return;
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('ritual_premium');
    clearSession();
    setCurrentUser(null);
    setScreen('landing');
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

  const addHabit = useCallback((name, color, icon, days, reminderTime, category, why, difficulty, frequency, frequencyTarget) => {
    setHabits(prev => {
      if (!isPremium && prev.length >= 5) { setShowPremium(true); return prev; }
      const c = color || HABIT_COLORS[prev.length % HABIT_COLORS.length];
      return [...prev, {
        id: `h${Date.now()}`,
        name,
        color: c,
        icon: icon || '⭐',
        days: days || [0,1,2,3,4,5,6],
        reminderTime: reminderTime || null,
        category: category || null,
        why: why || null,
        difficulty: difficulty || null,
        frequency: frequency || null,
        frequencyTarget: frequencyTarget || null,
        createdAt: Date.now(),
      }];
    });
  }, [isPremium]);

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

  const editHabit = useCallback((id, name, color, icon, days, reminderTime, category, why, difficulty, frequency, frequencyTarget) => {
    setHabits(prev => prev.map(h =>
      h.id === id
        ? { ...h, name, ...(color ? { color } : {}), icon: icon || h.icon, days: days || h.days, reminderTime: reminderTime !== undefined ? reminderTime : h.reminderTime, category: category !== undefined ? category : h.category, why: why !== undefined ? why : h.why, difficulty: difficulty !== undefined ? difficulty : h.difficulty, frequency: frequency !== undefined ? frequency : h.frequency, frequencyTarget: frequencyTarget !== undefined ? frequencyTarget : h.frequencyTarget }
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

  const archiveHabit = useCallback((id) => {
    setHabits(prev => {
      const habit = prev.find(h => h.id === id);
      if (!habit) return prev;
      setArchivedHabits(a => [...a, habit]);
      return prev.filter(h => h.id !== id);
    });
  }, []);

  const restoreHabit = useCallback((id) => {
    setArchivedHabits(prev => {
      const habit = prev.find(h => h.id === id);
      if (!habit) return prev;
      setHabits(h => [...h, habit]);
      return prev.filter(h => h.id !== id);
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

  // ── Wellness handlers ─────────────────────────────────────────────────────
  const handleSetMood = useCallback((dateKey, score) => {
    setMoods(prev => score === null
      ? Object.fromEntries(Object.entries(prev).filter(([k]) => k !== dateKey))
      : { ...prev, [dateKey]: { score } }
    );
  }, []);

  const handleSetWater = useCallback((dateKey, count) => {
    setWater(prev => ({ ...prev, [dateKey]: count }));
  }, []);

  const handleSetSleep = useCallback((dateKey, entry) => {
    setSleep(prev => ({ ...prev, [dateKey]: entry }));
  }, []);

  const handleSetGratitude = useCallback((dateKey, items) => {
    setGratitude(prev => ({ ...prev, [dateKey]: items }));
  }, []);

  const handleSetScreenTime = useCallback((dateKey, actual) => {
    setScreenTime(prev => ({ ...prev, [dateKey]: { ...(prev[dateKey] || {}), actual } }));
  }, []);

  const handleSetScreenGoal = useCallback((goal) => {
    setScreenGoal(goal);
  }, []);

  const handleSetJournal = useCallback((dateKey, text) => {
    setJournal(prev => text ? { ...prev, [dateKey]: text } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== dateKey)));
  }, []);

  // ── NL Log handler ────────────────────────────────────────────────────────
  const handleNLConfirm = useCallback(() => {
    if (!nlParsed) return;
    const workout = {
      id:        `w${Date.now()}`,
      date:      new Date().toISOString(),
      name:      nlParsed.name || nlParsed.type,
      type:      nlParsed.type || 'Other',
      exercises: nlParsed.exercises || [],
      duration:  nlParsed.duration || 0,
      calories:  nlParsed.duration ? Math.round(nlParsed.duration * 7) : 0,
      distance:  nlParsed.distance,
      distanceUnit: nlParsed.distanceUnit,
      pace:      nlParsed.pace,
      startTime: Date.now(),
      endTime:   Date.now(),
      createdAt: Date.now(),
    };
    setWorkouts(prev => [...prev, workout]);
    setShowNLLog(false);
    setNLInput('');
    setNLParsed(null);
  }, [nlParsed]);

  // ── Goals handlers ────────────────────────────────────────────────────────
  const addGoal = useCallback((data) => {
    setGoals(prev => [...prev, { id: `g${Date.now()}`, ...data, completed: false, createdAt: Date.now() }]);
  }, []);

  const editGoal = useCallback((id, data) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  }, []);

  const deleteGoal = useCallback((id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  }, []);

  const completeGoal = useCallback((id) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: true, completedAt: Date.now() } : g));
  }, []);

  // ── Challenges handlers ───────────────────────────────────────────────────
  const addChallenge = useCallback((data) => {
    setChallenges(prev => [...prev, { id: `c${Date.now()}`, ...data, completions: {}, createdAt: Date.now() }]);
  }, []);

  const editChallenge = useCallback((id, data) => {
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const deleteChallenge = useCallback((id) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
  }, []);

  const toggleChallengeDay = useCallback((id, dayIndex) => {
    setChallenges(prev => prev.map(c =>
      c.id === id
        ? { ...c, completions: { ...c.completions, [String(dayIndex)]: !c.completions[String(dayIndex)] } }
        : c
    ));
  }, []);

  // ── Weekly review handler ─────────────────────────────────────────────────
  const saveWeeklyReview = useCallback((weekKey, data) => {
    setWeeklyReviews(prev => ({ ...prev, [weekKey]: data }));
  }, []);

  // ── Health suite handlers ─────────────────────────────────────────────────
  const handleSetNutrition = useCallback((dateKey, meals) => {
    setNutrition(prev => ({ ...prev, [dateKey]: meals }));
  }, []);

  const handleSetNutritionGoals = useCallback((goals) => {
    setNutritionGoals(goals);
  }, []);

  const addWorkout = useCallback((workout) => {
    setWorkouts(prev => [...prev, { id: `w${Date.now()}`, ...workout, createdAt: Date.now() }]);
  }, []);

  const updateWorkout = useCallback((id, data) => {
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, ...data } : w));
  }, []);

  const deleteWorkout = useCallback((id) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  }, []);

  const addMeasurement = useCallback((measurement) => {
    setBodyMeasurements(prev => [...prev, { id: `m${Date.now()}`, ...measurement, createdAt: Date.now() }]);
  }, []);

  const handleSetWellbeing = useCallback((dateKey, data) => {
    setWellbeing(prev => ({ ...prev, [dateKey]: data }));
  }, []);

  const handleSetPeriod = useCallback((data) => {
    setPeriod(data);
  }, []);

  // ── Habit stacks ──────────────────────────────────────────────────────────
  const addStack    = useCallback((data)     => setHabitStacks(s => [...s, data]), []);
  const editStack   = useCallback((id, data) => setHabitStacks(s => s.map(st => st.id === id ? { ...st, ...data } : st)), []);
  const deleteStack = useCallback((id)       => setHabitStacks(s => s.filter(st => st.id !== id)), []);

  // ── Recipes ───────────────────────────────────────────────────────────────
  const addRecipe    = useCallback((r)  => setRecipes(s => [...s, r]), []);
  const deleteRecipe = useCallback((id) => setRecipes(s => s.filter(r => r.id !== id)), []);

  // ── Meal plans ────────────────────────────────────────────────────────────
  const setMealPlan = useCallback((dateKey, plan) => setMealPlans(mp => ({ ...mp, [dateKey]: plan })), []);

  // ── Bonus XP ──────────────────────────────────────────────────────────────
  const addBonusXP = useCallback((amount) => setBonusXP(p => p + amount), []);

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
        <button className="profile-action-btn" onClick={() => { setShowExport(true); setMobileProfile(false); }}>
          📦 Export Data
        </button>
        {currentUser ? (
          <>
            <button className="profile-action-btn danger" onClick={handleSignOut}>Sign Out</button>
            <button className="profile-action-btn danger" onClick={() => { handleDeleteAccount(); setMobileProfile(false); }}>
              🗑 Delete All Data
            </button>
          </>
        ) : (
          <button className="profile-action-btn" onClick={openLogin}>Sign In</button>
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
            <button className={`view-toggle-btn ${view === 'today'    ? 'active' : ''}`} onClick={() => setView('today')}>Today</button>
            <button className={`view-toggle-btn ${view === 'month'    ? 'active' : ''}`} onClick={() => setView('month')}>Month</button>
            <button className={`view-toggle-btn ${view === 'year'     ? 'active' : ''}`} onClick={() => setView('year')}>Year</button>
            <button className={`view-toggle-btn ${view === 'goals'    ? 'active' : ''}`} onClick={() => setView('goals')}>Goals</button>
            <button className={`view-toggle-btn ${view === 'health'   ? 'active' : ''}`} onClick={() => setView('health')}>Health</button>
            <button className={`view-toggle-btn ${view === 'insights' ? 'active' : ''}`} onClick={() => setView('insights')}>Insights</button>
            <button className={`view-toggle-btn ${view === 'journal'  ? 'active' : ''}`} onClick={() => setView('journal')}>Journal</button>
            <button className={`view-toggle-btn ${view === 'coach'    ? 'active' : ''}`} onClick={() => setView('coach')}>Coach</button>
          </div>
        </div>

        <div className="header-right">
          <span className="header-date">
            {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>

          <button className="header-icon-btn" onClick={() => setShowExport(true)} title="Export Data">📦</button>
          <button className="header-icon-btn" onClick={() => setShowNLLog(true)} title="Quick Log (Natural Language)">🗣️</button>
          <button className="header-icon-btn" onClick={() => setShowFocusTimer(true)} title="Focus Timer">⏱</button>
          <button className="header-icon-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
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
          onArchive={archiveHabit}
          archivedHabits={archivedHabits}
          onRestore={restoreHabit}
          isPremium={isPremium}
          onShowPremium={() => setShowPremium(true)}
          stacks={habitStacks}
          onAddStack={addStack}
          onEditStack={editStack}
          onDeleteStack={deleteStack}
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
                onArchive={archiveHabit}
                archivedHabits={archivedHabits}
                onRestore={restoreHabit}
                isPremium={isPremium}
                onShowPremium={() => { setShowPremium(true); setMobileHabits(false); }}
                stacks={habitStacks}
                onAddStack={addStack}
                onEditStack={editStack}
                onDeleteStack={deleteStack}
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
          <AnimatePresence mode="wait">
          {view === 'today' && (
            <motion.div key="today" className="view-motion"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
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
              moods={moods}
              water={water}
              sleep={sleep}
              gratitude={gratitude}
              screenTime={screenTime}
              screenGoal={screenGoal}
              onSetMood={handleSetMood}
              onSetWater={handleSetWater}
              onSetSleep={handleSetSleep}
              onSetGratitude={handleSetGratitude}
              onSetScreenTime={handleSetScreenTime}
              onSetScreenGoal={handleSetScreenGoal}
              stacks={habitStacks}
              onAddBonusXP={addBonusXP}
              onNavigate={(v) => { setView(v); setMobileHabits(false); setMobileProfile(false); }}
            />
            </motion.div>
          )}
          {view === 'tracker' && (
            <motion.div key="tracker" className="view-motion"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
            <TrackerView
              habits={habits}
              completions={completions}
              isCompleted={isCompleted}
              onToggle={toggleCompletion}
              year={currentYear}
              month={currentMonth}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              onYearChange={setCurrentYear}
              onSelectMonth={(m) => { setCurrentMonth(m); }}
              onAddHabit={addHabit}
              onEditHabit={editHabit}
              onDeleteHabit={deleteHabit}
              goals={goals}
              challenges={challenges}
              moods={moods}
              water={water}
              sleep={sleep}
              onAddGoal={addGoal}
              onEditGoal={editGoal}
              onDeleteGoal={deleteGoal}
              onCompleteGoal={completeGoal}
              onAddChallenge={addChallenge}
              onEditChallenge={editChallenge}
              onDeleteChallenge={deleteChallenge}
              onToggleChallenge={toggleChallengeDay}
              onAddBonusXP={addBonusXP}
            />
            </motion.div>
          )}
          {view === 'month' && (
            <motion.div key="month" className="view-motion"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
            <MonthView
              habits={habits}
              year={currentYear}
              month={currentMonth}
              isCompleted={isCompleted}
              onToggle={toggleCompletion}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
            />
            </motion.div>
          )}
          {view === 'year' && (
            <motion.div key="year" className="view-motion"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
            <YearOverview
              habits={habits}
              year={currentYear}
              isCompleted={isCompleted}
              onYearChange={setCurrentYear}
              onSelectMonth={(month) => { setCurrentMonth(month); setView('month'); }}
            />
            </motion.div>
          )}
          {view === 'goals' && (
            <motion.div key="goals" className="view-motion"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
            <GoalsView
              goals={goals}
              challenges={challenges}
              habits={habits}
              completions={completions}
              onAddGoal={addGoal}
              onEditGoal={editGoal}
              onDeleteGoal={deleteGoal}
              onCompleteGoal={completeGoal}
              onAddChallenge={addChallenge}
              onEditChallenge={editChallenge}
              onDeleteChallenge={deleteChallenge}
              onToggleChallenge={toggleChallengeDay}
              onAddBonusXP={addBonusXP}
            />
            </motion.div>
          )}
          {view === 'insights' && (
            <motion.div key="insights" className="view-motion"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
            <InsightsView
              habits={habits}
              completions={completions}
              moods={moods}
              water={water}
              sleep={sleep}
            />
            </motion.div>
          )}
          {view === 'health' && (
            <motion.div key="health" className="view-motion"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
            <HealthView
              sleep={sleep}
              onSetSleep={handleSetSleep}
              nutrition={nutrition}
              nutritionGoals={nutritionGoals}
              onSetNutrition={handleSetNutrition}
              onSetNutritionGoals={handleSetNutritionGoals}
              workouts={workouts}
              bodyMeasurements={bodyMeasurements}
              onAddWorkout={addWorkout}
              onUpdateWorkout={updateWorkout}
              onDeleteWorkout={deleteWorkout}
              onAddMeasurement={addMeasurement}
              wellbeing={wellbeing}
              period={period}
              onSetWellbeing={handleSetWellbeing}
              onSetPeriod={handleSetPeriod}
              isPremium={isPremium}
              onShowPremium={() => setShowPremium(true)}
              onAddBonusXP={addBonusXP}
              recipes={recipes}
              onAddRecipe={addRecipe}
              onDeleteRecipe={deleteRecipe}
              mealPlans={mealPlans}
              onSetMealPlan={setMealPlan}
            />
            </motion.div>
          )}
          {view === 'journal' && (
            <motion.div key="journal" className="view-motion"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
            <JournalView journal={journal} onSetJournal={handleSetJournal} />
            </motion.div>
          )}
          {view === 'coach' && (
            <motion.div key="coach" className="view-motion"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
            <AICoachView
              habits={habits}
              completions={completions}
              moods={moods}
              sleep={sleep}
              water={water}
              goals={goals}
              workouts={workouts}
              nutrition={nutrition}
              wellbeing={wellbeing}
            />
            </motion.div>
          )}
          {view === 'profile' && (
            <motion.div key="profile" className="view-motion"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
            <ProfileView
              currentUser={currentUser}
              habits={habits}
              completions={completions}
              sleep={sleep}
              workouts={workouts}
              journal={journal}
              shields={shields}
              isSupabaseSynced={isSupabaseConfigured()}
              onShowAchievements={() => setShowAchievements(true)}
              onShowPremium={() => setShowPremium(true)}
              onShowExport={() => setShowExport(true)}
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
              onSignIn={openLogin}
            />
            </motion.div>
          )}
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <BottomNav
        view={view}
        onSetView={(v) => { setView(v); setMobileHabits(false); setMobileProfile(false); }}
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
      {showFocusTimer && (
        <FocusTimer
          onClose={() => setShowFocusTimer(false)}
          habits={habits}
          onToggle={toggleCompletion}
        />
      )}
      {showWeeklyReview && (
        <WeeklyReview
          weeklyReviews={weeklyReviews}
          habits={habits}
          completions={completions}
          onSave={saveWeeklyReview}
          onClose={() => setShowWeeklyReview(false)}
        />
      )}
      {showExport && (
        <ExportModal
          habits={habits}
          completions={completions}
          goals={goals}
          workouts={workouts}
          nutrition={nutrition}
          sleep={sleep}
          wellbeing={wellbeing}
          moods={moods}
          water={water}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Natural Language Logger Modal */}
      {showNLLog && (
        <div className="nl-log-modal-overlay" onClick={() => { setShowNLLog(false); setNLInput(''); setNLParsed(null); }}>
          <div className="nl-log-modal" onClick={e => e.stopPropagation()}>
            <h3>🗣️ Quick Log</h3>
            <p>Describe your activity in plain English and Ritual will log it automatically.</p>
            <input
              className="nl-log-input"
              placeholder='e.g. "ran 5km in 28 minutes" or "45 minutes of yoga"'
              value={nlInput}
              autoFocus
              onChange={e => {
                setNLInput(e.target.value);
                setNLParsed(parseNaturalLanguage(e.target.value));
              }}
              onKeyDown={e => { if (e.key === 'Enter' && nlParsed) handleNLConfirm(); }}
            />
            {nlParsed && (
              <div className="nl-log-result">
                <div className="nl-log-result-label">Detected workout</div>
                <strong>{nlParsed.name || nlParsed.type}</strong>
                {nlParsed.distance && <span> · {nlParsed.distance}{nlParsed.distanceUnit}</span>}
                {nlParsed.duration && <span> · {nlParsed.duration} min</span>}
                {nlParsed.exercises?.length > 0 && <span> · {nlParsed.exercises.length} exercise(s)</span>}
              </div>
            )}
            {nlInput && !nlParsed && (
              <div className="nl-log-result" style={{ color: 'var(--t3)' }}>
                Couldn't parse that — try "ran 5km", "45 min yoga", or "squatted 80kg for 3 sets of 8"
              </div>
            )}
            <div className="nl-log-actions">
              <button className="nl-log-cancel-btn" onClick={() => { setShowNLLog(false); setNLInput(''); setNLParsed(null); }}>Cancel</button>
              <button className="nl-log-confirm-btn" onClick={handleNLConfirm} disabled={!nlParsed}>Log Workout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
