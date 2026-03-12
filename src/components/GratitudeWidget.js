import React, { useState, useEffect } from 'react';

export default function GratitudeWidget({ dateKey, gratitude, onSetGratitude }) {
  const saved = gratitude[dateKey] || ['', '', ''];
  const [items, setItems] = useState(saved);

  useEffect(() => {
    setItems(gratitude[dateKey] || ['', '', '']);
  }, [dateKey, gratitude]);

  const handleBlur = (index, value) => {
    const next = [...items];
    next[index] = value;
    setItems(next);
    onSetGratitude(dateKey, next);
  };

  const handleChange = (index, value) => {
    const next = [...items];
    next[index] = value;
    setItems(next);
  };

  return (
    <div className="gratitude-widget">
      <div className="gratitude-header">
        <span className="widget-label">Gratitude</span>
        <span className="gratitude-sub">3 things you're grateful for today</span>
      </div>
      <div className="gratitude-inputs">
        {items.map((val, i) => (
          <div key={i} className="gratitude-row">
            <span className="gratitude-num">{i + 1}</span>
            <input
              className="gratitude-input"
              type="text"
              placeholder={`I'm grateful for...`}
              value={val}
              onChange={e => handleChange(i, e.target.value)}
              onBlur={e => handleBlur(i, e.target.value)}
              maxLength={120}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
