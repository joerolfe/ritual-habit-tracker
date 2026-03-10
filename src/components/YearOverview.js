import React, { useMemo } from 'react';
import { completionColor } from './MonthView';

const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function MonthCard({ name, shortName, month, year, pct, habits, isCompleted, isCurrentMonth, onClick }) {
  const days = getDaysInMonth(year, month);
  const daysArr = useMemo(() => Array.from({ length: days }, (_, i) => i + 1), [days]);
  const displayHabits = habits.slice(0, 5);

  return (
    <div
      className={`month-card ${isCurrentMonth ? 'current' : ''}`}
      onClick={onClick}
      title={`Open ${name}`}
    >
      <div className="month-card-header">
        <span className="month-card-name">{shortName}</span>
        <span className="month-card-pct" style={{ color: completionColor(pct) }}>
          {pct}%
        </span>
      </div>

      <div className="mini-heatmap">
        {displayHabits.length > 0 ? (
          displayHabits.map(habit => (
            <div key={habit.id} className="mini-row">
              {daysArr.map(day => {
                const done = isCompleted(habit.id, year, month, day);
                return (
                  <div
                    key={day}
                    className="mini-dot"
                    style={{
                      backgroundColor: done ? 'var(--accent)' : 'var(--elevated)',
                      opacity: done ? 0.85 : 0.35,
                    }}
                  />
                );
              })}
            </div>
          ))
        ) : (
          <div className="mini-empty">No habits</div>
        )}
      </div>

      <div className="month-card-bar-track">
        <div
          className="month-card-bar-fill"
          style={{ width: `${pct}%`, backgroundColor: completionColor(pct) }}
        />
      </div>
    </div>
  );
}

export default function YearOverview({ habits, year, isCompleted, onYearChange, onSelectMonth }) {
  const today = new Date();

  const monthlyStats = useMemo(() => {
    return MONTH_FULL.map((_, month) => {
      if (!habits.length) return 0;
      const days = getDaysInMonth(year, month);
      const daysArr = Array.from({ length: days }, (_, i) => i + 1);
      let completed = 0;
      daysArr.forEach(day => habits.forEach(h => {
        if (isCompleted(h.id, year, month, day)) completed++;
      }));
      return Math.round((completed / (habits.length * days)) * 100);
    });
  }, [habits, year, isCompleted]);

  const yearlyPct = useMemo(
    () => Math.round(monthlyStats.reduce((a, b) => a + b, 0) / 12),
    [monthlyStats]
  );

  const bestMonth = useMemo(() => {
    let best = 0;
    monthlyStats.forEach((pct, i) => { if (pct > monthlyStats[best]) best = i; });
    return monthlyStats[best] > 0 ? best : null;
  }, [monthlyStats]);

  return (
    <div className="year-overview">
      <div className="year-header">
        <button className="nav-btn" onClick={() => onYearChange(y => y - 1)} title="Previous year">‹</button>
        <div className="year-title-block">
          <div className="year-title">{year}</div>
          <div className="year-subtitle">
            <span
              className="year-pct-badge"
              style={{ color: completionColor(yearlyPct) }}
            >
              {yearlyPct}% yearly avg
            </span>
          </div>
        </div>
        <button className="nav-btn" onClick={() => onYearChange(y => y + 1)} title="Next year">›</button>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${yearlyPct}%`, backgroundColor: completionColor(yearlyPct) }}
        />
      </div>

      {habits.length > 0 && (
        <div className="year-stats-row">
          <div className="year-stat">
            <span className="year-stat-label">Best Month</span>
            <span className="year-stat-value" style={{ color: 'var(--t1)' }}>
              {bestMonth !== null ? MONTH_SHORT[bestMonth] : '—'}
            </span>
          </div>
          <div className="year-stat">
            <span className="year-stat-label">Habits</span>
            <span className="year-stat-value" style={{ color: 'var(--t1)' }}>
              {habits.length}
            </span>
          </div>
          <div className="year-stat">
            <span className="year-stat-label">Year Avg</span>
            <span className="year-stat-value" style={{ color: completionColor(yearlyPct) }}>
              {yearlyPct}%
            </span>
          </div>
        </div>
      )}

      <div className="year-grid">
        {MONTH_FULL.map((name, month) => (
          <MonthCard
            key={month}
            name={name}
            shortName={MONTH_SHORT[month]}
            month={month}
            year={year}
            pct={monthlyStats[month]}
            habits={habits}
            isCompleted={isCompleted}
            isCurrentMonth={today.getFullYear() === year && today.getMonth() === month}
            onClick={() => onSelectMonth(month)}
          />
        ))}
      </div>
    </div>
  );
}
