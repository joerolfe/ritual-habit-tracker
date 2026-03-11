import React, { useState } from 'react';

const CATEGORIES = [
  {
    label: '💪',
    name: 'Fitness',
    emojis: ['🏃', '💪', '🏋️', '🧘', '🚴', '🏊', '🥊', '🧗', '🏄', '🤸', '⚽', '🎾', '🏀', '🧜', '🤾'],
  },
  {
    label: '🧠',
    name: 'Mind',
    emojis: ['📚', '✍️', '🎯', '🧩', '♟️', '🎓', '💡', '🔬', '📖', '🗒️', '📝', '🌐', '🧬', '🔭', '🎙️'],
  },
  {
    label: '🌿',
    name: 'Health',
    emojis: ['💧', '🥗', '🍎', '🥦', '😴', '💊', '🩺', '🌅', '🌙', '☀️', '🫁', '🧪', '🥑', '🫐', '🌿'],
  },
  {
    label: '✨',
    name: 'Life',
    emojis: ['🎨', '🎵', '🎸', '🧹', '💰', '📅', '🌱', '🤝', '🙏', '❤️', '🌟', '🏡', '📵', '🕯️', '🎭'],
  },
];

export default function EmojiPicker({ selected, onSelect }) {
  const [tab, setTab] = useState(0);

  return (
    <div className="emoji-picker">
      <div className="emoji-picker-tabs">
        {CATEGORIES.map((cat, i) => (
          <button
            key={i}
            className={`emoji-tab ${tab === i ? 'active' : ''}`}
            onClick={() => setTab(i)}
            type="button"
            title={cat.name}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="emoji-grid">
        {CATEGORIES[tab].emojis.map(emoji => (
          <button
            key={emoji}
            className={`emoji-btn ${selected === emoji ? 'selected' : ''}`}
            onClick={() => onSelect(emoji)}
            type="button"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
