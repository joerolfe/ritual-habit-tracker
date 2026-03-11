import React from 'react';

export const MOODS = [
  { score: 1, emoji: '😞', label: 'Rough' },
  { score: 2, emoji: '😕', label: 'Meh' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😊', label: 'Great' },
];

export default function MoodWidget({ dateKey, moods, onSetMood }) {
  const current = moods[dateKey]?.score || null;

  return (
    <div className="mood-widget">
      <span className="widget-label">Mood</span>
      <div className="mood-options">
        {MOODS.map(m => (
          <button
            key={m.score}
            className={`mood-btn ${current === m.score ? 'selected' : ''}`}
            onClick={() => onSetMood(dateKey, current === m.score ? null : m.score)}
            title={m.label}
          >
            <span className="mood-emoji">{m.emoji}</span>
            <span className="mood-label-text">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
