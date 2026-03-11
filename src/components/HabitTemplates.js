import React, { useState } from 'react';

const TEMPLATES = [
  // Morning Routine
  { icon: '🌅', name: 'Morning Pages',       color: '#ff9f43', category: 'mindfulness', days: [0,1,2,3,4,5,6], reminderTime: '07:00' },
  { icon: '🧘', name: 'Meditation',           color: '#c77dff', category: 'mindfulness', days: [0,1,2,3,4,5,6], reminderTime: '07:15' },
  { icon: '💧', name: 'Drink 8 Glasses',      color: '#4d96ff', category: 'health',      days: [0,1,2,3,4,5,6], reminderTime: '08:00' },
  { icon: '🏃', name: 'Morning Run',          color: '#6bcb77', category: 'fitness',     days: [1,2,3,4,5],     reminderTime: '06:30' },
  { icon: '☀️', name: 'Sunlight (10 min)',    color: '#ffd93d', category: 'health',      days: [0,1,2,3,4,5,6], reminderTime: '09:00' },
  // Fitness
  { icon: '💪', name: 'Workout',              color: '#ff6b35', category: 'fitness',     days: [1,3,5],         reminderTime: '17:00' },
  { icon: '🏋️', name: 'Strength Training',   color: '#ff6b6b', category: 'fitness',     days: [1,3,5],         reminderTime: '17:30' },
  { icon: '🚴', name: 'Cycling',              color: '#00c9a7', category: 'fitness',     days: [1,3,5,6],       reminderTime: '07:00' },
  { icon: '🤸', name: 'Stretching',           color: '#ff85a1', category: 'fitness',     days: [0,1,2,3,4,5,6], reminderTime: '20:00' },
  { icon: '🏊', name: 'Swimming',             color: '#74c0fc', category: 'fitness',     days: [1,3,5],         reminderTime: '18:00' },
  // Learning
  { icon: '📚', name: 'Read (30 min)',         color: '#4d96ff', category: 'learning',    days: [0,1,2,3,4,5,6], reminderTime: '21:00' },
  { icon: '✍️', name: 'Journaling',           color: '#ffd93d', category: 'learning',    days: [0,1,2,3,4,5,6], reminderTime: '21:30' },
  { icon: '🌐', name: 'Language Practice',    color: '#c77dff', category: 'learning',    days: [0,1,2,3,4,5,6], reminderTime: '19:00' },
  { icon: '🎵', name: 'Practice Instrument',  color: '#ff85a1', category: 'learning',    days: [0,1,2,3,4,5,6], reminderTime: '18:30' },
  { icon: '💡', name: 'Study (1 hour)',        color: '#ffd93d', category: 'learning',    days: [1,2,3,4,5],     reminderTime: '19:00' },
  // Health & Wellness
  { icon: '😴', name: 'Sleep by 10pm',         color: '#4d96ff', category: 'health',      days: [0,1,2,3,4,5,6], reminderTime: '21:45' },
  { icon: '🥗', name: 'Eat Vegetables',        color: '#6bcb77', category: 'health',      days: [0,1,2,3,4,5,6], reminderTime: '12:00' },
  { icon: '📵', name: 'No Phone After 9pm',    color: '#ff6b6b', category: 'health',      days: [0,1,2,3,4,5,6], reminderTime: '21:00' },
  { icon: '🌙', name: 'Evening Wind-Down',     color: '#c77dff', category: 'health',      days: [0,1,2,3,4,5,6], reminderTime: '22:00' },
  // Lifestyle
  { icon: '💰', name: 'Track Spending',        color: '#ffd93d', category: 'lifestyle',   days: [0,1,2,3,4,5,6], reminderTime: '20:00' },
  { icon: '🧹', name: 'Tidy for 10 min',      color: '#00c9a7', category: 'lifestyle',   days: [0,1,2,3,4,5,6], reminderTime: '18:00' },
  { icon: '🙏', name: 'Gratitude Practice',   color: '#ff85a1', category: 'mindfulness', days: [0,1,2,3,4,5,6], reminderTime: '22:00' },
  { icon: '🤝', name: 'Connect with Someone', color: '#ff9f43', category: 'lifestyle',   days: [1,2,3,4,5],     reminderTime: '17:00' },
  { icon: '📅', name: 'Plan Tomorrow',        color: '#74c0fc', category: 'lifestyle',   days: [0,1,2,3,4,5,6], reminderTime: '21:00' },
];

const CATS = ['all', 'fitness', 'mindfulness', 'learning', 'health', 'lifestyle'];
const DAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function HabitTemplates({ onAdd, onClose }) {
  const [filter, setFilter] = useState('all');
  const [added, setAdded]   = useState(new Set());

  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

  const handleAdd = (t) => {
    onAdd({ name: t.name, color: t.color, icon: t.icon, days: t.days, reminderTime: t.reminderTime, category: t.category });
    setAdded(prev => new Set([...prev, t.name]));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="templates-modal" onClick={e => e.stopPropagation()}>
        <div className="templates-header">
          <h2 className="templates-title">Habit Library</h2>
          <p className="templates-sub">Tap any habit to add it instantly</p>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="template-filter-row">
          {CATS.map(cat => (
            <button
              key={cat}
              className={`template-filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="templates-list">
          {filtered.map(t => (
            <div key={t.name} className={`template-card ${added.has(t.name) ? 'added' : ''}`}>
              <span className="template-icon" style={{ backgroundColor: t.color + '22' }}>{t.icon}</span>
              <div className="template-info">
                <span className="template-name">{t.name}</span>
                <span className="template-meta">
                  <span className="template-days">
                    {DAY_SHORT.map((d, i) => (
                      <span key={i} className={`tday ${t.days.includes(i) ? 'on' : ''}`}>{d}</span>
                    ))}
                  </span>
                  {t.reminderTime && <span className="template-time">⏰ {t.reminderTime}</span>}
                </span>
              </div>
              <button
                className={`template-add-btn ${added.has(t.name) ? 'added' : ''}`}
                onClick={() => handleAdd(t)}
                disabled={added.has(t.name)}
              >
                {added.has(t.name) ? <span>✓</span> : <span>+</span>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
