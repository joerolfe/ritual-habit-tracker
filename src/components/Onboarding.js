import React, { useState } from 'react';
import { HABIT_COLORS } from '../utils/constants';

const GOALS = [
  { id: 'health',      icon: '💪', label: 'Get Healthier',    desc: 'Exercise, sleep, nutrition' },
  { id: 'mindfulness', icon: '🧘', label: 'Find More Calm',   desc: 'Meditation, journaling, breath' },
  { id: 'learning',    icon: '📚', label: 'Keep Learning',    desc: 'Reading, skills, languages' },
  { id: 'discipline',  icon: '🎯', label: 'Build Discipline', desc: 'Consistency, deep work, focus' },
  { id: 'lifestyle',   icon: '🌟', label: 'Level Up My Life', desc: 'Everything — all at once' },
];

const PRESETS_BY_GOAL = {
  health:      [
    { name: 'Workout',          icon: '💪', color: HABIT_COLORS[0] },
    { name: 'Drink 8 Glasses',  icon: '💧', color: HABIT_COLORS[4] },
    { name: 'Sleep 8 hrs',      icon: '😴', color: HABIT_COLORS[3] },
    { name: 'Eat Vegetables',   icon: '🥗', color: HABIT_COLORS[5] },
    { name: 'Morning Run',      icon: '🏃', color: HABIT_COLORS[2] },
  ],
  mindfulness: [
    { name: 'Meditation',       icon: '🧘', color: HABIT_COLORS[6] },
    { name: 'Journaling',       icon: '✍️', color: HABIT_COLORS[1] },
    { name: 'Gratitude',        icon: '🙏', color: HABIT_COLORS[7] },
    { name: 'Morning Pages',    icon: '🌅', color: HABIT_COLORS[2] },
    { name: 'No Phone 1hr',     icon: '📵', color: HABIT_COLORS[0] },
  ],
  learning:    [
    { name: 'Read 30 min',         icon: '📚', color: HABIT_COLORS[4] },
    { name: 'Language Practice',   icon: '🌐', color: HABIT_COLORS[6] },
    { name: 'Study 1 Hour',        icon: '💡', color: HABIT_COLORS[1] },
    { name: 'Journaling',          icon: '✍️', color: HABIT_COLORS[2] },
    { name: 'Practice Instrument', icon: '🎵', color: HABIT_COLORS[7] },
  ],
  discipline:  [
    { name: 'Deep Work',       icon: '🎯', color: HABIT_COLORS[4] },
    { name: 'Cold Shower',     icon: '🚿', color: HABIT_COLORS[1] },
    { name: 'No Social Media', icon: '📵', color: HABIT_COLORS[0] },
    { name: 'Wake at 6am',     icon: '⏰', color: HABIT_COLORS[2] },
    { name: 'Plan Tomorrow',   icon: '📅', color: HABIT_COLORS[7] },
  ],
  lifestyle:   [
    { name: 'Morning Routine', icon: '🌅', color: HABIT_COLORS[1] },
    { name: 'Exercise',        icon: '💪', color: HABIT_COLORS[0] },
    { name: 'Read',            icon: '📚', color: HABIT_COLORS[4] },
    { name: 'Meditation',      icon: '🧘', color: HABIT_COLORS[6] },
    { name: 'Gratitude',       icon: '🙏', color: HABIT_COLORS[7] },
  ],
};

export default function Onboarding({ onComplete }) {
  const [step,     setStep]     = useState(0);
  const [goal,     setGoal]     = useState(null);
  const [selected, setSelected] = useState([]);
  const [custom,   setCustom]   = useState('');

  const presets = goal ? PRESETS_BY_GOAL[goal] : [];

  const toggle = (preset) => {
    setSelected(prev => {
      const exists = prev.find(h => h.name === preset.name);
      if (exists) return prev.filter(h => h.name !== preset.name);
      return [...prev, {
        id:    `h${Date.now()}_${prev.length}`,
        name:  preset.name,
        icon:  preset.icon,
        color: preset.color,
        days:  [0,1,2,3,4,5,6],
      }];
    });
  };

  const addCustom = () => {
    const t = custom.trim();
    if (!t || selected.find(h => h.name === t)) return;
    setSelected(prev => [...prev, {
      id:    `h${Date.now()}`,
      name:  t,
      icon:  '⭐',
      color: HABIT_COLORS[prev.length % HABIT_COLORS.length],
      days:  [0,1,2,3,4,5,6],
    }]);
    setCustom('');
  };

  const handleGoalSelect = (id) => {
    setGoal(id);
    const pre = PRESETS_BY_GOAL[id].slice(0, 3).map((p, i) => ({
      id:    `h${Date.now()}_${i}`,
      name:  p.name,
      icon:  p.icon,
      color: p.color,
      days:  [0,1,2,3,4,5,6],
    }));
    setSelected(pre);
    setStep(2);
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
              Track daily habits, build streaks, and<br />
              stay locked in on what matters — every day.
            </p>
            <button className="ob-btn-primary" onClick={() => setStep(1)}>
              Get Started →
            </button>
          </div>
        )}

        {/* ── Step 1: Goal selection ── */}
        {step === 1 && (
          <div className="ob-step">
            <h2 className="ob-h2">What's your main goal?</h2>
            <p className="ob-sub-sm">We'll suggest the right habits to start with.</p>
            <div className="ob-goals-grid">
              {GOALS.map(g => (
                <button
                  key={g.id}
                  className={`ob-goal-card ${goal === g.id ? 'selected' : ''}`}
                  onClick={() => handleGoalSelect(g.id)}
                >
                  <span className="ob-goal-icon">{g.icon}</span>
                  <span className="ob-goal-label">{g.label}</span>
                  <span className="ob-goal-desc">{g.desc}</span>
                </button>
              ))}
            </div>
            <button className="ob-btn-ghost" onClick={() => setStep(2)}>Skip</button>
          </div>
        )}

        {/* ── Step 2: Pick habits ── */}
        {step === 2 && (
          <div className="ob-step">
            <h2 className="ob-h2">Choose your habits</h2>
            <p className="ob-sub-sm">
              {goal ? 'We picked some to start — customize as you like.' : 'Pick all that apply.'}
            </p>

            <div className="ob-preset-grid">
              {presets.map(preset => {
                const on = !!selected.find(h => h.name === preset.name);
                return (
                  <button
                    key={preset.name}
                    className={`ob-chip ${on ? 'on' : ''}`}
                    onClick={() => toggle(preset)}
                    style={on ? { borderColor: preset.color, backgroundColor: preset.color + '22' } : {}}
                  >
                    <span className="ob-chip-icon">{preset.icon}</span>
                    {on && <span className="ob-chip-check">✓</span>}
                    {preset.name}
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
              <button className="ob-btn-ghost" onClick={() => setStep(3)}>Skip</button>
              <button
                className="ob-btn-primary"
                disabled={selected.length === 0}
                style={{ opacity: selected.length === 0 ? 0.4 : 1 }}
                onClick={() => setStep(3)}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Done ── */}
        {step === 3 && (
          <div className="ob-step">
            <div className="ob-check-circle">✓</div>
            <h2 className="ob-h2">You're ready.</h2>
            <p className="ob-sub">
              {selected.length > 0
                ? `${selected.length} habit${selected.length !== 1 ? 's' : ''} ready to track.`
                : 'Add habits from the sidebar anytime.'}
              <br />Show up every day and watch the streak grow.
            </p>
            <div className="ob-perks">
              <div className="ob-perk"><span>🔥</span> Streaks keep you coming back</div>
              <div className="ob-perk"><span>🏆</span> Earn badges and level up</div>
              <div className="ob-perk"><span>📊</span> 52-week progress heatmap</div>
            </div>
            <button className="ob-btn-primary" onClick={() => onComplete(selected.length > 0 ? selected : null)}>
              Start Ritual →
            </button>
          </div>
        )}

        {/* Step dots */}
        <div className="ob-dots">
          {[0, 1, 2, 3].map(i => (
            <span key={i} className={`ob-dot ${step === i ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
