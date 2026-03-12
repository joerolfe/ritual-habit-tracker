import React from 'react';

function calcDuration(bedtime, wake) {
  if (!bedtime || !wake) return null;
  const [bh, bm] = bedtime.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60; // crosses midnight
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
}

export default function SleepWidget({ dateKey, sleep, onSetSleep }) {
  const entry = sleep[dateKey] || {};
  const bedtime = entry.bedtime || '';
  const wake = entry.wake || '';
  const duration = calcDuration(bedtime, wake);

  const update = (field, val) => {
    onSetSleep(dateKey, { ...entry, [field]: val });
  };

  return (
    <div className="sleep-widget">
      <div className="sleep-header">
        <span className="widget-label">🌙 Sleep</span>
        {duration && <span className="sleep-duration">{duration}</span>}
      </div>
      <div className="sleep-inputs">
        <div className="sleep-field">
          <span className="sleep-field-label">Bed</span>
          <input
            type="time"
            className="sleep-time-input"
            value={bedtime}
            onChange={e => update('bedtime', e.target.value)}
          />
        </div>
        <div className="sleep-field">
          <span className="sleep-field-label">Wake</span>
          <input
            type="time"
            className="sleep-time-input"
            value={wake}
            onChange={e => update('wake', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
