import React, { useMemo } from 'react';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_ABBR = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getDayOfWeek(year, month, day) { return new Date(year, month, day).getDay(); }

export function completionColor(pct) {
  if (pct >= 80) return '#30d158';
  if (pct >= 50) return '#ff9f0a';
  if (pct > 0)   return '#ff453a';
  return 'var(--t4)';
}

export default function MonthView({
  habits, year, month, isCompleted, onToggle, onPrevMonth, onNextMonth,
}) {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const dailyStats = useMemo(() => {
    if (!habits.length) return {};
    return days.reduce((acc, day) => {
      const done = habits.filter(h => isCompleted(h.id, year, month, day)).length;
      acc[day] = Math.round((done / habits.length) * 100);
      return acc;
    }, {});
  }, [habits, year, month, days, isCompleted]);

  const monthlyPct = useMemo(() => {
    if (!habits.length || !days.length) return 0;
    let done = 0;
    days.forEach(day => habits.forEach(h => { if (isCompleted(h.id, year, month, day)) done++; }));
    return Math.round((done / (habits.length * days.length)) * 100);
  }, [habits, year, month, days, isCompleted]);

  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const handleExport = () => window.print();

  return (
    <div className="month-view">
      <div className="month-header">
        <button className="nav-btn" onClick={onPrevMonth} title="Previous month">‹</button>
        <div className="month-title-block">
          <div className="month-title">
            {MONTH_NAMES[month]}<span className="month-year"> {year}</span>
          </div>
          <div className="month-subtitle">
            <span className="month-pct-badge" style={{ color: completionColor(monthlyPct) }}>
              {monthlyPct}% complete
            </span>
          </div>
        </div>
        <div className="month-header-actions">
          <button className="export-btn" onClick={handleExport} title="Export / Print">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 10v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Export
          </button>
        </div>
        <button className="nav-btn" onClick={onNextMonth} title="Next month">›</button>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${monthlyPct}%`, backgroundColor: completionColor(monthlyPct) }} />
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <p>Add habits in the sidebar to begin tracking.</p>
        </div>
      ) : (
        <div className="grid-outer">
          <div className="grid-inner">
            {/* Sticky names */}
            <div className="names-col">
              <div className="names-col-header" />
              {habits.map(habit => (
                <div key={habit.id} className="name-cell">
                  <span className="name-cell-dot" style={{ backgroundColor: habit.color }} />
                  <span className="name-cell-text">{habit.name}</span>
                </div>
              ))}
              <div className="names-col-footer">% done</div>
            </div>

            {/* Days */}
            <div className="days-scroll">
              <div className="days-row">
                {days.map(day => {
                  const dow = getDayOfWeek(year, month, day);
                  const isToday = isCurrentMonth && today.getDate() === day;
                  const isWeekend = dow === 0 || dow === 6;
                  const pct = dailyStats[day] ?? 0;

                  return (
                    <div
                      key={day}
                      className={['day-col', isToday ? 'today' : '', isWeekend ? 'weekend' : ''].join(' ')}
                    >
                      <div className="day-header">
                        <span className="day-num">{day}</span>
                        <span className="day-abbr">{DAY_ABBR[dow]}</span>
                      </div>

                      {habits.map(habit => {
                        const done = isCompleted(habit.id, year, month, day);
                        return (
                          <div
                            key={habit.id}
                            className={`grid-cell ${done ? 'done' : ''}`}
                            style={done ? {
                              backgroundColor: `${habit.color}22`,
                              borderColor:     `${habit.color}55`,
                            } : {}}
                            onClick={() => onToggle(habit.id, year, month, day)}
                            title={`${habit.name} · ${MONTH_NAMES[month]} ${day}`}
                          >
                            {done && <span className="cell-dot" style={{ backgroundColor: habit.color }} />}
                          </div>
                        );
                      })}

                      <div className="day-footer">
                        <span className="day-pct" style={{ color: pct > 0 ? completionColor(pct) : 'var(--t4)' }}>
                          {pct > 0 ? `${pct}%` : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
