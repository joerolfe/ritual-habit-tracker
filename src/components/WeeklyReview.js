import React, { useState } from 'react';

function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  // Get ISO week number
  const jan4 = new Date(d.getFullYear(), 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));
  const diff = d - startOfWeek1;
  const weekNum = Math.floor(diff / (7 * 86400000)) + 1;
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export function shouldShowWeeklyReview(weeklyReviews) {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun, 1=Mon
  if (dow !== 0 && dow !== 1) return false;
  const weekKey = getWeekKey(today);
  return !weeklyReviews[weekKey];
}

function getLast7DaysStats(habits, completions) {
  const today = new Date();
  let totalSlots = 0, totalDone = 0, totalMissed = 0, perfectDays = 0;
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
    const sched = habits.filter(h => !h.days || h.days.length === 7 || h.days.includes(date.getDay()));
    const done = sched.filter(h => !!completions[`${h.id}|${y}|${m}|${d}`]).length;
    const missed = sched.length - done;
    totalSlots += sched.length;
    totalDone += done;
    totalMissed += missed;
    if (sched.length > 0 && done === sched.length) perfectDays++;
    const pct = sched.length ? Math.round((done / sched.length) * 100) : 0;
    days.push({ date, pct, done, total: sched.length });
  }

  const pct = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;
  return { pct, totalDone, totalMissed, perfectDays, days };
}

export default function WeeklyReview({ weeklyReviews, habits, completions, onSave, onClose }) {
  const [wellWent, setWellWent] = useState('');
  const [improve, setImprove] = useState('');
  const [focus, setFocus] = useState('');

  const weekKey = getWeekKey(new Date());
  const stats = getLast7DaysStats(habits, completions);

  const handleSave = () => {
    onSave(weekKey, { wellWent, improve, focus, savedAt: Date.now() });
    onClose();
  };

  return (
    <div className="weekly-review-overlay" onClick={onClose}>
      <div className="weekly-review-modal" onClick={e => e.stopPropagation()}>
        <div className="weekly-review-header">
          <span className="weekly-review-title">Weekly Review</span>
          <span className="weekly-review-week">{weekKey}</span>
        </div>

        <div className="weekly-review-stats">
          <div className="wr-stat">
            <span className="wr-stat-value" style={{ color: stats.pct >= 80 ? 'var(--green)' : stats.pct >= 50 ? 'var(--orange)' : 'var(--red)' }}>
              {stats.pct}%
            </span>
            <span className="wr-stat-label">Completion</span>
          </div>
          <div className="wr-stat">
            <span className="wr-stat-value" style={{ color: 'var(--green)' }}>{stats.totalDone}</span>
            <span className="wr-stat-label">Done</span>
          </div>
          <div className="wr-stat">
            <span className="wr-stat-value" style={{ color: 'var(--red)' }}>{stats.totalMissed}</span>
            <span className="wr-stat-label">Missed</span>
          </div>
          <div className="wr-stat">
            <span className="wr-stat-value" style={{ color: 'var(--orange)' }}>{stats.perfectDays}</span>
            <span className="wr-stat-label">Perfect days</span>
          </div>
        </div>

        <div className="weekly-review-days">
          {stats.days.map((day, i) => {
            const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.date.getDay()];
            return (
              <div key={i} className="wr-day">
                <span className="wr-day-name">{dow}</span>
                <div className="wr-day-bar-track">
                  <div className="wr-day-bar-fill" style={{
                    height: `${day.pct}%`,
                    backgroundColor: day.pct >= 80 ? 'var(--green)' : day.pct >= 50 ? 'var(--orange)' : day.pct > 0 ? 'var(--red)' : 'transparent',
                    minHeight: day.pct > 0 ? '3px' : 0,
                  }} />
                </div>
                <span className="wr-day-pct">{day.pct > 0 ? `${day.pct}%` : '—'}</span>
              </div>
            );
          })}
        </div>

        <div className="weekly-review-questions">
          <div className="wr-question">
            <label className="wr-question-label">What went well this week?</label>
            <textarea className="wr-textarea" rows={3} value={wellWent} onChange={e => setWellWent(e.target.value)} placeholder="Celebrate your wins..." />
          </div>
          <div className="wr-question">
            <label className="wr-question-label">What could be improved?</label>
            <textarea className="wr-textarea" rows={3} value={improve} onChange={e => setImprove(e.target.value)} placeholder="Be honest with yourself..." />
          </div>
          <div className="wr-question">
            <label className="wr-question-label">What's your focus for next week?</label>
            <textarea className="wr-textarea" rows={3} value={focus} onChange={e => setFocus(e.target.value)} placeholder="Set your intention..." />
          </div>
        </div>

        <div className="weekly-review-footer">
          <button className="wr-skip-btn" onClick={onClose}>Skip</button>
          <button className="wr-save-btn" onClick={handleSave}>Save Review</button>
        </div>
      </div>
    </div>
  );
}
