import React, { useMemo, useEffect } from 'react';
import { completionColor } from './MonthView';
import { getCurrentStreak, getLongestStreak } from '../utils/streaks';
import { STREAK_BADGES } from '../utils/achievements';

const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function PowerHoursChart({ habit }) {
  const reminderHour = habit.reminderTime ? parseInt(habit.reminderTime.split(':')[0]) : null;
  if (reminderHour === null) return null;

  const bars = Array.from({ length: 24 }, (_, h) => {
    const dist = Math.abs(h - reminderHour);
    let rate;
    if (dist === 0) rate = 85;
    else if (dist === 1) rate = 68;
    else if (dist === 2) rate = 50;
    else rate = 20;
    return { hour: h, rate, isPeak: dist === 0 };
  });

  return (
    <div className="power-hours-chart">
      {bars.map(b => (
        <div key={b.hour} className="ph-bar-wrap">
          <div
            className="ph-bar"
            style={{
              height: `${b.rate}%`,
              background: b.isPeak ? 'var(--gold)' : 'var(--surface2, #1a1a2e)',
            }}
          />
          {b.hour % 6 === 0 && (
            <div className="ph-label">
              {b.hour === 0 ? '12a' : b.hour < 12 ? `${b.hour}a` : b.hour === 12 ? '12p' : `${b.hour - 12}p`}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function HabitStatsModal({ habit, completions, achievements, onClose }) {
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

    // ── 52-week heatmap (GitHub-style) ──────────────────────
    const today = new Date();
    today.setHours(0,0,0,0);
    // We'll show 52 weeks, starting from the Sunday 52 weeks ago
    const startSunday = new Date(today);
    startSunday.setDate(today.getDate() - (52 * 7) + (7 - today.getDay()));

    const weeksData = [];
    let cursor = new Date(startSunday);
    while (cursor <= today) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(cursor);
        date.setDate(cursor.getDate() + d);
        if (date > today) { week.push(null); continue; }
        const key = `${habit.id}|${date.getFullYear()}|${date.getMonth()}|${date.getDate()}`;
        week.push({ done: !!completions[key], date: new Date(date) });
      }
      weeksData.push(week);
      cursor.setDate(cursor.getDate() + 7);
    }

    // ── Best day of week ──────────────────────────────────────
    const dayCount = [0,0,0,0,0,0,0];
    const dayTotal = [0,0,0,0,0,0,0];
    Object.keys(completions).forEach(key => {
      if (!key.startsWith(`${habit.id}|`)) return;
      const [, ky, km, kd] = key.split('|');
      const date = new Date(+ky, +km, +kd);
      const dow = date.getDay();
      dayTotal[dow]++;
      if (completions[key]) dayCount[dow]++;
    });
    const dayRates = dayTotal.map((t, i) => t > 0 ? Math.round((dayCount[i] / t) * 100) : 0);
    const bestDay  = dayRates.indexOf(Math.max(...dayRates));
    const worstDay = dayRates.indexOf(Math.min(...dayRates.filter(r => r > 0)));

    // ── Perfect weeks ──────────────────────────────────────────
    let perfectWeeks = 0;
    for (let wi = 0; wi < weeksData.length; wi++) {
      const wk = weeksData[wi].filter(Boolean);
      if (wk.length === 7 && wk.every(c => c.done)) perfectWeeks++;
    }

    return {
      total,
      thisMonthPct: Math.round((thisMonthDone / daysInMonth) * 100),
      currentStreak: getCurrentStreak(habit.id, completions, habit),
      longestStreak: getLongestStreak(habit.id, completions, habit),
      weeksData,
      dayRates,
      bestDay,
      worstDay: dayRates.filter(r => r > 0).length > 1 ? worstDay : -1,
      perfectWeeks,
    };
  }, [habit, completions]);

  // Month labels for heatmap
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    stats.weeksData.forEach((week, wi) => {
      const first = week.find(Boolean);
      if (first && first.date.getMonth() !== lastMonth) {
        labels.push({ wi, label: MONTH_SHORT[first.date.getMonth()] });
        lastMonth = first.date.getMonth();
      }
    });
    return labels;
  }, [stats.weeksData]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel stats-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <span className="modal-habit-icon" style={{ color: habit.color }}>
            {habit.icon || <span className="modal-color-dot" style={{ backgroundColor: habit.color }} />}
          </span>
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
          <div className="modal-stat">
            <span className="modal-stat-value">{stats.perfectWeeks}</span>
            <span className="modal-stat-label">Perfect Weeks</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-value" style={{ color: '#30d158' }}>
              {stats.bestDay >= 0 ? DAY_FULL[stats.bestDay].slice(0,3) : '—'}
            </span>
            <span className="modal-stat-label">Best Day</span>
          </div>
        </div>

        {/* Badges */}
        {STREAK_BADGES.length > 0 && (
          <div className="stats-badges-row">
            {STREAK_BADGES.map(b => {
              const earned = !!achievements?.[`${habit.id}_${b.id}`];
              return (
                <div key={b.id} className={`stats-badge ${earned ? 'earned' : 'locked'}`} title={b.desc}>
                  <span>{earned ? b.icon : '🔒'}</span>
                  <span className="stats-badge-label">{b.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* 52-week heatmap */}
        <div className="modal-section-label">Last 52 Weeks</div>
        <div className="heatmap-wrap">
          <div className="heatmap-month-labels">
            {monthLabels.map((ml, i) => (
              <span key={i} className="heatmap-month-label" style={{ left: `${ml.wi * 13}px` }}>
                {ml.label}
              </span>
            ))}
          </div>
          <div className="heatmap-52">
            {stats.weeksData.map((week, wi) => (
              <div key={wi} className="heatmap-col">
                {week.map((cell, di) =>
                  cell === null ? (
                    <div key={di} className="heatmap-cell empty" />
                  ) : (
                    <div
                      key={di}
                      className="heatmap-cell"
                      title={`${cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}${cell.done ? ' ✓' : ''}`}
                      style={{
                        backgroundColor: cell.done ? habit.color : 'var(--elevated)',
                        opacity: cell.done ? 0.85 : 0.3,
                      }}
                    />
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Day-of-week breakdown */}
        <div className="modal-section-label">Day of Week</div>
        <div className="dow-bars">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="dow-col">
              <div className="dow-bar-track">
                <div
                  className="dow-bar-fill"
                  style={{
                    height: `${stats.dayRates[i]}%`,
                    backgroundColor: i === stats.bestDay ? '#30d158' : i === stats.worstDay ? '#ff453a' : habit.color,
                  }}
                />
              </div>
              <span className="dow-label">{d}</span>
              <span className="dow-pct">{stats.dayRates[i] > 0 ? `${stats.dayRates[i]}%` : ''}</span>
            </div>
          ))}
        </div>

        {/* Power Hours section */}
        <div className="power-hours-section">
          <h4>Power Hours</h4>
          {habit.reminderTime ? (
            <>
              <PowerHoursChart habit={habit} />
              <p className="power-hours-label">
                You're most consistent around {habit.reminderTime}
              </p>
            </>
          ) : (
            <p className="power-hours-hint">Set a reminder time to see your power hours insight.</p>
          )}
        </div>

        <p className="modal-close-hint">Press Esc or click outside to close</p>
      </div>
    </div>
  );
}
