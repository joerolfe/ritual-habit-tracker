import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { completionColor } from './MonthView';
import { getCurrentStreak, getOverallStreak, isStreakAtRisk } from '../utils/streaks';
import { getLevelInfo } from '../utils/achievements';
import Confetti from './Confetti';
import NotesModal from './NotesModal';

// ── Constants ────────────────────────────────────────────────────────────────
const QUOTES = [
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { text: "A year from now you'll wish you had started today.", author: "Karen Lamb" },
  { text: "It's not about perfect. It's about effort. Every day.", author: "Jillian Michaels" },
  { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
  { text: "You are what you do, not what you say you'll do.", author: "Carl Jung" },
  { text: "Great things never came from comfort zones.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Consistency is what transforms average into excellence.", author: "Unknown" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { text: "An investment in yourself pays the best interest.", author: "Benjamin Franklin" },
  { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
];

const MOODS_LIST = [
  { score: 1, emoji: '😞', label: 'Rough' },
  { score: 2, emoji: '😕', label: 'Meh' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😊', label: 'Great' },
];

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LONG  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ABBR  = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getGreeting(hour, name) {
  const first = name ? `, ${name.split(' ')[0]}` : '';
  if (hour >= 5  && hour < 12) return `Good morning${first}`;
  if (hour >= 12 && hour < 17) return `Good afternoon${first}`;
  if (hour >= 17 && hour < 21) return `Good evening${first}`;
  return `Still up${first}?`;
}

function getTimeGroup(reminderTime) {
  if (!reminderTime) return 'anytime';
  const h = parseInt(reminderTime.split(':')[0], 10);
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  return 'evening';
}

const GROUP_ORDER  = ['morning', 'afternoon', 'evening', 'anytime'];
const GROUP_LABELS = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', anytime: 'Habits' };
const GROUP_ICONS  = { morning: '🌅', afternoon: '☀️', evening: '🌙', anytime: '⭐' };

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calcSleepDuration(bedtime, wake) {
  if (!bedtime || !wake) return null;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60), m = mins % 60;
  return { h, m, total: mins / 60, label: `${h}h${m > 0 ? ` ${m}m` : ''}` };
}

// ── Life Score Ring ───────────────────────────────────────────────────────────
function LifeScoreRing({ score, onClick }) {
  const size = 160, stroke = 12;
  const radius = (size - stroke) / 2;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div
      className="tv-ring-wrap"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      aria-label={`Life score ${score}. Tap for breakdown.`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1A1A1A" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none"
          stroke={score > 0 ? 'url(#scoreGrad)' : '#1A1A1A'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="tv-ring-center">
        <span className="tv-ring-num">{score}<span style={{ fontSize: 18, fontWeight: 400, color: '#888' }}>%</span></span>
        <span className="tv-ring-label">TODAY'S SCORE</span>
      </div>
    </div>
  );
}

// ── Day Pills ────────────────────────────────────────────────────────────────
function DayPills({ days }) {
  if (!days || days.length === 7) return <span className="tv-everyday-label">Every day</span>;
  return (
    <div className="tv-day-pills">
      {DAY_ABBR.map((d, i) => (
        <span key={i} className={`tv-day-pill ${days.includes(i) ? 'active' : ''}`}>{d}</span>
      ))}
    </div>
  );
}

// ── Breakdown Modal ───────────────────────────────────────────────────────────
function BreakdownModal({ components, onClose }) {
  return (
    <div className="tv-modal-overlay" onClick={onClose}>
      <div className="tv-modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="tv-modal-handle" />
        <h3 className="tv-modal-title">Today's Score Breakdown</h3>
        <div className="tv-breakdown-list">
          {components.map(c => (
            <div key={c.label} className="tv-breakdown-row">
              <span className="tv-breakdown-icon">{c.icon}</span>
              <span className="tv-breakdown-label">{c.label}</span>
              <div className="tv-breakdown-bar-wrap">
                <div className="tv-breakdown-bar">
                  <div
                    className="tv-breakdown-fill"
                    style={{ width: `${c.score}%`, background: c.color || 'rgba(255,255,255,0.65)' }}
                  />
                </div>
              </div>
              <span className="tv-breakdown-score">{c.score}%</span>
            </div>
          ))}
        </div>
        <button className="tv-modal-close-btn" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

// ── Habit Options Menu ────────────────────────────────────────────────────────
function HabitOptionsMenu({ habit, onNote, onStats, onClose }) {
  return (
    <div className="tv-modal-overlay" onClick={onClose}>
      <div className="tv-modal-sheet" onClick={e => e.stopPropagation()} style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom,0px))' }}>
        <div className="tv-modal-handle" />
        <div className="tv-options-habit-name">
          <span>{habit.icon || '⭐'}</span> {habit.name}
        </div>
        <div className="tv-options-list">
          <button className="tv-option-btn" onClick={() => { onNote(habit); onClose(); }}>
            📝 Add / Edit Note
          </button>
          <button className="tv-option-btn" onClick={() => { onStats?.(habit); onClose(); }}>
            📊 View Stats
          </button>
        </div>
        <button className="tv-option-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ── Quick Log Modal ───────────────────────────────────────────────────────────
function QuickLogModal({ type, dateKey, moods, water, sleep, gratitude, screenTime, screenGoal,
  onSetMood, onSetWater, onSetSleep, onSetGratitude, onSetScreenTime, onSetScreenGoal,
  onNavigate, onClose }) {

  const moodCurrent = moods?.[dateKey]?.score || null;
  const waterCount  = water?.[dateKey] || 0;
  const sleepEntry  = sleep?.[dateKey] || {};
  const gratItems   = gratitude?.[dateKey] || ['', '', ''];
  const screenEntry = screenTime?.[dateKey] || {};
  const screenActual = screenEntry.actual !== undefined ? String(screenEntry.actual) : '';
  const [gratState, setGratState] = useState(gratItems);
  const [screenVal, setScreenVal] = useState(screenActual);

  const titles = {
    mood: '😊 How are you feeling?',
    water: '💧 Water Intake',
    sleep: '😴 Sleep Log',
    gratitude: '🙏 Gratitude',
    screen: '📱 Screen Time',
    meal: '🍽️ Log Meal',
    workout: '💪 Log Workout',
    note: '📝 Quick Note',
  };

  return (
    <div className="tv-modal-overlay" onClick={onClose}>
      <div className="tv-modal-sheet" onClick={e => e.stopPropagation()} style={{ paddingBottom: 'calc(32px + env(safe-area-inset-bottom,0px))' }}>
        <div className="tv-modal-handle" />
        <h3 className="tv-modal-title">{titles[type]}</h3>

        {/* MOOD */}
        {type === 'mood' && (
          <div className="tv-ql-mood-row">
            {MOODS_LIST.map(m => (
              <button
                key={m.score}
                className={`tv-ql-mood-btn ${moodCurrent === m.score ? 'active' : ''}`}
                onClick={() => { onSetMood(dateKey, moodCurrent === m.score ? null : m.score); onClose(); }}
              >
                <span className="tv-ql-emoji">{m.emoji}</span>
                <span className="tv-ql-emoji-label">{m.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* WATER */}
        {type === 'water' && (
          <div>
            <p className="tv-ql-sub">{waterCount}/8 glasses logged</p>
            <div className="tv-ql-water-grid">
              {Array.from({ length: 8 }, (_, i) => (
                <button
                  key={i}
                  className={`tv-ql-glass ${i < waterCount ? 'filled' : ''}`}
                  onClick={() => onSetWater(dateKey, i < waterCount ? i : i + 1)}
                >
                  💧
                </button>
              ))}
            </div>
            <button className="tv-modal-close-btn" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
          </div>
        )}

        {/* SLEEP */}
        {type === 'sleep' && (
          <div className="tv-ql-sleep">
            <div className="tv-ql-sleep-row">
              <div className="tv-ql-sleep-field">
                <label>Bedtime</label>
                <input
                  type="time"
                  value={sleepEntry.bedtime || ''}
                  onChange={e => onSetSleep(dateKey, { ...sleepEntry, bedtime: e.target.value })}
                  style={{ background: '#1A1A1A', border: 'none', borderRadius: 12, padding: '12px 14px', fontSize: 20, fontWeight: 700, color: '#fff', width: '100%', textAlign: 'center', colorScheme: 'dark', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
              <span className="tv-ql-arrow">→</span>
              <div className="tv-ql-sleep-field">
                <label>Wake up</label>
                <input
                  type="time"
                  value={sleepEntry.wake || ''}
                  onChange={e => onSetSleep(dateKey, { ...sleepEntry, wake: e.target.value })}
                  style={{ background: '#1A1A1A', border: 'none', borderRadius: 12, padding: '12px 14px', fontSize: 20, fontWeight: 700, color: '#fff', width: '100%', textAlign: 'center', colorScheme: 'dark', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
            </div>
            {sleepEntry.bedtime && sleepEntry.wake && (() => {
              const dur = calcSleepDuration(sleepEntry.bedtime, sleepEntry.wake);
              return dur ? <p style={{ textAlign: 'center', color: '#FFFFFF', fontWeight: 600, marginTop: 12 }}>{dur.label} logged ✓</p> : null;
            })()}
            <button className="tv-modal-close-btn" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
          </div>
        )}

        {/* GRATITUDE */}
        {type === 'gratitude' && (
          <div className="tv-ql-gratitude">
            {gratState.map((val, i) => (
              <div key={i} className="tv-ql-grat-row">
                <span className="tv-ql-grat-num">{i + 1}</span>
                <input
                  className="tv-ql-grat-input"
                  type="text"
                  placeholder="I'm grateful for…"
                  value={val}
                  onChange={e => { const next = [...gratState]; next[i] = e.target.value; setGratState(next); }}
                  onBlur={() => onSetGratitude(dateKey, gratState)}
                  maxLength={120}
                />
              </div>
            ))}
            <button className="tv-modal-close-btn" style={{ marginTop: 16 }} onClick={() => { onSetGratitude(dateKey, gratState); onClose(); }}>Save</button>
          </div>
        )}

        {/* SCREEN TIME */}
        {type === 'screen' && (
          <div className="tv-ql-screen">
            <p className="tv-ql-sub">Goal: {screenGoal || 3}h</p>
            <div className="tv-ql-screen-input-wrap">
              <label>Today's screen time (hours)</label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                placeholder="0"
                value={screenVal}
                onChange={e => setScreenVal(e.target.value)}
                style={{ background: '#1A1A1A', border: 'none', borderRadius: 12, padding: '14px', fontSize: 24, fontWeight: 700, color: '#fff', width: '100%', textAlign: 'center', fontFamily: 'inherit', outline: 'none', marginTop: 8 }}
              />
            </div>
            <button className="tv-modal-close-btn" style={{ marginTop: 20 }} onClick={() => {
              const v = parseFloat(screenVal);
              if (!isNaN(v)) onSetScreenTime(dateKey, { ...screenEntry, actual: v, goal: screenGoal || 3 });
              onClose();
            }}>Save</button>
          </div>
        )}

        {/* MEAL / WORKOUT — navigate */}
        {(type === 'meal' || type === 'workout') && (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
              {type === 'meal' ? 'Log your meal in the Nutrition tracker.' : 'Log your workout in the Gym tracker.'}
            </p>
            <button className="tv-modal-close-btn" onClick={() => { onNavigate?.('health'); onClose(); }}>
              Open {type === 'meal' ? 'Nutrition' : 'Gym'} →
            </button>
          </div>
        )}

        {/* NOTE */}
        {type === 'note' && (
          <QuickNoteModal dateKey={dateKey} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function QuickNoteModal({ dateKey, onClose }) {
  const [text, setText] = useState('');
  const KEY = `ritual_quick_notes_${dateKey}`;
  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setText(s); }, [KEY]);
  const save = () => { localStorage.setItem(KEY, text); onClose(); };
  return (
    <div>
      <textarea
        style={{ width: '100%', background: '#1A1A1A', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, padding: 14, fontFamily: 'Inter, sans-serif', resize: 'none', outline: 'none', minHeight: 120 }}
        placeholder="Write a quick note for today…"
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={500}
        autoFocus
      />
      <button className="tv-modal-close-btn" style={{ marginTop: 12 }} onClick={save}>Save</button>
    </div>
  );
}

// ── Stack helpers ────────────────────────────────────────────────────────────
function playStackChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'triangle';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.4);
    });
  } catch(e) {}
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TodayView({
  habits, completions, intentions, notes, shields, isCompleted,
  onToggle, onSetIntention, onAddNote, onUseShield, currentUser,
  moods, water, sleep, gratitude, screenTime, screenGoal,
  onSetMood, onSetWater, onSetSleep, onSetGratitude, onSetScreenTime, onSetScreenGoal,
  stacks = [], onAddBonusXP, onNavigate,
}) {
  const today  = useMemo(() => new Date(), []);
  const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
  const dateKey = `${y}-${m}-${d}`;
  const hour    = today.getHours();

  // ── State ──
  const [intention, setIntention]           = useState(intentions[dateKey] || '');
  const [showConfetti, setShowConfetti]      = useState(false);
  const [notesHabit, setNotesHabit]          = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [showBreakdown, setShowBreakdown]    = useState(false);
  const [quickLogType, setQuickLogType]      = useState(null);
  const [longPressHabit, setLongPressHabit]  = useState(null);
  const [activeStack, setActiveStack]        = useState(null);
  const [stackComplete, setStackComplete]    = useState(false);
  const prevCompleted = useRef(null);
  const longPressTimer = useRef(null);

  useEffect(() => { setIntention(intentions[dateKey] || ''); }, [intentions, dateKey]);
  const handleIntentionBlur = () => onSetIntention(dateKey, intention);

  // ── Habit stats ──
  const scheduledToday = useMemo(
    () => habits.filter(h => !h.days || h.days.length === 7 || h.days.includes(today.getDay())),
    [habits, today]
  );
  const todayCompleted = useMemo(
    () => scheduledToday.filter(h => isCompleted(h.id, y, m, d)).length,
    [scheduledToday, isCompleted, y, m, d]
  );
  const todayPct = scheduledToday.length ? Math.round((todayCompleted / scheduledToday.length) * 100) : 0;
  const allDone  = scheduledToday.length > 0 && todayCompleted === scheduledToday.length;

  // Confetti on all-done
  useEffect(() => {
    if (prevCompleted.current === null) { prevCompleted.current = todayCompleted; return; }
    if (scheduledToday.length > 0 && todayCompleted === scheduledToday.length && prevCompleted.current < scheduledToday.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    prevCompleted.current = todayCompleted;
  }, [todayCompleted, scheduledToday.length]);

  const overallStreak = useMemo(() => getOverallStreak(habits, completions), [habits, completions]);
  const levelInfo     = useMemo(() => getLevelInfo(completions), [completions]);

  // ── Life score ──
  // Primary = habit %. Other logged components add a bonus (up to +15 each).
  const { lifeScore, scoreComponents } = useMemo(() => {
    const comps = [];
    const habitScore = scheduledToday.length > 0 ? todayPct : 0;
    comps.push({ label: 'Habits', icon: '✅', score: habitScore, color: '#FFFFFF' });

    const sleepEntry = sleep?.[dateKey];
    if (sleepEntry?.bedtime && sleepEntry?.wake) {
      const dur = calcSleepDuration(sleepEntry.bedtime, sleepEntry.wake);
      if (dur) {
        const s = Math.min(100, Math.round((dur.total / 8) * 100));
        comps.push({ label: 'Sleep', icon: '😴', score: s, color: 'rgba(255,255,255,0.75)' });
      }
    }
    const moodScore = moods?.[dateKey]?.score;
    if (moodScore) comps.push({ label: 'Mood', icon: '😊', score: Math.round((moodScore / 5) * 100), color: 'rgba(255,255,255,0.65)' });
    const wCount = water?.[dateKey] || 0;
    if (wCount > 0) comps.push({ label: 'Water', icon: '💧', score: Math.round((wCount / 8) * 100), color: '#FFFFFF' });

    // Weighted: habits = 60%, others split remaining 40%
    const otherComps = comps.filter(c => c.label !== 'Habits');
    let total;
    if (otherComps.length === 0) {
      total = habitScore;
    } else {
      const otherAvg = otherComps.reduce((a, c) => a + c.score, 0) / otherComps.length;
      total = Math.round(habitScore * 0.6 + otherAvg * 0.4);
    }
    return { lifeScore: total, scoreComponents: comps };
  }, [todayPct, scheduledToday.length, sleep, moods, water, dateKey]);

  // ── Quote ──
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];

  // ── Groups ──
  const grouped = useMemo(() => {
    const g = {};
    scheduledToday.forEach(h => {
      const key = getTimeGroup(h.reminderTime);
      if (!g[key]) g[key] = [];
      g[key].push(h);
    });
    return g;
  }, [scheduledToday]);

  const toggleGroup = useCallback((grp) => {
    setCollapsedGroups(p => ({ ...p, [grp]: !p[grp] }));
  }, []);

  // ── Weekly ──
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const dy = date.getFullYear(), dm = date.getMonth(), dd = date.getDate();
    const sched = habits.filter(h => !h.days || h.days.length === 7 || h.days.includes(date.getDay()));
    const done  = sched.filter(h => !!completions[`${h.id}|${dy}|${dm}|${dd}`]).length;
    const pct   = sched.length ? Math.round((done / sched.length) * 100) : 0;
    return { date, dd, dow: date.getDay(), isToday: i === 6, pct };
  }), [habits, completions]); // eslint-disable-line

  // ── Long press ──
  const handlePointerDown = useCallback((habit, e) => {
    if (e.button === 2) return; // right click
    longPressTimer.current = setTimeout(() => setLongPressHabit(habit), 500);
  }, []);
  const handlePointerUp   = useCallback(() => clearTimeout(longPressTimer.current), []);
  const handlePointerLeave= useCallback(() => clearTimeout(longPressTimer.current), []);

  // ── Weekly count (for weekly habits) ──
  const getWeeklyCount = (habit) => {
    const monday = getMondayOfWeek(today);
    let count = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      if (date > today) break;
      const ky = date.getFullYear(), km = date.getMonth(), kd = date.getDate();
      if (completions[`${habit.id}|${ky}|${km}|${kd}`]) count++;
    }
    return count;
  };

  // ── Stack handlers ──
  const startStack = (stack) => {
    const stackHabits = habits.filter(h => stack.habitIds?.includes(h.id));
    if (!stackHabits.length) return;
    setActiveStack({ stack, habits: stackHabits, currentIndex: 0 });
    setStackComplete(false);
  };
  const advanceStack = (didToggle) => {
    if (!activeStack) return;
    const { habits: sh, currentIndex } = activeStack;
    if (currentIndex >= sh.length - 1) {
      if (didToggle) { setStackComplete(true); playStackChime(); setTimeout(() => { setStackComplete(false); setActiveStack(null); }, 2000); }
      else setActiveStack(null);
    } else {
      setActiveStack(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    }
  };
  const handleStackCheck = () => { const h = activeStack?.habits[activeStack.currentIndex]; if (h) onToggle(h.id, y, m, d); advanceStack(true); };
  const handleStackSkip  = () => advanceStack(false);

  // ── Widget data helpers ──
  const todayMood      = moods?.[dateKey]?.score;
  const todayMoodEmoji = todayMood ? MOODS_LIST.find(x => x.score === todayMood)?.emoji : null;
  const todayWater     = water?.[dateKey] || 0;
  const todaySleep     = sleep?.[dateKey] || {};
  const sleepDur       = calcSleepDuration(todaySleep.bedtime, todaySleep.wake);
  const gratItems      = gratitude?.[dateKey] || ['', '', ''];
  const gratCount      = gratItems.filter(Boolean).length;
  const screenEntry    = screenTime?.[dateKey] || {};
  const screenHas      = screenEntry.actual !== undefined && screenEntry.actual !== '';

  const initials = currentUser
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : null;

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="today-view" style={{ minHeight: '100%', overflow: 'visible', paddingBottom: 'calc(100px + env(safe-area-inset-bottom, 0px))' }}>
      {showConfetti && <Confetti />}

      {/* Stack overlays */}
      {activeStack && !stackComplete && (
        <div className="stack-overlay">
          <div className="stack-overlay-inner">
            <div className="stack-progress-bar">
              <div className="stack-progress-fill" style={{ width: `${(activeStack.currentIndex / activeStack.habits.length) * 100}%` }} />
            </div>
            <div className="stack-step-label">{activeStack.currentIndex + 1} of {activeStack.habits.length}</div>
            <div className="stack-habit-display">
              <div className="stack-habit-icon">{activeStack.habits[activeStack.currentIndex]?.icon || '⭐'}</div>
              <div className="stack-habit-name">{activeStack.habits[activeStack.currentIndex]?.name}</div>
            </div>
            <button className="stack-check-btn" onClick={handleStackCheck}>✓ Done</button>
            <button className="stack-skip-btn"  onClick={handleStackSkip}>Skip</button>
            <button className="stack-close-btn" onClick={() => setActiveStack(null)}>✕</button>
          </div>
        </div>
      )}
      {stackComplete && (
        <div className="stack-overlay">
          <div className="stack-overlay-inner">
            <div className="stack-habit-display">
              <div className="stack-habit-icon">🎉</div>
              <div className="stack-habit-name">Stack Complete!</div>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="tv-header">
        <div className="tv-header-left">
          <h1 className="tv-greeting">{getGreeting(hour, currentUser?.name)}</h1>
          <p className="tv-date">{DAY_LONG[today.getDay()]}, {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="tv-header-right">
          <div className="tv-avatar">{initials || '👤'}</div>
        </div>
      </div>

      {/* ── LIFE SCORE RING ── */}
      <div className="tv-ring-section">
        <LifeScoreRing score={lifeScore} onClick={() => setShowBreakdown(true)} />
        <p className="tv-ring-hint">{todayCompleted}/{scheduledToday.length} habits · tap for breakdown</p>
      </div>

      {/* ── STAT PILLS ── */}
      <div className="tv-stat-pills">
        <div className="tv-stat-pill">
          <span className="tv-stat-icon">🔥</span>
          <span className="tv-stat-value">{overallStreak}</span>
          <span className="tv-stat-sub">streak</span>
        </div>
        <div className="tv-stat-pill">
          <span className="tv-stat-icon">⭐</span>
          <span className="tv-stat-value">Lv {levelInfo.level}</span>
          <span className="tv-stat-sub">{levelInfo.title}</span>
        </div>
        <div className="tv-stat-pill">
          <span className="tv-stat-icon">🛡️</span>
          <span className="tv-stat-value">{shields}</span>
          <span className="tv-stat-sub">shields</span>
        </div>
      </div>

      {/* ── DAILY WIDGETS ROW ── */}
      <div className="tv-widgets-scroll">
        {/* Mood */}
        <button className="tv-widget-card" onClick={() => setQuickLogType('mood')}>
          <span className="tv-widget-icon">😊</span>
          <span className="tv-widget-value">{todayMoodEmoji || '—'}</span>
          <span className="tv-widget-label">Mood</span>
          {!todayMoodEmoji && <span className="tv-widget-cta">Log</span>}
        </button>
        {/* Water */}
        <button className="tv-widget-card" onClick={() => setQuickLogType('water')}>
          <span className="tv-widget-icon">💧</span>
          <span className="tv-widget-value">{todayWater}<span style={{ fontSize: 13, color: '#888' }}>/8</span></span>
          <div className="tv-widget-bar">
            <div className="tv-widget-bar-fill" style={{ width: `${(todayWater / 8) * 100}%`, background: 'rgba(255,255,255,0.49)' }} />
          </div>
          <span className="tv-widget-label">Water</span>
        </button>
        {/* Sleep */}
        <button className="tv-widget-card" onClick={() => setQuickLogType('sleep')}>
          <span className="tv-widget-icon">😴</span>
          <span className="tv-widget-value" style={{ fontSize: sleepDur ? 16 : 20 }}>{sleepDur ? sleepDur.label : '—'}</span>
          <span className="tv-widget-label">Sleep</span>
          {!sleepDur && <span className="tv-widget-cta">Log</span>}
        </button>
        {/* Gratitude */}
        <button className="tv-widget-card" onClick={() => setQuickLogType('gratitude')}>
          <span className="tv-widget-icon">🙏</span>
          <span className="tv-widget-value">{gratCount}<span style={{ fontSize: 13, color: '#888' }}>/3</span></span>
          <div className="tv-widget-bar">
            <div className="tv-widget-bar-fill" style={{ width: `${(gratCount / 3) * 100}%`, background: 'rgba(255,255,255,0.65)' }} />
          </div>
          <span className="tv-widget-label">Gratitude</span>
        </button>
        {/* Screen Time */}
        <button className="tv-widget-card" onClick={() => setQuickLogType('screen')}>
          <span className="tv-widget-icon">📱</span>
          <span className="tv-widget-value" style={{ fontSize: 16 }}>{screenHas ? `${screenEntry.actual}h` : '—'}</span>
          <span className="tv-widget-label">Screen</span>
          {screenHas && <span className="tv-widget-cta" style={{ color: screenEntry.actual > (screenGoal || 3) ? '#FF5252' : 'rgba(255,255,255,0.75)' }}>
            {screenEntry.actual > (screenGoal || 3) ? 'Over' : 'Under'} goal
          </span>}
        </button>
      </div>

      {/* ── HABIT GROUPS ── */}
      <div className="tv-habits-section">
        {/* Stacks */}
        {stacks.length > 0 && (
          <div className="tv-stacks-row">
            {stacks.map(stack => {
              const sh = habits.filter(h => stack.habitIds?.includes(h.id));
              const done = sh.filter(h => isCompleted(h.id, y, m, d)).length;
              return (
                <button key={stack.id} className="tv-stack-chip" onClick={() => startStack(stack)}
                  style={{ borderLeft: `3px solid ${stack.color}` }}>
                  {stack.icon} {stack.name} · {done}/{sh.length}
                </button>
              );
            })}
          </div>
        )}

        {scheduledToday.length === 0 ? (
          <div className="tv-empty">
            {habits.length === 0
              ? '📋 Add habits in the sidebar to start tracking.'
              : 'No habits scheduled for today.'}
          </div>
        ) : (
          GROUP_ORDER.filter(g => grouped[g]?.length > 0).map(group => {
            const groupHabits   = grouped[group];
            const groupDone     = groupHabits.filter(h => isCompleted(h.id, y, m, d)).length;
            const isCollapsed   = !!collapsedGroups[group];
            const hasMultiple   = GROUP_ORDER.filter(g => grouped[g]?.length > 0).length > 1;

            return (
              <div key={group} className="tv-habit-group">
                {hasMultiple && (
                  <button className="tv-group-header" onClick={() => toggleGroup(group)}>
                    <span className="tv-group-icon">{GROUP_ICONS[group]}</span>
                    <span className="tv-group-name">{GROUP_LABELS[group]}</span>
                    <span className="tv-group-count">{groupDone}/{groupHabits.length}</span>
                    <span className={`tv-group-chevron ${isCollapsed ? 'collapsed' : ''}`}>›</span>
                  </button>
                )}

                <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="tv-habit-list">
                      {groupHabits.map(habit => {
                        const done     = isCompleted(habit.id, y, m, d);
                        const streak   = getCurrentStreak(habit.id, completions, habit);
                        const atRisk   = !done && isStreakAtRisk(habit.id, completions, habit);
                        const noteKey  = `${habit.id}|${y}|${m}|${d}`;
                        const hasNote  = !!notes?.[noteKey];
                        const weeklyCount = habit.frequency === 'weekly' && habit.frequencyTarget
                          ? getWeeklyCount(habit) : null;

                        return (
                          <motion.div
                            key={habit.id}
                            layout
                            className={`tv-habit-row ${done ? 'done' : ''} ${atRisk ? 'at-risk' : ''}`}
                            onPointerDown={e => handlePointerDown(habit, e)}
                            onPointerUp={handlePointerUp}
                            onPointerLeave={handlePointerLeave}
                          >
                            {/* Left: icon circle */}
                            <div
                              className="tv-habit-icon-circle"
                              style={{ background: done ? (habit.color || '#FFFFFF') : 'rgba(255,255,255,0.07)', color: done ? '#000' : (habit.color || '#FFFFFF') }}
                            >
                              {habit.icon || '⭐'}
                            </div>

                            {/* Center: name + schedule */}
                            <div className="tv-habit-info">
                              <span className={`tv-habit-name ${done ? 'done' : ''}`}>
                                {habit.name}
                                {habit.difficulty > 1 && <span style={{ marginLeft: 4, fontSize: 12 }}>{'🔥'.repeat(habit.difficulty)}</span>}
                              </span>
                              <DayPills days={habit.days} />
                              {weeklyCount !== null && (
                                <span className="tv-weekly-pill">{weeklyCount}/{habit.frequencyTarget} this week</span>
                              )}
                              {atRisk && <span className="tv-risk-label">⚠️ Streak at risk</span>}
                              {hasNote && <span className="tv-note-dot" title="Has note">📝</span>}
                            </div>

                            {/* Right: streak + checkbox */}
                            <div className="tv-habit-right">
                              {streak > 1 && (
                                <span className="tv-streak-badge">🔥 {streak}</span>
                              )}
                              {atRisk && shields > 0 && (
                                <button
                                  className="tv-shield-btn"
                                  onClick={e => { e.stopPropagation(); onUseShield(habit.id, y, m, d); }}
                                >🛡️</button>
                              )}
                              <button
                                className={`tv-check-btn ${done ? 'done' : ''}`}
                                style={done ? { background: habit.color || '#FFFFFF', borderColor: habit.color || '#FFFFFF' } : { borderColor: atRisk ? '#FF9F0A' : 'rgba(255,255,255,0.18)' }}
                                onClick={() => onToggle(habit.id, y, m, d)}
                              >
                                <AnimatePresence>
                                  {done && (
                                    <motion.svg
                                      key="check"
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                                      width="14" height="11" viewBox="0 0 14 11" fill="none"
                                    >
                                      <path d="M1 5.5L5.5 10L13 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </motion.svg>
                                  )}
                                </AnimatePresence>
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* ── DAILY QUOTE ── */}
      <div className="tv-quote-card">
        <p className="tv-quote-text">"{quote.text}"</p>
        <span className="tv-quote-author">— {quote.author}</span>
      </div>

      {/* ── INTENTION (collapsible, below quote) ── */}
      <div className="tv-intention-block">
        <label className="tv-intention-label">Today's intention</label>
        <textarea
          className="tv-intention-input"
          placeholder="What will you focus on today?"
          value={intention}
          onChange={e => setIntention(e.target.value)}
          onBlur={handleIntentionBlur}
          rows={2}
          maxLength={200}
        />
      </div>

      {/* bottom padding is handled by the root container paddingBottom */}

      {/* ── MODALS ── */}
      {showBreakdown && (
        <BreakdownModal
          components={scoreComponents}
          onClose={() => setShowBreakdown(false)}
        />
      )}

      {quickLogType && (
        <QuickLogModal
          type={quickLogType}
          dateKey={dateKey}
          moods={moods} water={water} sleep={sleep}
          gratitude={gratitude} screenTime={screenTime} screenGoal={screenGoal}
          onSetMood={onSetMood} onSetWater={onSetWater} onSetSleep={onSetSleep}
          onSetGratitude={onSetGratitude} onSetScreenTime={onSetScreenTime} onSetScreenGoal={onSetScreenGoal}
          onNavigate={onNavigate}
          onClose={() => setQuickLogType(null)}
        />
      )}

      {longPressHabit && (
        <HabitOptionsMenu
          habit={longPressHabit}
          onNote={setNotesHabit}
          onClose={() => setLongPressHabit(null)}
        />
      )}

      {notesHabit && (
        <NotesModal
          habit={notesHabit}
          dateLabel={today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          existingNote={notes?.[`${notesHabit.id}|${y}|${m}|${d}`] || ''}
          onSave={text => onAddNote(notesHabit.id, y, m, d, text)}
          onClose={() => setNotesHabit(null)}
        />
      )}
    </div>
  );
}
