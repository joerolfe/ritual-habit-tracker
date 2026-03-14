import React, { useState, useMemo } from 'react';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_HABITS = [
  { id: 'mh1', name: 'Morning Meditation', days: [1,2,3,4,5] },
  { id: 'mh2', name: 'Exercise', days: [1,3,5,6,0] },
  { id: 'mh3', name: 'Read 30 min', days: [0,1,2,3,4,5,6] },
  { id: 'mh4', name: 'Cold Shower', days: [1,2,3,4,5] },
  { id: 'mh5', name: 'No Social Media', days: [0,1,2,3,4,5,6] },
];

function mockDone(habitIdx, dayIdx) {
  const rates = [0.82, 0.71, 0.65, 0.88, 0.45];
  const seed = (habitIdx * 37 + dayIdx * 13) % 100;
  return seed < rates[habitIdx] * 100;
}

const _today = new Date();
const MOCK_COMPLETIONS = {};
MOCK_HABITS.forEach((h, hi) => {
  for (let i = 0; i < 90; i++) {
    const d = new Date(_today);
    d.setDate(_today.getDate() - i);
    const dow = d.getDay();
    if (!h.days.includes(dow)) continue;
    if (mockDone(hi, i)) {
      MOCK_COMPLETIONS[`${h.id}|${d.getFullYear()}|${d.getMonth()}|${d.getDate()}`] = true;
    }
  }
});

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  bg:     '#000000',
  card:   '#111111',
  teal:   '#FFFFFF',
  orange: 'rgba(255,255,255,0.65)',
  amber:  'rgba(255,255,255,0.55)',
  red:    '#FF3B30',
  text:   '#FFFFFF',
  muted:  'rgba(255,255,255,0.45)',
  font:   'Inter, -apple-system, sans-serif',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DAY_NAMES_FULL = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_LABELS_SHORT = ['M','T','W','T','F','S','S']; // Mon-first display order
// index mapping: display index 0=Mon(1), 1=Tue(2), 2=Wed(3), 3=Thu(4), 4=Fri(5), 5=Sat(6), 6=Sun(0)
const DISPLAY_DOW = [1,2,3,4,5,6,0];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function barColor(pct) {
  if (pct >= 70) return '#FFFFFF';
  if (pct >= 40) return 'rgba(255,255,255,0.55)';
  return '#FF3B30';
}

// ── Main component ────────────────────────────────────────────────────────────

export default function InsightsView({ habits = [], completions = {}, moods = {}, water = {}, sleep = {} }) {
  const today = new Date();

  const [selYear, setSelYear]   = useState(today.getFullYear());
  const [selMonth, setSelMonth] = useState(today.getMonth());

  const mergedHabits      = useMemo(() => habits.length > 0 ? habits : MOCK_HABITS, [habits]);
  const mergedCompletions = useMemo(() => habits.length > 0 ? completions : MOCK_COMPLETIONS, [habits, completions]);

  // Per-habit completion rate for selected month
  function habitMonthRate(habit, year, month) {
    const daysInMonth = getDaysInMonth(year, month);
    let scheduled = 0, done = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (!habit.days || habit.days.includes(date.getDay())) {
        scheduled++;
        if (mergedCompletions[`${habit.id}|${year}|${month}|${d}`]) done++;
      }
    }
    return scheduled === 0 ? 0 : Math.round((done / scheduled) * 100);
  }

  const totalCompletions = useMemo(() => {
    const days = getDaysInMonth(selYear, selMonth);
    return mergedHabits.reduce((sum, h) => {
      for (let d = 1; d <= days; d++) {
        if (mergedCompletions[`${h.id}|${selYear}|${selMonth}|${d}`]) sum++;
      }
      return sum;
    }, 0);
  }, [mergedHabits, mergedCompletions, selYear, selMonth]);

  const perfectDays = useMemo(() => {
    const days = getDaysInMonth(selYear, selMonth);
    let count = 0;
    for (let d = 1; d <= days; d++) {
      const date = new Date(selYear, selMonth, d);
      const scheduled = mergedHabits.filter(h => !h.days || h.days.includes(date.getDay()));
      if (scheduled.length === 0) continue;
      const allDone = scheduled.every(h => mergedCompletions[`${h.id}|${selYear}|${selMonth}|${d}`]);
      if (allDone) count++;
    }
    return count;
  }, [mergedHabits, mergedCompletions, selYear, selMonth]);

  const overallRate = useMemo(() => {
    const rates = mergedHabits.map(h => habitMonthRate(h, selYear, selMonth));
    if (!rates.length) return 0;
    return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
  }, [mergedHabits, selYear, selMonth, mergedCompletions]);

  const habitRates = useMemo(() => {
    return mergedHabits
      .map(h => ({ habit: h, rate: habitMonthRate(h, selYear, selMonth) }))
      .sort((a, b) => b.rate - a.rate);
  }, [mergedHabits, selYear, selMonth, mergedCompletions]);

  const bestHabit = habitRates[0]?.habit || null;
  const bestRate  = habitRates[0]?.rate  || 0;

  // 4-week trend
  function weekRate(weeksAgo) {
    const end   = new Date(today);
    end.setDate(today.getDate() - weeksAgo * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    let done = 0, total = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const scheduled = mergedHabits.filter(h => !h.days || h.days.includes(d.getDay()));
      total += scheduled.length;
      done  += scheduled.filter(h =>
        mergedCompletions[`${h.id}|${d.getFullYear()}|${d.getMonth()}|${d.getDate()}`]
      ).length;
    }
    return total === 0 ? 0 : Math.round((done / total) * 100);
  }

  const weekRates  = useMemo(() => [weekRate(3), weekRate(2), weekRate(1), weekRate(0)], [mergedHabits, mergedCompletions]);
  const weekLabels = ['3w ago', '2w ago', 'Last wk', 'This wk'];

  const trendDiff  = weekRates[3] - weekRates[0];
  const trendLabel = trendDiff >= 3 ? 'Improving 📈' : trendDiff <= -3 ? 'Declining 📉' : 'Steady ➡️';

  // Smart insights
  const insights = useMemo(() => [
    { border: 'rgba(255,255,255,0.6)', text: `Your best streak this month: ${perfectDays > 0 ? perfectDays + ' days' : 'Keep going!'} 🔥` },
    { border: 'rgba(255,255,255,0.75)', text: `Overall completion rate: ${overallRate}% — ${overallRate >= 70 ? 'great work!' : 'room to improve'}` },
    { border: 'rgba(255,255,255,0.65)', text: `${bestHabit?.name || 'Top habit'} leads with ${bestRate}% completion — your strongest habit` },
    { border: 'rgba(255,255,255,0.6)', text: `You've completed ${totalCompletions} habits this month across all tracked routines` },
    { border: 'rgba(255,255,255,0.75)', text: `Morning habits tend to have higher completion — try front-loading new habits` },
  ], [overallRate, perfectDays, bestHabit, bestRate, totalCompletions]);

  // Per day-of-week rate for schedule optimizer
  function dowRate(habit, targetDow) {
    let done = 0, total = 0;
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      if (d.getDay() !== targetDow) continue;
      if (habit.days && !habit.days.includes(targetDow)) continue;
      total++;
      if (mergedCompletions[`${habit.id}|${d.getFullYear()}|${d.getMonth()}|${d.getDate()}`]) done++;
    }
    return total === 0 ? null : Math.round((done / total) * 100);
  }

  // Month navigation
  function prevMonth() {
    if (selMonth === 0) { setSelYear(y => y - 1); setSelMonth(11); }
    else setSelMonth(m => m - 1);
  }
  function nextMonth() {
    const nowYear = today.getFullYear(), nowMonth = today.getMonth();
    if (selYear > nowYear || (selYear === nowYear && selMonth >= nowMonth)) return;
    if (selMonth === 11) { setSelYear(y => y + 1); setSelMonth(0); }
    else setSelMonth(m => m + 1);
  }
  const atCurrentMonth = selYear === today.getFullYear() && selMonth === today.getMonth();

  // SVG weekly trend chart
  const svgW = 300, svgH = 100;
  const padL = 28, padR = 10, padT = 10, padB = 24;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  function xPos(i) { return padL + (i / 3) * chartW; }
  function yPos(v) { return padT + chartH - (v / 100) * chartH; }

  const polylinePoints = weekRates.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ');
  const avgRate = Math.round(weekRates.reduce((a, b) => a + b, 0) / 4);
  const avgY    = yPos(avgRate);

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: T.font, color: T.text, paddingBottom: 100 }}>

      {/* ── 1. HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '24px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 28, fontWeight: 700 }}>Insights</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={prevMonth}
            style={{ background: 'none', border: 'none', color: T.teal, fontSize: 18, cursor: 'pointer', padding: '4px 8px' }}
          >{'<'}</button>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text, minWidth: 110, textAlign: 'center' }}>
            {MONTH_NAMES[selMonth]} {selYear}
          </span>
          <button
            onClick={nextMonth}
            style={{ background: 'none', border: 'none', color: atCurrentMonth ? T.muted : T.teal, fontSize: 18, cursor: atCurrentMonth ? 'default' : 'pointer', padding: '4px 8px' }}
          >{'>'}</button>
        </div>
      </div>

      {/* ── 2. STATS ROW ───────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: 10, padding: '0 20px 16px', scrollbarWidth: 'none' }}>
        {[
          { icon: '📅', value: totalCompletions, label: 'Completions' },
          { icon: '✨', value: perfectDays, label: 'Perfect days' },
          { icon: '🏆', value: bestHabit?.name || '—', label: 'Best habit', small: (bestHabit?.name || '').length > 10 },
          { icon: '📊', value: `${overallRate}%`, label: 'Overall rate' },
        ].map((card, i) => (
          <div key={i} style={{
            flex: '0 0 auto', width: 140, background: T.card, borderRadius: 14,
            padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <span style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</span>
            <span style={{ fontSize: card.small ? 14 : 20, fontWeight: 700, textAlign: 'center', wordBreak: 'break-word' }}>
              {card.value}
            </span>
            <span style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>{card.label}</span>
          </div>
        ))}
      </div>

      {/* ── 3. HABIT PERFORMANCE ───────────────────────────────────────────── */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Habit performance</div>
        {habitRates.map(({ habit, rate }) => (
          <div key={habit.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, width: 120, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {habit.name}
            </span>
            <div style={{ flex: 1, margin: '0 10px', height: 8, borderRadius: 4, background: '#1A1A1A', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${rate}%`,
                background: '#FFFFFF',
                transition: 'width 1s ease',
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', width: 36, textAlign: 'right', flexShrink: 0 }}>
              {rate}%
            </span>
          </div>
        ))}
      </div>

      {/* ── 4. WEEKLY TREND CHART ──────────────────────────────────────────── */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Weekly trend</div>
        <div style={{ background: T.card, borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
            {/* Y axis labels */}
            {[0, 50, 100].map(v => (
              <text key={v} x={padL - 4} y={yPos(v) + 4} textAnchor="end" fontSize={10} fill={T.muted}>{v}</text>
            ))}

            {/* Grid lines */}
            {[0, 50, 100].map(v => (
              <line key={v} x1={padL} y1={yPos(v)} x2={svgW - padR} y2={yPos(v)}
                stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            ))}

            {/* Average dashed line */}
            <line
              x1={padL} y1={avgY} x2={svgW - padR} y2={avgY}
              stroke="rgba(255,255,255,0.4)" strokeWidth={1} strokeDasharray="4 4"
            />

            {/* Data line */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Dots */}
            {weekRates.map((v, i) => (
              <circle key={i} cx={xPos(i)} cy={yPos(v)} r={5} fill="#FFFFFF" />
            ))}

            {/* X axis labels */}
            {weekLabels.map((lbl, i) => (
              <text key={i} x={xPos(i)} y={svgH - 4} textAnchor="middle" fontSize={10} fill={T.muted}>{lbl}</text>
            ))}
          </svg>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 8 }}>{trendLabel}</div>
        </div>
      </div>

      {/* ── 5. SMART INSIGHTS ──────────────────────────────────────────────── */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Smart insights</div>
        {insights.map((ins, i) => (
          <div key={i} style={{
            background: T.card, borderRadius: 12, padding: '12px 14px',
            borderLeft: `3px solid ${ins.border}`, marginBottom: 10,
          }}>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: T.text }}>{ins.text}</span>
          </div>
        ))}
      </div>

      {/* ── 6. MOOD CORRELATIONS ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12, padding: '0 20px' }}>Mood correlations</div>
        <div style={{ display: 'flex', overflowX: 'auto', gap: 10, padding: '0 20px 0', scrollbarWidth: 'none' }}>
          {[
            { icon: '💪', title: 'Exercise days',  value: '4.2 avg mood', sub: 'vs 3.1 on rest days' },
            { icon: '😴', title: '7h+ sleep',      value: '4.4 avg mood', sub: 'vs 3.2 with less sleep' },
            { icon: '✅', title: 'Perfect days',   value: '4.6 avg mood', sub: 'vs 3.4 otherwise' },
          ].map((card, i) => (
            <div key={i} style={{
              flex: '0 0 220px', background: T.card, borderRadius: 14, padding: 16,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 6 }}>{card.title}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>{card.value}</div>
              <div style={{ fontSize: 12, color: T.muted }}>{card.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. SCHEDULE OPTIMIZER ──────────────────────────────────────────── */}
      <div style={{ padding: '0 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Best days for each habit</div>
        {mergedHabits.map((habit, hi) => {
          // Compute per display-day-of-week rates (Mon-Sun order)
          const rates = DISPLAY_DOW.map(dow => dowRate(habit, dow));
          const maxRate = Math.max(...rates.map(r => r || 0), 1);

          // Best 2 days by name
          const ratedDays = DISPLAY_DOW
            .map((dow, di) => ({ dow, di, rate: rates[di] }))
            .filter(x => x.rate !== null)
            .sort((a, b) => b.rate - a.rate);
          const bestDayNames = ratedDays.slice(0, 2).map(x => DAY_NAMES_FULL[x.dow]);

          return (
            <div key={habit.id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: hi < mergedHabits.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontSize: 13, marginBottom: 6, color: T.text }}>{habit.name}</div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 40, marginBottom: 4 }}>
                {rates.map((rate, di) => {
                  const pct = rate !== null ? rate : 0;
                  const barH = Math.max(4, pct * 0.4);
                  const bColor =
                    rate === null ? '#222' :
                    pct >= 70    ? '#FFFFFF' :
                    pct >= 40    ? 'rgba(255,255,255,0.55)' :
                                   'rgba(255,59,48,0.6)';
                  return (
                    <div key={di} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 28, height: barH, borderRadius: '3px 3px 0 0',
                        background: bColor, alignSelf: 'flex-end',
                      }} />
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {DAY_LABELS_SHORT.map((lbl, di) => (
                  <div key={di} style={{ width: 28, fontSize: 9, color: T.muted, textAlign: 'center' }}>{lbl}</div>
                ))}
              </div>
              {bestDayNames.length > 0 && (
                <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>
                  Best: {bestDayNames.join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
