import React, { useState } from 'react';
import { HABIT_COLORS } from '../App';

const PRESETS = [
  'Morning Meditation', 'Exercise', 'Read',
  'Drink Water', 'Cold Shower', 'Journaling',
  'No Social Media', 'Sleep 8 hrs', 'Healthy Eating',
  'Gratitude', 'Deep Work', 'Walk Outside',
];

export default function Onboarding({ onComplete }) {
  const [step, setStep]         = useState(0);
  const [selected, setSelected] = useState([]);
  const [custom, setCustom]     = useState('');

  const toggle = (name) => {
    setSelected(prev => {
      const exists = prev.find(h => h.name === name);
      if (exists) return prev.filter(h => h.name !== name);
      return [...prev, {
        id:    `h${Date.now()}_${prev.length}`,
        name,
        color: HABIT_COLORS[prev.length % HABIT_COLORS.length],
      }];
    });
  };

  const addCustom = () => {
    const t = custom.trim();
    if (!t || selected.find(h => h.name === t)) return;
    setSelected(prev => [...prev, {
      id:    `h${Date.now()}`,
      name:  t,
      color: HABIT_COLORS[prev.length % HABIT_COLORS.length],
    }]);
    setCustom('');
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-panel">

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="ob-step">
            <div className="ob-logo">Ritual</div>
            <h1 className="ob-h1">Build the life<br />you want.</h1>
            <p className="ob-sub">
              Track your daily habits, build streaks,<br />
              and stay locked in on your goals — every day.
            </p>
            <button className="ob-btn-primary" onClick={() => setStep(1)}>
              Get Started →
            </button>
          </div>
        )}

        {/* ── Step 1: Pick habits ── */}
        {step === 1 && (
          <div className="ob-step">
            <h2 className="ob-h2">Choose your habits</h2>
            <p className="ob-sub-sm">What do you want to track daily? Pick all that apply.</p>

            <div className="ob-preset-grid">
              {PRESETS.map(name => {
                const on = !!selected.find(h => h.name === name);
                return (
                  <button
                    key={name}
                    className={`ob-chip ${on ? 'on' : ''}`}
                    onClick={() => toggle(name)}
                  >
                    {on && <span className="ob-chip-check">✓</span>}
                    {name}
                  </button>
                );
              })}
            </div>

            <div className="ob-custom-row">
              <input
                className="ob-input"
                placeholder="Add your own habit..."
                value={custom}
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustom()}
                maxLength={40}
              />
              <button className="ob-add-btn" onClick={addCustom}>+</button>
            </div>

            {selected.length > 0 && (
              <p className="ob-count">{selected.length} habit{selected.length !== 1 ? 's' : ''} selected</p>
            )}

            <div className="ob-btn-row">
              <button className="ob-btn-ghost" onClick={() => setStep(2)}>Skip</button>
              <button
                className="ob-btn-primary"
                disabled={selected.length === 0}
                style={{ opacity: selected.length === 0 ? 0.4 : 1 }}
                onClick={() => setStep(2)}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Done ── */}
        {step === 2 && (
          <div className="ob-step">
            <div className="ob-check-circle">✓</div>
            <h2 className="ob-h2">You're all set.</h2>
            <p className="ob-sub">
              {selected.length > 0
                ? `${selected.length} habit${selected.length !== 1 ? 's' : ''} ready to track.`
                : 'Add habits from the sidebar anytime.'}
              <br />Show up every day and watch the streak grow.
            </p>
            <button className="ob-btn-primary" onClick={() => onComplete(selected.length > 0 ? selected : null)}>
              Start Ritual →
            </button>
          </div>
        )}

        {/* Step dots */}
        <div className="ob-dots">
          {[0, 1, 2].map(i => (
            <span key={i} className={`ob-dot ${step === i ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
