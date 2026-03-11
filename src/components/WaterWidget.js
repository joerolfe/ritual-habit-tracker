import React from 'react';

const TOTAL_GLASSES = 8;

export default function WaterWidget({ dateKey, water, onSetWater }) {
  const count = water[dateKey] || 0;

  const toggle = (i) => {
    // If clicking on a filled glass (index < count), unfill from that point
    // If clicking on an unfilled glass, fill up to that point
    if (i < count) {
      onSetWater(dateKey, i);
    } else {
      onSetWater(dateKey, i + 1);
    }
  };

  return (
    <div className="water-widget">
      <div className="water-header">
        <span className="widget-label">💧 Water</span>
        <span className="water-count">{count}/{TOTAL_GLASSES}</span>
      </div>
      <div className="water-glasses">
        {Array.from({ length: TOTAL_GLASSES }, (_, i) => (
          <button
            key={i}
            className={`glass-btn ${i < count ? 'filled' : ''}`}
            onClick={() => toggle(i)}
            title={i < count ? 'Unfill' : 'Fill'}
          >
            <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
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
    </div>
  );
}
