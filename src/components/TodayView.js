import React, { useState, useEffect, useMemo, useRef } from 'react';
import { completionColor } from './MonthView';
import { getCurrentStreak, getOverallStreak, isStreakAtRisk } from '../utils/streaks';
import { getLevelInfo } from '../utils/achievements';
import Confetti from './Confetti';
import NotesModal from './NotesModal';

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

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LONG  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function getGreeting(hour, name) {
  if (hour >= 5  && hour < 12) return `Good morning${name ? `, ${name.split(' ')[0]}` : ''}.`;
  if (hour >= 12 && hour < 17) return `Good afternoon${name ? `, ${name.split(' ')[0]}` : ''}.`;
  if (hour >= 17 && hour < 21) return `Good evening${name ? `, ${name.split(' ')[0]}` : ''}.`;
  return `Still up${name ? `, ${name.split(' ')[0]}` : ''}?`;
}

function getTimeGroup(reminderTime) {
  if (!reminderTime) return 'anytime';
  const h = parseInt(reminderTime.split(':')[0], 10);
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  return 'evening';
}

const GROUP_ORDER  = ['morning', 'afternoon', 'evening', 'anytime'];
const GROUP_LABELS = { morning: '🌅 Morning', afternoon: '☀️ Afternoon', evening: '🌙 Evening', anytime: '⭐ Habits' };

function ProgressRing({ pct, size = 144, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  const color  = pct >= 80 ? '#30d158' : pct >= 50 ? '#ff9f0a' : pct > 0 ? '#ff453a' : 'rgba(255,255,255,0.12)';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={radius}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease' }}
      />
    </svg>
  );
}

export default function TodayView({
  habits, completions, intentions, notes, shields, isCompleted,
  onToggle, onSetIntention, onAddNote, onUseShield, currentUser,
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const today = useMemo(() => new Date(), []);
  const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
  const dateKey = `${y}-${m}-${d}`;
  const hour = today.getHours();

  const [intention, setIntention] = useState(intentions[dateKey] || '');
  const [showConfetti, setShowConfetti] = useState(false);
  const [notesHabit, setNotesHabit] = useState(null);
  const prevCompleted = useRef(null);

  useEffect(() => { setIntention(intentions[dateKey] || ''); }, [intentions, dateKey]);

  const handleIntentionBlur = () => onSetIntention(dateKey, intention);

  // ── Today stats ───────────────────────────────────────────────
  const scheduledToday = useMemo(
    () => habits.filter(h => !h.days || h.days.length === 7 || h.days.includes(today.getDay())),
    [habits, today]
  );

  const todayCompleted = useMemo(
    () => scheduledToday.filter(h => isCompleted(h.id, y, m, d)).length,
    [scheduledToday, isCompleted, y, m, d]
  );

  const todayPct  = scheduledToday.length ? Math.round((todayCompleted / scheduledToday.length) * 100) : 0;
  const allDone   = scheduledToday.length > 0 && todayCompleted === scheduledToday.length;

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

  // Daily quote
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const quote     = QUOTES[dayOfYear % QUOTES.length];

  // Last 7 days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const dy = date.getFullYear(), dm = date.getMonth(), dd = date.getDate();
      const sched = habits.filter(h => !h.days || h.days.length === 7 || h.days.includes(date.getDay()));
      const done  = sched.filter(h => !!completions[`${h.id}|${dy}|${dm}|${dd}`]).length;
      const pct   = sched.length ? Math.round((done / sched.length) * 100) : 0;
      return { date, dd, dow: date.getDay(), isToday: i === 6, pct };
    });
  }, [habits, completions]); // eslint-disable-line

  // Group habits by time-of-day
  const grouped = useMemo(() => {
    const groups = {};
    scheduledToday.forEach(h => {
      const g = getTimeGroup(h.reminderTime);
      if (!groups[g]) groups[g] = [];
      groups[g].push(h);
    });
    return groups;
  }, [scheduledToday]);

  const hasMultipleGroups = useMemo(
    () => Object.keys(grouped).filter(k => grouped[k]?.length > 0).length > 1,
    [grouped]
  );

  return (
    <div className="today-view">
      {showConfetti && <Confetti />}

      {/* ── Greeting ── */}
      <div className="today-greeting">
        <span className="greeting-text">{getGreeting(hour, currentUser?.name)}</span>
        <span className="greeting-date">
          {DAY_LONG[today.getDay()]}, {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* ── Level bar ── */}
      <div className="level-strip">
        <span className="level-strip-badge">Lv {levelInfo.level}</span>
        <div className="level-strip-bar">
          <div className="level-strip-fill" style={{ width: `${levelInfo.progress}%` }} />
        </div>
        <span className="level-strip-title">{levelInfo.title}</span>
        {levelInfo.nextXp && (
          <span className="level-strip-next">{levelInfo.nextXp - levelInfo.xp} XP to {levelInfo.nextTitle}</span>
        )}
      </div>

      {/* ── Top: ring + intention ── */}
      <div className="today-top">
        <div className="today-ring-block">
          <div className="today-ring-wrap">
            <ProgressRing pct={todayPct} />
            <div className="today-ring-inner">
              <span className="today-ring-pct">{todayPct}<span className="today-ring-symbol">%</span></span>
              <span className="today-ring-label">today</span>
            </div>
          </div>
          <div className="today-meta">
            {overallStreak > 0 && (
              <div className="streak-badge">
                <span className="streak-fire">🔥</span>
                <span className="streak-num">{overallStreak}</span>
                <span className="streak-label">day streak</span>
              </div>
            )}
            {shields > 0 && (
              <div className="shield-count-badge" title="Streak shields available">
                🛡️ {shields} {shields === 1 ? 'shield' : 'shields'}
              </div>
            )}
            {allDone && (
              <div className="all-done-badge">All habits complete ✓</div>
            )}
          </div>
        </div>

        <div className="today-right">
          <label className="intention-label">Today's intention</label>
          <textarea
            className="intention-input"
            placeholder="What will you focus on today?"
            value={intention}
            onChange={e => setIntention(e.target.value)}
            onBlur={handleIntentionBlur}
            rows={3}
            maxLength={200}
          />
          <div className="quote-block">
            <p className="quote-text">"{quote.text}"</p>
            <p className="quote-author">— {quote.author}</p>
          </div>
        </div>
      </div>

      {/* ── Weekly strip ── */}
      <div className="weekly-strip">
        <div className="weekly-strip-label">This Week</div>
        <div className="weekly-bars">
          {weekDays.map((day, i) => (
            <div key={i} className={`week-col ${day.isToday ? 'week-today' : ''}`}>
              <span className="week-day-name">{DAY_SHORT[day.dow]}</span>
              <div className="week-bar-track">
                <div
                  className="week-bar-fill"
                  style={{
                    height: `${day.pct}%`,
                    backgroundColor: day.pct > 0 ? completionColor(day.pct) : 'transparent',
                    minHeight: day.pct > 0 ? '3px' : '0',
                  }}
                />
              </div>
              <span className="week-day-num">{day.dd}</span>
              {day.pct > 0 && (
                <span className="week-day-pct" style={{ color: completionColor(day.pct) }}>
                  {day.pct}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Habit checklist ── */}
      <div className="today-habits">
        <div className="today-habits-header">
          <span className="today-habits-title">Habits</span>
          <span className="today-habits-count">
            <span style={{ color: todayPct >= 80 ? '#30d158' : 'var(--t1)' }}>{todayCompleted}</span>
            <span style={{ color: 'var(--t3)' }}>/{scheduledToday.length}</span>
          </span>
        </div>

        {scheduledToday.length === 0 ? (
          <div className="today-empty">
            {habits.length === 0
              ? 'Add habits in the sidebar to start tracking.'
              : 'No habits scheduled for today.'}
          </div>
        ) : (
          GROUP_ORDER.filter(g => grouped[g]?.length > 0).map(group => (
            <div key={group} className="habit-group">
              {hasMultipleGroups && (
                <div className="habit-group-label">{GROUP_LABELS[group]}</div>
              )}
              <div className="habit-checklist">
                {grouped[group].map(habit => {
                  const done       = isCompleted(habit.id, y, m, d);
                  const streak     = getCurrentStreak(habit.id, completions, habit);
                  const atRisk     = !done && isStreakAtRisk(habit.id, completions, habit);
                  const noteKey    = `${habit.id}|${y}|${m}|${d}`;
                  const hasNote    = !!notes?.[noteKey];

                  return (
                    <div
                      key={habit.id}
                      className={`checklist-item ${done ? 'checked' : ''} ${atRisk ? 'at-risk' : ''}`}
                      onClick={() => onToggle(habit.id, y, m, d)}
                    >
                      <div
                        className="check-circle"
                        style={{
                          borderColor:     done ? habit.color : atRisk ? '#ff9f0a' : 'rgba(255,255,255,0.14)',
                          backgroundColor: done ? habit.color : 'transparent',
                        }}
                      >
                        {done && (
                          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                            <path d="M1 4.5L4 7.5L10 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      <span className="checklist-habit-icon" style={{ color: habit.color }}>
                        {habit.icon || ''}
                      </span>

                      <div className="checklist-name-block">
                        <span
                          className="checklist-name"
                          style={{
                            opacity:        done ? 0.45 : 1,
                            textDecoration: done ? 'line-through' : 'none',
                          }}
                        >
                          {habit.name}
                        </span>
                        {atRisk && !done && (
                          <span className="streak-risk-label">Streak at risk!</span>
                        )}
                      </div>

                      {streak > 1 && (
                        <span className="checklist-streak">🔥 {streak}</span>
                      )}

                      {/* Note button */}
                      <button
                        className={`note-btn ${hasNote ? 'has-note' : ''}`}
                        title={hasNote ? 'Edit note' : 'Add note'}
                        onClick={e => { e.stopPropagation(); setNotesHabit(habit); }}
                      >
                        {hasNote ? '📝' : '✎'}
                      </button>

                      {/* Shield button (only if at risk and shields available) */}
                      {atRisk && shields > 0 && (
                        <button
                          className="shield-btn"
                          title={`Use shield to protect streak (${shields} left)`}
                          onClick={e => { e.stopPropagation(); onUseShield(habit.id, y, m, d); }}
                        >
                          🛡️
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notes modal */}
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
