import React, { useMemo, useEffect } from 'react';
import { completionColor } from './MonthView';
import { getCurrentStreak, getLongestStreak } from '../utils/streaks';

export default function HabitStatsModal({ habit, completions, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const stats = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear(), mo = now.getMonth();
    const daysInMonth = new Date(y, mo + 1, 0).getDate();

    let thisMonthDone = 0;
    for (let dd = 1; dd <= daysInMonth; dd++) {
      if (completions[`${habit.id}|${y}|${mo}|${dd}`]) thisMonthDone++;
    }

    const total = Object.keys(completions).filter(
      k => completions[k] && k.startsWith(`${habit.id}|`)
    ).length;

    // 15-week heatmap (cols = weeks, rows = days Sun-Sat)
    const weeks = [];
    const today = new Date();
    for (let w = 14; w >= 0; w--) {
      const week = [];
      for (let day = 6; day >= 0; day--) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + day));
        const key = `${habit.id}|${date.getFullYear()}|${date.getMonth()}|${date.getDate()}`;
        week.push({ done: !!completions[key], date });
      }
      weeks.push(week);
    }

    return {
      total,
      thisMonthPct: Math.round((thisMonthDone / daysInMonth) * 100),
      currentStreak: getCurrentStreak(habit.id, completions),
      longestStreak: getLongestStreak(habit.id, completions),
      weeks,
    };
  }, [habit, completions]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-color-dot" style={{ backgroundColor: habit.color }} />
          <h2 className="modal-habit-name">{habit.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Stats grid */}
        <div className="modal-stats-grid">
          <div className="modal-stat">
            <span className="modal-stat-value" style={{ color: completionColor(stats.thisMonthPct) }}>
              {stats.thisMonthPct}%
            </span>
            <span className="modal-stat-label">This Month</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-value">{stats.total}</span>
            <span className="modal-stat-label">Total Days</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-value" style={{ color: stats.currentStreak > 0 ? '#ff9f0a' : 'var(--t1)' }}>
              {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}` : stats.currentStreak}
            </span>
            <span className="modal-stat-label">Current Streak</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-value">{stats.longestStreak}</span>
            <span className="modal-stat-label">Best Streak</span>
          </div>
        </div>

        {/* 15-week heatmap */}
        <div className="modal-section-label">Last 15 Weeks</div>
        <div className="modal-heatmap">
          {stats.weeks.map((week, wi) => (
            <div key={wi} className="heatmap-col">
              {week.map((cell, di) => (
                <div
                  key={di}
                  className="heatmap-cell"
                  title={cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  style={{
                    backgroundColor: cell.done ? habit.color : 'var(--elevated)',
                    opacity: cell.done ? 0.85 : 0.35,
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        <p className="modal-close-hint">Press Esc or click outside to close</p>
      </div>
    </div>
  );
}
