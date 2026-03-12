import React, { useMemo } from 'react';
import { MOODS } from './MoodWidget';

function getMonthStats(habits, completions, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let total = 0, done = 0, perfectDays = 0;
  let topHabit = null, topCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    if (date > new Date()) break;
    const sched = habits.filter(h => !h.days || h.days.length === 7 || h.days.includes(date.getDay()));
    const dayDone = sched.filter(h => !!completions[`${h.id}|${year}|${month}|${d}`]).length;
    total += sched.length;
    done += dayDone;
    if (sched.length > 0 && dayDone === sched.length) perfectDays++;
  }

  // top habit
  habits.forEach(h => {
    let cnt = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (completions[`${h.id}|${year}|${month}|${d}`]) cnt++;
    }
    if (cnt > topCount) { topCount = cnt; topHabit = h; }
  });

  return { pct: total ? Math.round((done / total) * 100) : 0, done, total, perfectDays, topHabit };
}

function getWeeklyTrend(habits, completions) {
  const today = new Date();
  const weeks = [];
  for (let w = 7; w >= 0; w--) {
    let total = 0, done = 0;
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7 + d));
      if (date > today) continue;
      const y = date.getFullYear(), m = date.getMonth(), dd = date.getDate();
      const sched = habits.filter(h => !h.days || h.days.length === 7 || h.days.includes(date.getDay()));
      const dayDone = sched.filter(h => !!completions[`${h.id}|${y}|${m}|${dd}`]).length;
      total += sched.length;
      done += dayDone;
    }
    const pct = total ? Math.round((done / total) * 100) : 0;
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() - (w * 7));
    weeks.push({ pct, label: `W${weeks.length + 1}`, weekEnd });
  }
  return weeks;
}

function getHabitPerformance(habits, completions) {
  const today = new Date();
  return habits.map(h => {
    let total = 0, done = 0;
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      if (!h.days || h.days.length === 7 || h.days.includes(date.getDay())) {
        total++;
        const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
        if (completions[`${h.id}|${y}|${m}|${d}`]) done++;
      }
    }
    return { habit: h, pct: total ? Math.round((done / total) * 100) : 0, done, total };
  }).sort((a, b) => b.pct - a.pct);
}

function getMoodCorrelation(moods, habits, completions) {
  const today = new Date();
  const byMood = {};
  MOODS.forEach(m => { byMood[m.score] = { total: 0, done: 0, count: 0 }; });

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
    const key = `${y}-${m}-${d}`;
    const moodEntry = moods[key];
    if (!moodEntry) continue;
    const score = moodEntry.score;
    if (!byMood[score]) continue;
    const sched = habits.filter(h => !h.days || h.days.length === 7 || h.days.includes(date.getDay()));
    const dayDone = sched.filter(h => !!completions[`${h.id}|${y}|${m}|${d}`]).length;
    byMood[score].total += sched.length;
    byMood[score].done += dayDone;
    byMood[score].count++;
  }

  return MOODS.map(mood => ({
    ...mood,
    avgPct: byMood[mood.score].total ? Math.round((byMood[mood.score].done / byMood[mood.score].total) * 100) : null,
    days: byMood[mood.score].count,
  })).filter(m => m.avgPct !== null);
}

export default function InsightsView({ habits, completions, moods, water, sleep }) {
  const today = new Date();
  const year = today.getFullYear(), month = today.getMonth();

  const monthStats = useMemo(() => getMonthStats(habits, completions, year, month), [habits, completions, year, month]);
  const weeklyTrend = useMemo(() => getWeeklyTrend(habits, completions), [habits, completions]);
  const habitPerf = useMemo(() => getHabitPerformance(habits, completions), [habits, completions]);
  const moodCorr = useMemo(() => getMoodCorrelation(moods, habits, completions), [moods, habits, completions]);

  const topPerformer = habitPerf[0];
  const needsAttention = habitPerf[habitPerf.length - 1];
  const maxWeekPct = Math.max(...weeklyTrend.map(w => w.pct), 1);

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div className="insights-view">
      <div className="insights-header">
        <h2 className="insights-title">Insights</h2>
        <span className="insights-period">{MONTH_NAMES[month]} {year}</span>
      </div>

      {/* Monthly report card */}
      <div className="insights-report-card">
        <div className="report-card-stat">
          <span className="report-stat-value" style={{ color: monthStats.pct >= 80 ? 'var(--green)' : monthStats.pct >= 50 ? 'var(--orange)' : 'var(--red)' }}>
            {monthStats.pct}%
          </span>
          <span className="report-stat-label">Completion</span>
        </div>
        <div className="report-card-stat">
          <span className="report-stat-value" style={{ color: 'var(--green)' }}>{monthStats.done}</span>
          <span className="report-stat-label">Total done</span>
        </div>
        <div className="report-card-stat">
          <span className="report-stat-value" style={{ color: 'var(--orange)' }}>{monthStats.perfectDays}</span>
          <span className="report-stat-label">Perfect days</span>
        </div>
        {monthStats.topHabit && (
          <div className="report-card-stat">
            <span className="report-stat-value">{monthStats.topHabit.icon}</span>
            <span className="report-stat-label">Top habit</span>
          </div>
        )}
      </div>

      {/* 8-week trend */}
      <div className="insights-section">
        <h3 className="insights-section-title">8-Week Trend</h3>
        <div className="trend-chart">
          {weeklyTrend.map((w, i) => (
            <div key={i} className="trend-bar-col">
              <span className="trend-bar-pct">{w.pct > 0 ? `${w.pct}%` : ''}</span>
              <div className="trend-bar-track">
                <div
                  className="trend-bar-fill"
                  style={{
                    height: `${(w.pct / maxWeekPct) * 100}%`,
                    backgroundColor: w.pct >= 80 ? 'var(--green)' : w.pct >= 50 ? 'var(--orange)' : w.pct > 0 ? 'var(--red)' : 'var(--elevated)',
                    minHeight: w.pct > 0 ? '4px' : '2px',
                  }}
                />
              </div>
              <span className="trend-bar-label">{w.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-habit performance */}
      {habitPerf.length > 0 && (
        <div className="insights-section">
          <h3 className="insights-section-title">Habit Performance (30 days)</h3>
          <div className="habit-perf-list">
            {habitPerf.map(({ habit, pct, done, total }) => (
              <div key={habit.id} className="habit-perf-row">
                <span className="habit-perf-icon">{habit.icon}</span>
                <div className="habit-perf-info">
                  <div className="habit-perf-name-row">
                    <span className="habit-perf-name">{habit.name}</span>
                    <span className="habit-perf-pct" style={{ color: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--orange)' : 'var(--red)' }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="habit-perf-bar-track">
                    <div className="habit-perf-bar-fill" style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--orange)' : 'var(--red)',
                    }} />
                  </div>
                  <span className="habit-perf-count">{done}/{total} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood correlation */}
      {moodCorr.length > 0 && (
        <div className="insights-section">
          <h3 className="insights-section-title">Mood & Habit Correlation</h3>
          <div className="mood-corr-list">
            {moodCorr.map(m => (
              <div key={m.score} className="mood-corr-row">
                <span className="mood-corr-emoji">{m.emoji}</span>
                <span className="mood-corr-label">{m.label}</span>
                <div className="mood-corr-bar-track">
                  <div className="mood-corr-bar-fill" style={{
                    width: `${m.avgPct}%`,
                    backgroundColor: m.avgPct >= 80 ? 'var(--green)' : m.avgPct >= 50 ? 'var(--orange)' : 'var(--red)',
                  }} />
                </div>
                <span className="mood-corr-pct">{m.avgPct}%</span>
                <span className="mood-corr-days">({m.days}d)</span>
              </div>
            ))}
          </div>
          <p className="mood-corr-note">Avg habit completion % on days with each mood</p>
        </div>
      )}

      {/* Insight cards */}
      <div className="insights-section">
        <h3 className="insights-section-title">Insights</h3>
        <div className="insight-cards">
          {topPerformer && topPerformer.pct > 0 && (
            <div className="insight-card green">
              <span className="insight-card-icon">🏆</span>
              <div>
                <span className="insight-card-title">Top Performer</span>
                <p className="insight-card-body">{topPerformer.habit.icon} {topPerformer.habit.name} — {topPerformer.pct}% in last 30 days</p>
              </div>
            </div>
          )}
          {needsAttention && needsAttention !== topPerformer && needsAttention.pct < 60 && (
            <div className="insight-card orange">
              <span className="insight-card-icon">⚠️</span>
              <div>
                <span className="insight-card-title">Needs Attention</span>
                <p className="insight-card-body">{needsAttention.habit.icon} {needsAttention.habit.name} — only {needsAttention.pct}% in last 30 days</p>
              </div>
            </div>
          )}
          <div className="insight-card">
            <span className="insight-card-icon">📊</span>
            <div>
              <span className="insight-card-title">Monthly Summary</span>
              <p className="insight-card-body">
                {monthStats.pct >= 80 ? 'Outstanding month! ' : monthStats.pct >= 50 ? 'Good progress this month. ' : 'Room to grow. '}
                {monthStats.perfectDays} perfect day{monthStats.perfectDays !== 1 ? 's' : ''} in {MONTH_NAMES[month]}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
