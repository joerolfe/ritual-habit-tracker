import React, { useState, useEffect, useMemo, useRef } from 'react';
import { completionColor } from './MonthView';
import { getCurrentStreak, getOverallStreak } from '../utils/streaks';
import Confetti from './Confetti';

const QUOTES = [
  { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { text: "You don't rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Motivation gets you started. Habit keeps you going.", author: "Jim Ryun" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
  { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { text: "A year from now you'll wish you had started today.", author: "Karen Lamb" },
  { text: "It's not about perfect. It's about effort. Every day.", author: "Jillian Michaels" },
  { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock. Do what it does. Keep going.", author: "Sam Levenson" },
  { text: "You are what you do, not what you say you'll do.", author: "Carl Jung" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Great things never came from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
];

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ProgressRing({ pct, size = 144, stroke = 10 }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color = pct >= 80 ? '#30d158' : pct >= 50 ? '#ff9f0a' : pct > 0 ? '#ff453a' : 'rgba(255,255,255,0.12)';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease' }}
      />
    </svg>
  );
}

export default function TodayView({ habits, completions, intentions, isCompleted, onToggle, onSetIntention }) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  const dateKey = `${y}-${m}-${d}`;

  const [intention, setIntention] = useState(intentions[dateKey] || '');
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCompleted = useRef(null);

  useEffect(() => { setIntention(intentions[dateKey] || ''); }, [intentions, dateKey]);

  const handleIntentionBlur = () => onSetIntention(dateKey, intention);

  const todayCompleted = useMemo(
    () => habits.filter(h => isCompleted(h.id, y, m, d)).length,
    [habits, isCompleted, y, m, d]
  );
  const todayPct = habits.length ? Math.round((todayCompleted / habits.length) * 100) : 0;
  const allDone = habits.length > 0 && todayCompleted === habits.length;

  // Confetti on completion
  useEffect(() => {
    if (prevCompleted.current === null) { prevCompleted.current = todayCompleted; return; }
    if (habits.length > 0 && todayCompleted === habits.length && prevCompleted.current < habits.length) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
    prevCompleted.current = todayCompleted;
  }, [todayCompleted, habits.length]);

  const overallStreak = useMemo(() => getOverallStreak(habits, completions), [habits, completions]);

  // Daily quote — rotates by day of year
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const quote = QUOTES[dayOfYear % QUOTES.length];

  // Last 7 days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const dy = date.getFullYear(), dm = date.getMonth(), dd = date.getDate();
      const completed = habits.filter(h => !!completions[`${h.id}|${dy}|${dm}|${dd}`]).length;
      const pct = habits.length ? Math.round((completed / habits.length) * 100) : 0;
      return { date, dd, dow: date.getDay(), isToday: i === 6, pct };
    });
  }, [habits, completions]); // eslint-disable-line

  return (
    <div className="today-view">
      {showConfetti && <Confetti />}

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
                <span className="streak-label">{overallStreak === 1 ? 'day streak' : 'day streak'}</span>
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
            <span style={{ color: 'var(--t3)' }}>/{habits.length}</span>
          </span>
        </div>

        {habits.length === 0 ? (
          <div className="today-empty">Add habits in the sidebar to start tracking.</div>
        ) : (
          <div className="habit-checklist">
            {habits.map(habit => {
              const done = isCompleted(habit.id, y, m, d);
              const streak = getCurrentStreak(habit.id, completions);
              return (
                <div
                  key={habit.id}
                  className={`checklist-item ${done ? 'checked' : ''}`}
                  onClick={() => onToggle(habit.id, y, m, d)}
                >
                  <div
                    className="check-circle"
                    style={{
                      borderColor: done ? habit.color : 'rgba(255,255,255,0.14)',
                      backgroundColor: done ? habit.color : 'transparent',
                    }}
                  >
                    {done && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4.5L4 7.5L10 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  <div className="checklist-name-block">
                    <span className="checklist-name" style={{ opacity: done ? 0.45 : 1, textDecoration: done ? 'line-through' : 'none' }}>
                      {habit.name}
                    </span>
                  </div>

                  {streak > 1 && (
                    <span className="checklist-streak">🔥 {streak}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
