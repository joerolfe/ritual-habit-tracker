import React from 'react';

const TOTAL_GLASSES = 8;

export default function WaterWidget({ dateKey, water, onSetWater }) {
  const count = water[dateKey] || 0;

  const toggle = (i) => {
    if (i < count) {
      onSetWater(dateKey, i);
    } else {
      onSetWater(dateKey, i + 1);
    }
  };

  return (
    <div className="water-widget">
      <div className="water-header">
        <span className="widget-label">WATER</span>
        <span style={{ fontSize: 16, color: '#00BCD4' }}>💧</span>
      </div>
      <div className="water-glasses">
        {Array.from({ length: TOTAL_GLASSES }, (_, i) => (
          <button
            key={i}
            className={`glass-btn ${i < count ? 'filled' : ''}`}
            onClick={() => toggle(i)}
            title={i < count ? 'Unfill' : 'Fill'}
          >
            <svg width="16" height="19" viewBox="0 0 18 22" fill="none">
              <path
                d="M3 4h12l-1.5 14a1 1 0 01-1 .9H5.5a1 1 0 01-1-.9L3 4z"
                fill={i < count ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M1.5 4h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        ))}
      </div>
      <span className="water-count">{count}/8</span>
    </div>
  );
}
