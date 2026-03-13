import React, { useMemo } from 'react';
import { MOODS } from './MoodWidget';

// ── Schedule Optimizer ────────────────────────────────────────────────────────

function getScheduleOptimizer(habits, completions) {
  const today = new Date();
  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // For each habit, compute per-weekday completion rates over last 90 days
  const results = habits.map(h => {
    // weekday buckets: index 0=Sun ... 6=Sat
    const scheduled = Array(7).fill(0);
    const done      = Array(7).fill(0);

    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      if (date > today) continue;
      const dow = date.getDay();
      const isScheduled = !h.days || h.days.length === 7 || h.days.includes(dow);
      if (!isScheduled) continue;
      const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
      scheduled[dow]++;
      if (completions[`${h.id}|${y}|${m}|${d}`]) done[dow]++;
    }

    const totalScheduled = scheduled.reduce((a, b) => a + b, 0);
    if (totalScheduled < 14) return null;

    const rates = scheduled.map((s, i) => s > 0 ? done[i] / s : null);

    // best days: rate >= 0.70
    const FULL_DAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const bestDays = FULL_DAY.filter((_, i) => rates[i] !== null && rates[i] >= 0.70);
    // skip-prone days: rate <= 0.30
    const skipDays = FULL_DAY.filter((_, i) => rates[i] !== null && rates[i] <= 0.30);

    return { habit: h, rates, totalScheduled, bestDays, skipDays, dayLabels: DAY_LABELS };
  }).filter(Boolean);

  // Sort by most data, show top 5
  return results
    .sort((a, b) => b.totalScheduled - a.totalScheduled)
    .slice(0, 5);
}

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

// ── Smart insights helpers ────────────────────────────────────────────────────

function getBestStreak(habits, completions) {
  if (!habits.length) return 0;
  const today = new Date();
  let best = 0;
  habits.forEach(h => {
    let streak = 0, maxStreak = 0;
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
      if (completions[`${h.id}|${y}|${m}|${d}`]) {
        streak++;
        if (streak > maxStreak) maxStreak = streak;
      } else {
        streak = 0;
      }
    }
    if (maxStreak > best) best = maxStreak;
  });
  return best;
}

function getWeekdayVsWeekend(habits, completions) {
  const today = new Date();
  let wdTotal = 0, wdDone = 0, weTotal = 0, weDone = 0;
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
    const sched = habits.filter(h => !h.days || h.days.length === 7 || h.days.includes(date.getDay()));
    const dayDone = sched.filter(h => !!completions[`${h.id}|${y}|${m}|${d}`]).length;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    if (isWeekend) { weTotal += sched.length; weDone += dayDone; }
    else           { wdTotal += sched.length; wdDone += dayDone; }
  }
  const wdPct = wdTotal ? Math.round((wdDone / wdTotal) * 100) : null;
  const wePct = weTotal ? Math.round((weDone / weTotal) * 100) : null;
  return { wdPct, wePct };
}

function getSleepHabitCorrelation(habits, completions, sleep) {
  if (!sleep) return null;
  const today = new Date();
  let sleepTotal = 0, sleepDone = 0, noSleepTotal = 0, noSleepDone = 0;
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
    const key = `${y}-${m}-${d}`;
    const sleepEntry = sleep[key];
    const sched = habits.filter(h => !h.days || h.days.length === 7 || h.days.includes(date.getDay()));
    const dayDone = sched.filter(h => !!completions[`${h.id}|${y}|${m}|${d}`]).length;
    if (sleepEntry?.hours >= 7) { sleepTotal += sched.length; sleepDone += dayDone; }
    else if (sched.length > 0)  { noSleepTotal += sched.length; noSleepDone += dayDone; }
  }
  const withSleep    = sleepTotal    ? Math.round((sleepDone    / sleepTotal)    * 100) : null;
  const withoutSleep = noSleepTotal  ? Math.round((noSleepDone  / noSleepTotal)  * 100) : null;
  return { withSleep, withoutSleep };
}

function getMoodCorrelationStats(moods, habits, completions, sleep) {
  const today = new Date();
  // Days with exercise habit completed
  const exerciseHabit = habits.find(h => /exercise|gym|workout|run|walk|sport|fitness/i.test(h.name));
  let exerciseDays = [], nonExerciseDays = [];
  let sleep7Days = [], noSleep7Days = [];
  let allHabitDays = [], notAllHabitDays = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
    const key = `${y}-${m}-${d}`;
    const moodEntry = moods?.[key];
    if (!moodEntry?.score) continue;
    const score = moodEntry.score;
    const sleepEntry = sleep?.[key];
    const sched = habits.filter(h => !h.days || h.days.length === 7 || h.days.includes(date.getDay()));
    const dayDone = sched.filter(h => !!completions[`${h.id}|${y}|${m}|${d}`]).length;
    const allDone = sched.length > 0 && dayDone === sched.length;

    if (exerciseHabit && completions[`${exerciseHabit.id}|${y}|${m}|${d}`]) exerciseDays.push(score);
    else if (exerciseHabit) nonExerciseDays.push(score);

    if (sleepEntry?.hours >= 7) sleep7Days.push(score);
    else noSleep7Days.push(score);

    if (allDone) allHabitDays.push(score);
    else notAllHabitDays.push(score);
  }

  const avg = arr => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length * 10) / 10 : null;
  const baseline = avg([...exerciseDays, ...nonExerciseDays]) || avg([...sleep7Days, ...noSleep7Days]) || null;

  return {
    exerciseHabit,
    exerciseAvgMood:    avg(exerciseDays),
    noExerciseAvgMood:  avg(nonExerciseDays),
    sleep7AvgMood:      avg(sleep7Days),
    noSleep7AvgMood:    avg(noSleep7Days),
    allHabitsAvgMood:   avg(allHabitDays),
    noAllHabitsAvgMood: avg(notAllHabitDays),
    exerciseDaysCount:  exerciseDays.length,
    sleep7DaysCount:    sleep7Days.length,
    allHabitsDaysCount: allHabitDays.length,
    baseline,
  };
}

function generateSmartInsights({ habits, completions, moods, sleep, weeklyTrend, habitPerf, monthStats }) {
  const insights = [];

  // 1. Weekday vs weekend
  const { wdPct, wePct } = getWeekdayVsWeekend(habits, completions);
  if (wdPct !== null && wePct !== null && Math.abs(wdPct - wePct) >= 5) {
    const diff = Math.abs(wdPct - wePct);
    const better = wdPct > wePct ? 'weekdays' : 'weekends';
    const worse  = wdPct > wePct ? 'weekends' : 'weekdays';
    insights.push({
      icon: '📅',
      color: 'blue',
      title: 'Weekday vs Weekend',
      text: `You complete habits ${diff}% more often on ${better} than ${worse} (${Math.max(wdPct, wePct)}% vs ${Math.min(wdPct, wePct)}%).`,
    });
  }

  // 2. Best streak
  const bestStreak = getBestStreak(habits, completions);
  if (bestStreak >= 3) {
    insights.push({
      icon: '🔥',
      color: 'orange',
      title: 'Best Streak',
      text: `Your best single-habit streak in the last 90 days is ${bestStreak} consecutive days. Keep it up!`,
    });
  }

  // 3. Sleep correlation
  const sleepCorr = getSleepHabitCorrelation(habits, completions, sleep);
  if (sleepCorr?.withSleep !== null && sleepCorr?.withoutSleep !== null) {
    const diff = sleepCorr.withSleep - sleepCorr.withoutSleep;
    if (Math.abs(diff) >= 5) {
      insights.push({
        icon: '😴',
        color: diff > 0 ? 'green' : 'red',
        title: 'Sleep & Habits',
        text: `When you sleep 7h+, your habit completion is ${diff > 0 ? `${diff}% higher` : `${Math.abs(diff)}% lower`} (${sleepCorr.withSleep}% vs ${sleepCorr.withoutSleep}% on less sleep).`,
      });
    }
  }

  // 4. Top performing habit
  if (habitPerf.length > 0 && habitPerf[0].pct > 0) {
    insights.push({
      icon: '🏆',
      color: 'gold',
      title: 'Top Habit This Month',
      text: `${habitPerf[0].habit.icon || ''} ${habitPerf[0].habit.name} is your strongest habit — ${habitPerf[0].pct}% completion in the last 30 days.`,
    });
  }

  // 5. Weekly trend direction
  if (weeklyTrend.length >= 4) {
    const recent2 = weeklyTrend.slice(-2).map(w => w.pct);
    const older2  = weeklyTrend.slice(-4, -2).map(w => w.pct);
    const recentAvg = recent2.reduce((s, v) => s + v, 0) / recent2.length;
    const olderAvg  = older2.reduce((s, v) => s + v, 0) / older2.length;
    const delta = Math.round(recentAvg - olderAvg);
    if (Math.abs(delta) >= 5) {
      insights.push({
        icon: delta > 0 ? '📈' : '📉',
        color: delta > 0 ? 'green' : 'red',
        title: delta > 0 ? 'Momentum Building' : 'Slipping Back',
        text: `Your completion rate is ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)}% compared to 2 weeks ago. ${delta > 0 ? 'Great work!' : 'Try to refocus this week.'}`,
      });
    }
  }

  // 6. Mood-habit connection
  const moodKeys = Object.keys(moods || {});
  if (moodKeys.length >= 5) {
    const moodScores = moodKeys.map(k => moods[k]?.score).filter(Boolean);
    const avgMood = moodScores.length ? Math.round(moodScores.reduce((s, v) => s + v, 0) / moodScores.length * 10) / 10 : null;
    if (avgMood !== null) {
      insights.push({
        icon: '💡',
        color: 'purple',
        title: 'Mood Snapshot',
        text: `Your average mood score over the last ${moodKeys.length} logged days is ${avgMood}/5. ${avgMood >= 4 ? 'You\'re doing great!' : avgMood >= 3 ? 'Things are going okay.' : 'Tough stretch — keep showing up.'}`,
      });
    }
  }

  return insights.slice(0, 5);
}

export default function InsightsView({ habits, completions, moods, water, sleep }) {
  const today = new Date();
  const year = today.getFullYear(), month = today.getMonth();

  const monthStats  = useMemo(() => getMonthStats(habits, completions, year, month), [habits, completions, year, month]);
  const weeklyTrend = useMemo(() => getWeeklyTrend(habits, completions), [habits, completions]);
  const habitPerf   = useMemo(() => getHabitPerformance(habits, completions), [habits, completions]);
  const moodCorr    = useMemo(() => getMoodCorrelation(moods, habits, completions), [moods, habits, completions]);

  const moodCorrStats = useMemo(
    () => getMoodCorrelationStats(moods, habits, completions, sleep),
    [moods, habits, completions, sleep]
  );

  const scheduleOptData = useMemo(
    () => getScheduleOptimizer(habits, completions),
    [habits, completions]
  );

  const smartInsights = useMemo(
    () => generateSmartInsights({ habits, completions, moods, sleep, weeklyTrend, habitPerf, monthStats }),
    [habits, completions, moods, sleep, weeklyTrend, habitPerf, monthStats]
  );

  const topPerformer   = habitPerf[0];
  const needsAttention = habitPerf[habitPerf.length - 1];
  const maxWeekPct     = Math.max(...weeklyTrend.map(w => w.pct), 1);

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const colorMap = { green: 'var(--green)', blue: '#4d96ff', orange: 'var(--orange)', red: 'var(--red)', gold: 'var(--gold)', purple: '#c77dff' };

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

      {/* Smart insights */}
      {smartInsights.length > 0 && (
        <div className="insights-section">
          <h3 className="insights-section-title">Smart Insights</h3>
          <div className="smart-insights-list">
            {smartInsights.map((ins, i) => (
              <div key={i} className="smart-insight-card" style={{ borderLeftColor: colorMap[ins.color] || 'var(--gold)' }}>
                <div className="si-header">
                  <span className="si-icon">{ins.icon}</span>
                  <span className="si-title" style={{ color: colorMap[ins.color] || 'var(--gold)' }}>{ins.title}</span>
                </div>
                <p className="si-text">{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood correlations */}
      <div className="insights-section">
        <h3 className="insights-section-title">Mood Correlations</h3>
        <p className="mood-corr-section-desc">How different factors relate to your mood score (1–5 scale)</p>
        <div className="mood-corr-cards-grid">
          {moodCorrStats.exerciseHabit && moodCorrStats.exerciseAvgMood !== null && (
            <div className="mood-corr-stat-card">
              <div className="mcs-icon">🏋️</div>
              <div className="mcs-label">On exercise days</div>
              <div className="mcs-score" style={{ color: moodCorrStats.exerciseAvgMood >= 4 ? 'var(--green)' : moodCorrStats.exerciseAvgMood >= 3 ? 'var(--orange)' : 'var(--red)' }}>
                {moodCorrStats.exerciseAvgMood}/5
              </div>
              {moodCorrStats.noExerciseAvgMood !== null && (
                <div className="mcs-comparison" style={{ color: moodCorrStats.exerciseAvgMood >= moodCorrStats.noExerciseAvgMood ? 'var(--green)' : 'var(--red)' }}>
                  {moodCorrStats.exerciseAvgMood >= moodCorrStats.noExerciseAvgMood ? '▲' : '▼'} vs {moodCorrStats.noExerciseAvgMood} on rest days
                </div>
              )}
              <div className="mcs-days">{moodCorrStats.exerciseDaysCount} days tracked</div>
            </div>
          )}

          {moodCorrStats.sleep7AvgMood !== null && (
            <div className="mood-corr-stat-card">
              <div className="mcs-icon">😴</div>
              <div className="mcs-label">On 7h+ sleep days</div>
              <div className="mcs-score" style={{ color: moodCorrStats.sleep7AvgMood >= 4 ? 'var(--green)' : moodCorrStats.sleep7AvgMood >= 3 ? 'var(--orange)' : 'var(--red)' }}>
                {moodCorrStats.sleep7AvgMood}/5
              </div>
              {moodCorrStats.noSleep7AvgMood !== null && (
                <div className="mcs-comparison" style={{ color: moodCorrStats.sleep7AvgMood >= moodCorrStats.noSleep7AvgMood ? 'var(--green)' : 'var(--red)' }}>
                  {moodCorrStats.sleep7AvgMood >= moodCorrStats.noSleep7AvgMood ? '▲' : '▼'} vs {moodCorrStats.noSleep7AvgMood} on less sleep
                </div>
              )}
              <div className="mcs-days">{moodCorrStats.sleep7DaysCount} days tracked</div>
            </div>
          )}

          {moodCorrStats.allHabitsAvgMood !== null && (
            <div className="mood-corr-stat-card">
              <div className="mcs-icon">✅</div>
              <div className="mcs-label">All habits completed</div>
              <div className="mcs-score" style={{ color: moodCorrStats.allHabitsAvgMood >= 4 ? 'var(--green)' : moodCorrStats.allHabitsAvgMood >= 3 ? 'var(--orange)' : 'var(--red)' }}>
                {moodCorrStats.allHabitsAvgMood}/5
              </div>
              {moodCorrStats.noAllHabitsAvgMood !== null && (
                <div className="mcs-comparison" style={{ color: moodCorrStats.allHabitsAvgMood >= moodCorrStats.noAllHabitsAvgMood ? 'var(--green)' : 'var(--red)' }}>
                  {moodCorrStats.allHabitsAvgMood >= moodCorrStats.noAllHabitsAvgMood ? '▲' : '▼'} vs {moodCorrStats.noAllHabitsAvgMood} on partial days
                </div>
              )}
              <div className="mcs-days">{moodCorrStats.allHabitsDaysCount} days tracked</div>
            </div>
          )}

          {/* Fallback if no correlation data yet */}
          {moodCorrStats.exerciseAvgMood === null && moodCorrStats.sleep7AvgMood === null && moodCorrStats.allHabitsAvgMood === null && (
            <div className="mood-corr-empty">
              <p>Not enough data yet. Log moods, sleep, and habits over several days to see correlations.</p>
            </div>
          )}
        </div>
        {moodCorrStats.baseline !== null && (
          <p className="mood-corr-note">Baseline average mood: {moodCorrStats.baseline}/5 across all tracked days</p>
        )}
      </div>

      {/* Classic mood-habit correlation */}
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

      {/* Schedule Optimizer */}
      <div className="insights-section schedule-optimizer">
        <h3 className="insights-section-title">📅 Schedule Optimizer</h3>
        <p className="mood-corr-section-desc">Based on your completion history — the best days to schedule each habit.</p>
        {scheduleOptData.length === 0 ? (
          <div className="mood-corr-empty">
            <p>Not enough data yet. Complete habits over at least 14 scheduled days per habit to see optimizer suggestions.</p>
          </div>
        ) : (
          <div className="schedule-opt-grid">
            {scheduleOptData.map(({ habit, rates, bestDays, skipDays, dayLabels }) => (
              <div key={habit.id} className="schedule-opt-card">
                <div className="schedule-opt-habit-name">
                  {habit.icon && <span>{habit.icon} </span>}{habit.name}
                </div>
                <div className="schedule-opt-bars">
                  {rates.map((rate, i) => {
                    const pct = rate !== null ? Math.round(rate * 100) : 0;
                    const barColor =
                      rate === null ? 'var(--elevated)' :
                      pct >= 70    ? 'var(--green)' :
                      pct >= 40    ? 'var(--orange)' :
                                     'var(--red)';
                    return (
                      <div key={i} className="schedule-opt-bar-col">
                        <div
                          className="schedule-opt-bar"
                          style={{
                            height: `${rate !== null ? Math.max(pct, 4) : 4}%`,
                            backgroundColor: barColor,
                          }}
                          title={rate !== null ? `${pct}%` : 'No data'}
                        />
                        <span className="schedule-opt-day-label">{dayLabels[i]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="schedule-opt-rec">
                  {bestDays.length > 0 && (
                    <span className="schedule-opt-best">
                      Best: {bestDays.join(', ')}
                    </span>
                  )}
                  {skipDays.length > 0 && (
                    <span className="schedule-opt-skip">
                      Skip-prone: {skipDays.join(', ')}
                    </span>
                  )}
                  {bestDays.length === 0 && skipDays.length === 0 && (
                    <span className="schedule-opt-neutral">Consistent across all days</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legacy insight cards */}
      <div className="insights-section">
        <h3 className="insights-section-title">Summary</h3>
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
