import React, { useState, useMemo, useEffect } from 'react';

const CATEGORIES = ['Health', 'Mind', 'Career', 'Fitness', 'Learning', 'Lifestyle'];
const CAT_COLORS = {
  Health: '#ff6b6b', Mind: '#a78bfa', Career: '#60a5fa',
  Fitness: '#34d399', Learning: '#fbbf24', Lifestyle: '#f472b6',
};

const GOAL_TEMPLATES = [
  { title: 'Run a 5K',              category: 'Fitness',   type: 'numeric', targetValue: 5,    unit: 'km',    icon: '🏃' },
  { title: 'Read 12 books',         category: 'Learning',  type: 'numeric', targetValue: 12,   unit: 'books', icon: '📚' },
  { title: 'Lose 5kg',              category: 'Health',    type: 'numeric', targetValue: 5,    unit: 'kg',    icon: '⚖️' },
  { title: 'Meditate 30 days',      category: 'Mind',      type: 'habit',                      icon: '🧘' },
  { title: 'Save £1000',            category: 'Lifestyle', type: 'numeric', targetValue: 1000, unit: '£',     icon: '💰' },
  { title: 'Learn a new skill',     category: 'Career',    type: 'project',                    icon: '💡' },
  { title: 'No junk food 21 days',  category: 'Health',    type: 'habit',                      icon: '🥗' },
  { title: 'Complete a course',     category: 'Career',    type: 'project',                    icon: '🎓' },
];

const motivationalMessages = [
  "Every milestone is a step toward your best self!",
  "You're unstoppable — keep going!",
  "Progress is progress, no matter how small.",
  "You just proved what you're capable of.",
  "Excellence, one milestone at a time.",
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function deadlineText(targetDate) {
  if (!targetDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - now) / 86400000);
  if (diff === 0) return { text: 'Due today!', cls: 'deadline-today' };
  if (diff > 0) return { text: `${diff} day${diff !== 1 ? 's' : ''} left`, cls: 'deadline-future' };
  return { text: `${Math.abs(diff)} day${Math.abs(diff) !== 1 ? 's' : ''} overdue`, cls: 'deadline-over' };
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.4);
    });
  } catch(e) {}
}

function SimpleConfetti({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1}s`,
    color: ['#c8a96e','#4d96ff','#30d158','#ff9f0a','#ff453a','#7c3aed'][i % 6],
    size: `${6 + Math.random() * 8}px`,
  }));

  return (
    <div className="confetti-overlay" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          position: 'absolute', top: '-10px', left: p.left,
          width: p.size, height: p.size, background: p.color,
          borderRadius: '2px', animationDelay: p.delay,
        }} />
      ))}
    </div>
  );
}

function MilestoneEditor({ milestones, onChange }) {
  const [newText, setNewText] = useState('');

  const addMilestone = () => {
    const text = newText.trim();
    if (!text) return;
    onChange([...milestones, { id: Date.now().toString(), text, done: false }]);
    setNewText('');
  };

  const removeMilestone = (id) => {
    onChange(milestones.filter(m => m.id !== id));
  };

  return (
    <div className="milestone-editor">
      <label className="goal-form-label">Milestones (optional)</label>
      {milestones.length > 0 && (
        <ul className="milestone-editor-list">
          {milestones.map(m => (
            <li key={m.id} className="milestone-editor-item">
              <span className="milestone-editor-text">{m.text}</span>
              <button
                type="button"
                className="milestone-editor-remove"
                onClick={() => removeMilestone(m.id)}
                title="Remove milestone"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="milestone-editor-add-row">
        <input
          className="goal-form-input"
          placeholder="Add a milestone…"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMilestone(); } }}
          maxLength={80}
        />
        <button type="button" className="milestone-add-btn" onClick={addMilestone} disabled={!newText.trim()}>
          Add
        </button>
      </div>
    </div>
  );
}

function GoalForm({ initial, habits, allGoals, onSave, onCancel }) {
  const [title, setTitle]               = useState(initial?.title || '');
  const [description, setDescription]   = useState(initial?.description || '');
  const [category, setCategory]         = useState(initial?.category || 'Health');
  const [targetDate, setTargetDate]     = useState(initial?.targetDate || '');
  const [linkedHabits, setLinkedHabits] = useState(initial?.linkedHabits || []);
  const [type, setType]                 = useState(initial?.type || 'habit');
  const [targetValue, setTargetValue]   = useState(initial?.targetValue ?? '');
  const [currentValue, setCurrentValue] = useState(initial?.currentValue ?? 0);
  const [unit, setUnit]                 = useState(initial?.unit || '');
  const [milestones, setMilestones]     = useState(initial?.milestones || []);
  const [parentId, setParentId]         = useState(initial?.parentId || '');
  const [imageData, setImageData]       = useState(initial?.imageData || '');

  const objectives = (allGoals || []).filter(g => g.type === 'objective' && g.id !== initial?.id);

  const toggleHabit = (id) => {
    setLinkedHabits(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageData(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description,
      category,
      targetDate,
      linkedHabits,
      type,
      targetValue: type === 'numeric' ? Number(targetValue) : undefined,
      currentValue: type === 'numeric' ? Number(currentValue) : undefined,
      unit: type === 'numeric' ? unit.trim() : undefined,
      milestones,
      parentId: type === 'key_result' ? parentId : undefined,
      imageData: imageData || undefined,
    });
  };

  return (
    <div className="goal-form">
      <input
        className="goal-form-input"
        placeholder="Goal title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={60}
      />
      <textarea
        className="goal-form-textarea"
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={2}
        maxLength={200}
      />

      {/* Vision board image upload */}
      <div className="goal-form-field">
        <label className="goal-form-label">Vision image (optional)</label>
        <input
          type="file"
          accept="image/*"
          className="goal-image-input"
          onChange={handleImageChange}
        />
        {imageData && (
          <img
            src={imageData}
            alt="Goal vision preview"
            style={{ marginTop: 8, maxWidth: '100%', maxHeight: 120, borderRadius: 8, objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Goal type selector */}
      <div className="goal-form-field">
        <label className="goal-form-label">Goal type</label>
        <div className="goal-type-selector">
          {[
            { value: 'habit',      label: 'Habit-linked' },
            { value: 'numeric',    label: 'Numeric' },
            { value: 'project',    label: 'Project' },
            { value: 'objective',  label: 'Objective' },
            { value: 'key_result', label: 'Key Result' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              className={`goal-type-btn ${type === opt.value ? 'selected' : ''}`}
              onClick={() => setType(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key result — parent objective selector */}
      {type === 'key_result' && (
        <div className="goal-form-field">
          <label className="goal-form-label">Parent Objective</label>
          <select
            className="goal-form-select"
            value={parentId}
            onChange={e => setParentId(e.target.value)}
          >
            <option value="">— none —</option>
            {objectives.map(obj => (
              <option key={obj.id} value={obj.id}>{obj.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Numeric-specific fields */}
      {type === 'numeric' && (
        <div className="goal-form-row">
          <div className="goal-form-field">
            <label className="goal-form-label">Target value</label>
            <input
              type="number"
              className="goal-form-input"
              placeholder="e.g. 100"
              value={targetValue}
              min={0}
              onChange={e => setTargetValue(e.target.value)}
            />
          </div>
          <div className="goal-form-field">
            <label className="goal-form-label">Current value</label>
            <input
              type="number"
              className="goal-form-input"
              placeholder="0"
              value={currentValue}
              min={0}
              onChange={e => setCurrentValue(e.target.value)}
            />
          </div>
          <div className="goal-form-field">
            <label className="goal-form-label">Unit</label>
            <input
              className="goal-form-input"
              placeholder="e.g. km"
              value={unit}
              onChange={e => setUnit(e.target.value)}
              maxLength={16}
            />
          </div>
        </div>
      )}

      <div className="goal-form-row">
        <div className="goal-form-field">
          <label className="goal-form-label">Category</label>
          <select className="goal-form-select" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="goal-form-field">
          <label className="goal-form-label">Target date</label>
          <input
            type="date"
            className="goal-form-input"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
          />
        </div>
      </div>

      {/* Linked habits — shown for habit type */}
      {(type === 'habit') && habits.length > 0 && (
        <div className="goal-form-habits">
          <label className="goal-form-label">Linked habits</label>
          <div className="goal-habit-chips">
            {habits.map(h => (
              <button
                key={h.id}
                type="button"
                className={`goal-habit-chip ${linkedHabits.includes(h.id) ? 'selected' : ''}`}
                onClick={() => toggleHabit(h.id)}
              >
                {h.icon} {h.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Milestones editor — available for all types */}
      <MilestoneEditor milestones={milestones} onChange={setMilestones} />

      <div className="goal-form-actions">
        <button className="goal-cancel-btn" onClick={onCancel}>Cancel</button>
        <button className="goal-save-btn" onClick={handleSave} disabled={!title.trim()}>
          {initial ? 'Save changes' : 'Create goal'}
        </button>
      </div>
    </div>
  );
}

function ChallengeForm({ initial, onSave, onCancel }) {
  const [title, setTitle]           = useState(initial?.title || '');
  const [icon, setIcon]             = useState(initial?.icon || '🎯');
  const [description, setDescription] = useState(initial?.description || '');
  const [startDate, setStartDate]   = useState(initial?.startDate || new Date().toISOString().split('T')[0]);
  const [targetDays, setTargetDays] = useState(initial?.targetDays || 30);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), icon, description, startDate, targetDays: Number(targetDays) });
  };

  return (
    <div className="goal-form">
      <div className="goal-form-row">
        <input className="goal-form-input" style={{ flex: '0 0 52px' }} placeholder="🎯" value={icon} onChange={e => setIcon(e.target.value)} maxLength={2} />
        <input className="goal-form-input" placeholder="Challenge title" value={title} onChange={e => setTitle(e.target.value)} maxLength={60} />
      </div>
      <textarea className="goal-form-textarea" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={200} />
      <div className="goal-form-row">
        <div className="goal-form-field">
          <label className="goal-form-label">Start date</label>
          <input type="date" className="goal-form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="goal-form-field">
          <label className="goal-form-label">Target days</label>
          <input type="number" className="goal-form-input" value={targetDays} min={1} max={365} onChange={e => setTargetDays(e.target.value)} />
        </div>
      </div>
      <div className="goal-form-actions">
        <button className="goal-cancel-btn" onClick={onCancel}>Cancel</button>
        <button className="goal-save-btn" onClick={handleSave} disabled={!title.trim()}>
          {initial ? 'Save changes' : 'Create challenge'}
        </button>
      </div>
    </div>
  );
}

function MilestonesChecklist({ milestones, onToggle }) {
  if (!milestones || milestones.length === 0) return null;
  const done = milestones.filter(m => m.done).length;
  return (
    <div className="milestones-checklist">
      <div className="milestones-checklist-header">
        <span className="milestones-checklist-label">Milestones</span>
        <span className="milestones-checklist-count">{done}/{milestones.length}</span>
      </div>
      <div className="milestones-checklist-progress">
        <div
          className="goal-progress-fill"
          style={{
            width: `${milestones.length ? Math.round((done / milestones.length) * 100) : 0}%`,
            backgroundColor: 'var(--gold)',
          }}
        />
      </div>
      <ul className="milestones-list">
        {milestones.map(m => (
          <li key={m.id} className={`milestone-item ${m.done ? 'done' : ''}`}>
            <button
              type="button"
              className="milestone-checkbox"
              onClick={() => onToggle(m.id)}
              aria-label={m.done ? 'Mark incomplete' : 'Mark done'}
            >
              {m.done ? '✓' : ''}
            </button>
            <span className="milestone-text">{m.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GoalCard({ goal, habits, completions, onEdit, onDelete, onComplete, onProgressGoal, allGoals, onAddBonusXP }) {
  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
  const [confirmDelete, setConfirmDelete]   = useState(false);
  const [editing, setEditing]               = useState(false);
  const [milestonesOpen, setMilestonesOpen] = useState(false);
  const [shareCopied, setShareCopied]       = useState(false);

  // Milestone celebration state
  const [showConfetti, setShowConfetti]       = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationText, setCelebrationText] = useState('');

  const goalType = goal.type || 'habit';

  const linkedHabitObjs = useMemo(
    () => habits.filter(h => (goal.linkedHabits || []).includes(h.id)),
    [habits, goal.linkedHabits]
  );

  // Habit-type progress: % of linked habits done today
  const habitProgress = useMemo(() => {
    if (!linkedHabitObjs.length) return 0;
    const done = linkedHabitObjs.filter(h => !!completions[`${h.id}|${y}|${m}|${d}`]).length;
    return Math.round((done / linkedHabitObjs.length) * 100);
  }, [linkedHabitObjs, completions, y, m, d]);

  // Numeric progress
  const numericPct = useMemo(() => {
    if (goalType !== 'numeric' || !goal.targetValue) return 0;
    return Math.min(100, Math.round(((goal.currentValue || 0) / goal.targetValue) * 100));
  }, [goalType, goal.targetValue, goal.currentValue]);

  const dl = deadlineText(goal.targetDate);
  const catColor = CAT_COLORS[goal.category] || 'var(--t3)';
  const milestones = goal.milestones || [];
  const milestonesDone = milestones.filter(ms => ms.done).length;

  const handleToggleMilestone = (msId) => {
    const milestone = milestones.find(ms => ms.id === msId);
    const wasUnchecked = milestone ? !milestone.completed && !milestone.done : false;
    const updated = milestones.map(ms => ms.id === msId ? { ...ms, done: !ms.done } : ms);
    onEdit(goal.id, { milestones: updated });

    // Detect completion (unchecked → checked)
    if (wasUnchecked || (milestone && !milestone.done)) {
      // milestone.done was false, so toggling makes it true
      const wasAlreadyDone = milestone?.done;
      if (!wasAlreadyDone) {
        setShowConfetti(true);
        setCelebrationText(milestone?.text || 'Milestone complete!');
        setShowCelebration(true);
        playChime();
        if (onAddBonusXP) onAddBonusXP(50);
        setTimeout(() => {
          setShowConfetti(false);
          setShowCelebration(false);
        }, 3000);
      }
    }
  };

  const handleNumericChange = (delta) => {
    const next = Math.max(0, (goal.currentValue || 0) + delta);
    onProgressGoal(goal.id, next);
  };

  const handleNumericInput = (val) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) onProgressGoal(goal.id, n);
  };

  const handleShare = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(goal))));
      navigator.clipboard.writeText(encoded).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      });
    } catch (e) {
      // clipboard not available — silently ignore
    }
  };

  if (editing) {
    return (
      <div className="goal-card editing">
        <GoalForm
          initial={goal}
          habits={habits}
          allGoals={allGoals}
          onSave={(data) => { onEdit(goal.id, data); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="goal-card">
      {/* Confetti overlay */}
      {showConfetti && (
        <SimpleConfetti onDone={() => setShowConfetti(false)} />
      )}

      {/* Milestone celebration modal */}
      {showCelebration && (
        <div className="milestone-celebration-modal" onClick={() => setShowCelebration(false)}>
          <div className="milestone-celebration-inner">
            <div className="celebration-icon">🎯</div>
            <h3>{celebrationText}</h3>
            <p>{motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]}</p>
            <div className="xp-badge">+50 XP</div>
          </div>
        </div>
      )}

      {/* Vision board image */}
      {goal.imageData && (
        <img
          src={goal.imageData}
          alt={goal.title}
          className="goal-image-thumb"
          style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
        />
      )}

      <div className="goal-card-header">
        <div className="goal-card-title-row">
          <span className="goal-cat-badge" style={{ backgroundColor: catColor + '22', color: catColor }}>
            {goal.category}
          </span>
          {goal.icon && <span className="goal-card-icon">{goal.icon}</span>}
          <span className="goal-card-title">{goal.title}</span>
          <span className="goal-type-tag goal-type-tag--{goalType}">{goalType}</span>
          {/* Streak badge */}
          {goal.streak > 0 && (
            <span className="goal-streak-badge">🔥 {goal.streak} day streak</span>
          )}
        </div>
        <div className="goal-card-actions">
          {/* Share button */}
          <button
            className="goal-share-btn goal-action-btn"
            onClick={handleShare}
            title="Share goal"
            style={{ position: 'relative' }}
          >
            📤
            {shareCopied && (
              <span
                style={{
                  position: 'absolute',
                  top: '-28px',
                  right: 0,
                  background: 'var(--surface, #1a1a2e)',
                  color: 'var(--green, #34d399)',
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }}
              >
                ✓ Copied!
              </span>
            )}
          </button>
          <button className="goal-action-btn" onClick={() => setEditing(true)} title="Edit">✎</button>
          <button
            className={`goal-action-btn delete ${confirmDelete ? 'confirm' : ''}`}
            onClick={() => {
              if (confirmDelete) { onDelete(goal.id); }
              else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2500); }
            }}
            title={confirmDelete ? 'Confirm delete' : 'Delete'}
          >
            {confirmDelete ? '!' : '×'}
          </button>
        </div>
      </div>

      {goal.description && <p className="goal-description">{goal.description}</p>}

      {/* Habit-type progress */}
      {goalType === 'habit' && linkedHabitObjs.length > 0 && (
        <div className="goal-progress-area">
          <div className="goal-progress-header">
            <span className="goal-progress-label">Today's progress</span>
            <span
              className="goal-progress-pct"
              style={{ color: habitProgress >= 80 ? 'var(--green)' : habitProgress >= 50 ? 'var(--orange)' : 'var(--t2)' }}
            >
              {habitProgress}%
            </span>
          </div>
          <div className="goal-progress-bar">
            <div
              className="goal-progress-fill"
              style={{
                width: `${habitProgress}%`,
                backgroundColor: habitProgress >= 80 ? 'var(--green)' : habitProgress >= 50 ? 'var(--orange)' : 'var(--red)',
              }}
            />
          </div>
          <div className="goal-linked-habits">
            {linkedHabitObjs.map(h => {
              const done = !!completions[`${h.id}|${y}|${m}|${d}`];
              return (
                <span key={h.id} className={`goal-linked-habit ${done ? 'done' : ''}`}>
                  {h.icon} {h.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Numeric progress */}
      {goalType === 'numeric' && (
        <div className="goal-progress-area">
          <div className="goal-progress-header">
            <span className="goal-progress-label">Progress</span>
            <span
              className="goal-progress-pct"
              style={{ color: numericPct >= 80 ? 'var(--green)' : numericPct >= 50 ? 'var(--orange)' : 'var(--t2)' }}
            >
              {numericPct}%
            </span>
          </div>
          <div className="goal-progress-bar">
            <div
              className="goal-progress-fill"
              style={{
                width: `${numericPct}%`,
                backgroundColor: numericPct >= 80 ? 'var(--green)' : numericPct >= 50 ? 'var(--orange)' : 'var(--red)',
              }}
            />
          </div>
          <div className="numeric-progress-controls">
            <button
              className="numeric-btn"
              onClick={() => handleNumericChange(-1)}
              disabled={(goal.currentValue || 0) <= 0}
            >
              −
            </button>
            <input
              type="number"
              className="numeric-input"
              value={goal.currentValue ?? 0}
              min={0}
              onChange={e => handleNumericInput(e.target.value)}
            />
            <span className="numeric-unit">/ {goal.targetValue} {goal.unit}</span>
            <button className="numeric-btn" onClick={() => handleNumericChange(1)}>+</button>
          </div>
        </div>
      )}

      {/* Project type — no automatic progress bar, milestones drive it */}
      {goalType === 'project' && milestones.length === 0 && (
        <p className="goal-project-hint">Add milestones to track project progress.</p>
      )}

      {/* Milestones collapsible */}
      {milestones.length > 0 && (
        <div className="milestones-section">
          <button
            type="button"
            className="milestones-toggle-btn"
            onClick={() => setMilestonesOpen(v => !v)}
          >
            {milestonesOpen ? '▲' : '▼'} Milestones ({milestonesDone}/{milestones.length})
          </button>
          {milestonesOpen && (
            <MilestonesChecklist
              milestones={milestones}
              onToggle={handleToggleMilestone}
            />
          )}
        </div>
      )}

      <div className="goal-card-footer">
        {dl && <span className={`goal-deadline ${dl.cls}`}>{dl.text}</span>}
        <button className="goal-complete-btn" onClick={() => onComplete(goal.id)}>
          Mark complete ✓
        </button>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, onEdit, onDelete, onToggleDay }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing]             = useState(false);
  const [expanded, setExpanded]           = useState(false);

  const completions = challenge.completions || {};
  const totalDone = Object.values(completions).filter(Boolean).length;
  const pct = Math.round((totalDone / challenge.targetDays) * 100);

  let bestStreak = 0;
  let cur = 0;
  for (let i = 0; i < challenge.targetDays; i++) {
    if (completions[String(i)]) { cur++; bestStreak = Math.max(bestStreak, cur); }
    else cur = 0;
  }

  const today = new Date();
  const start = new Date(challenge.startDate);
  const daysPassed = Math.max(0, Math.floor((today - start) / 86400000));
  const daysRemaining = Math.max(0, challenge.targetDays - daysPassed);

  if (editing) {
    return (
      <div className="challenge-card editing">
        <ChallengeForm
          initial={challenge}
          onSave={(data) => { onEdit(challenge.id, data); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="challenge-card">
      <div className="challenge-card-header">
        <div className="challenge-icon-title">
          <span className="challenge-icon">{challenge.icon}</span>
          <div>
            <span className="challenge-title">{challenge.title}</span>
            {challenge.description && <p className="challenge-description">{challenge.description}</p>}
          </div>
        </div>
        <div className="goal-card-actions">
          <button className="goal-action-btn" onClick={() => setEditing(true)} title="Edit">✎</button>
          <button
            className={`goal-action-btn delete ${confirmDelete ? 'confirm' : ''}`}
            onClick={() => {
              if (confirmDelete) { onDelete(challenge.id); }
              else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2500); }
            }}
          >
            {confirmDelete ? '!' : '×'}
          </button>
        </div>
      </div>

      <div className="challenge-stats-row">
        <div className="challenge-stat">
          <span className="challenge-stat-value">{totalDone}</span>
          <span className="challenge-stat-label">Done</span>
        </div>
        <div className="challenge-stat">
          <span className="challenge-stat-value">{bestStreak}</span>
          <span className="challenge-stat-label">Best streak</span>
        </div>
        <div className="challenge-stat">
          <span className="challenge-stat-value">{daysRemaining}</span>
          <span className="challenge-stat-label">Days left</span>
        </div>
        <div className="challenge-stat">
          <span className="challenge-stat-value" style={{ color: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--orange)' : 'var(--t2)' }}>
            {pct}%
          </span>
          <span className="challenge-stat-label">Complete</span>
        </div>
      </div>

      <div className="challenge-progress-bar">
        <div
          className="goal-progress-fill"
          style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--orange)' : 'var(--red)' }}
        />
      </div>

      <button className="challenge-expand-btn" onClick={() => setExpanded(v => !v)}>
        {expanded ? '▲ Hide calendar' : '▼ Show calendar'}
      </button>

      {expanded && (
        <div className="challenge-calendar">
          {Array.from({ length: challenge.targetDays }, (_, i) => {
            const done = !!completions[String(i)];
            const dayDate = new Date(start);
            dayDate.setDate(start.getDate() + i);
            const isFuture = dayDate > today;
            return (
              <button
                key={i}
                className={`challenge-day ${done ? 'done' : ''} ${isFuture ? 'future' : ''}`}
                onClick={() => !isFuture && onToggleDay(challenge.id, i)}
                title={`Day ${i + 1}: ${dayDate.toLocaleDateString()}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TemplatesStrip({ onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="templates-strip">
      <button className="templates-toggle-btn" onClick={() => setOpen(v => !v)}>
        {open ? '▲' : '▼'} Goal templates
      </button>
      {open && (
        <div className="templates-grid">
          {GOAL_TEMPLATES.map((tpl, idx) => {
            const color = CAT_COLORS[tpl.category] || 'var(--t3)';
            return (
              <button
                key={idx}
                className="goal-template-card"
                onClick={() => { onSelect(tpl); setOpen(false); }}
                title={`Use template: ${tpl.title}`}
              >
                <span className="goal-template-icon">{tpl.icon}</span>
                <span className="goal-template-title">{tpl.title}</span>
                <span
                  className="goal-template-cat"
                  style={{ backgroundColor: color + '22', color }}
                >
                  {tpl.category}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Compute a goal's percentage completion for OKR display
function goalPct(goal) {
  if (goal.completed) return 100;
  const type = goal.type || 'habit';
  if (type === 'numeric') {
    if (!goal.targetValue) return 0;
    return Math.min(100, Math.round(((goal.currentValue || 0) / goal.targetValue) * 100));
  }
  const milestones = goal.milestones || [];
  if (milestones.length > 0) {
    const done = milestones.filter(m => m.done).length;
    return Math.round((done / milestones.length) * 100);
  }
  return 0;
}

export default function GoalsView({
  goals, challenges, habits, completions,
  onAddGoal, onEditGoal, onDeleteGoal, onCompleteGoal,
  onAddChallenge, onEditChallenge, onDeleteChallenge, onToggleChallenge,
  onAddBonusXP,
}) {
  const [tab, setTab]           = useState('goals');
  const [showForm, setShowForm] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [okrMode, setOkrMode]   = useState(false);

  const activeGoals    = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  // OKR grouping
  const objectives  = activeGoals.filter(g => g.type === 'objective');
  const keyResults  = activeGoals.filter(g => g.type === 'key_result');
  const otherGoals  = activeGoals.filter(g => g.type !== 'objective' && g.type !== 'key_result');

  // --- Goal streak logic ---
  const handleProgressGoal = (id, newValue) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const today = todayISO();
    const yesterday = yesterdayISO();
    let streak = goal.streak || 0;
    const last = goal.lastProgressDate || '';
    if (last === today) {
      // already logged today — keep streak as-is
    } else if (last === yesterday) {
      streak = streak + 1;
    } else {
      streak = 1;
    }
    onEditGoal(id, { currentValue: newValue, streak, lastProgressDate: today });
  };

  const handleSelectTemplate = (tpl) => {
    setFormInitial({
      title:       tpl.title,
      category:    tpl.category,
      type:        tpl.type || 'habit',
      targetValue: tpl.targetValue,
      unit:        tpl.unit || '',
      icon:        tpl.icon || '',
      currentValue: 0,
      milestones:  [],
      linkedHabits: [],
    });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setFormInitial(null);
  };

  const handleAddGoal = (data) => {
    onAddGoal(data);
    setShowForm(false);
    setFormInitial(null);
  };

  const handleImportGoal = () => {
    const code = window.prompt('Paste share code:');
    if (!code || !code.trim()) return;
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
      decoded.id = `g${Date.now()}`;
      onAddGoal(decoded);
    } catch (e) {
      window.alert('Invalid share code.');
    }
  };

  return (
    <div className="goals-view">
      <div className="goals-header">
        <h2 className="goals-title">Goals</h2>
        <div className="goals-tabs">
          <button
            className={`goals-tab ${tab === 'goals' ? 'active' : ''}`}
            onClick={() => { setTab('goals'); setShowForm(false); setFormInitial(null); }}
          >
            Goals
          </button>
          <button
            className={`goals-tab ${tab === 'challenges' ? 'active' : ''}`}
            onClick={() => { setTab('challenges'); setShowForm(false); setFormInitial(null); }}
          >
            Challenges
          </button>
          {completedGoals.length > 0 && (
            <button
              className={`goals-tab ${tab === 'completed' ? 'active' : ''}`}
              onClick={() => { setTab('completed'); setShowForm(false); setFormInitial(null); }}
            >
              Completed ({completedGoals.length})
            </button>
          )}
        </div>
        <div className="goals-header-actions">
          {tab === 'goals' && (
            <>
              <button
                className="goals-okr-toggle"
                onClick={() => setOkrMode(v => !v)}
                title="Toggle OKR view"
              >
                {okrMode ? 'List' : 'OKR'}
              </button>
              <button className="goals-import-btn" onClick={handleImportGoal} title="Import goal from share code">
                📥
              </button>
              <button className="goals-add-btn" onClick={() => { setFormInitial(null); setShowForm(true); }}>
                + Goal
              </button>
            </>
          )}
          {tab === 'challenges' && (
            <button className="goals-add-btn" onClick={() => { setFormInitial(null); setShowForm(true); }}>
              + Challenge
            </button>
          )}
        </div>
      </div>

      {/* ── Goals tab ── */}
      {tab === 'goals' && (
        <div className="goals-content">
          <TemplatesStrip onSelect={handleSelectTemplate} />

          {showForm && (
            <div className="goal-form-wrap">
              <GoalForm
                initial={formInitial}
                habits={habits}
                allGoals={goals}
                onSave={handleAddGoal}
                onCancel={handleCancelForm}
              />
            </div>
          )}

          {activeGoals.length === 0 && !showForm ? (
            <div className="goals-empty">
              <p>No active goals yet.</p>
              <p>Add a goal or pick a template to get started.</p>
            </div>
          ) : okrMode ? (
            /* ── OKR mode ── */
            <div className="okr-view">
              {objectives.length === 0 && keyResults.length === 0 ? (
                <p className="okr-hint">Create goals of type "Objective" and "Key Result" to use OKR view.</p>
              ) : (
                objectives.map(obj => {
                  const krs = keyResults.filter(kr => kr.parentId === obj.id);
                  const objPct = krs.length
                    ? Math.round(krs.reduce((acc, kr) => acc + goalPct(kr), 0) / krs.length)
                    : 0;
                  return (
                    <div key={obj.id} className="okr-objective">
                      <div className="okr-objective-header">
                        <span className="okr-obj-icon">{obj.icon || '🎯'}</span>
                        <span className="okr-obj-title">{obj.title}</span>
                        <span className="okr-obj-pct" style={{ color: objPct >= 70 ? 'var(--green)' : objPct >= 40 ? 'var(--orange)' : 'var(--t2)' }}>
                          {objPct}%
                        </span>
                      </div>
                      <div className="okr-obj-bar">
                        <div className="goal-progress-fill" style={{ width: `${objPct}%`, backgroundColor: objPct >= 70 ? 'var(--green)' : objPct >= 40 ? 'var(--orange)' : 'var(--red)' }} />
                      </div>
                      <div className="okr-key-results">
                        {krs.length === 0 ? (
                          <p className="okr-no-kr">No key results linked to this objective.</p>
                        ) : (
                          krs.map(kr => {
                            const krPct = goalPct(kr);
                            return (
                              <div key={kr.id} className="okr-kr-row">
                                <span className="okr-kr-icon">{kr.icon || '🔑'}</span>
                                <span className="okr-kr-title">{kr.title}</span>
                                <div className="okr-kr-bar-wrap">
                                  <div className="okr-kr-bar">
                                    <div className="goal-progress-fill" style={{ width: `${krPct}%`, backgroundColor: krPct >= 70 ? 'var(--green)' : krPct >= 40 ? 'var(--orange)' : 'var(--red)' }} />
                                  </div>
                                </div>
                                <span className="okr-kr-pct">{krPct}%</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {otherGoals.length > 0 && (
                <div className="okr-other-goals">
                  <div className="okr-other-label">Other goals</div>
                  {otherGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      habits={habits}
                      completions={completions}
                      onEdit={onEditGoal}
                      onDelete={onDeleteGoal}
                      onComplete={onCompleteGoal}
                      onProgressGoal={handleProgressGoal}
                      allGoals={goals}
                      onAddBonusXP={onAddBonusXP}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── List mode ── */
            <div className="goals-list">
              {activeGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  habits={habits}
                  completions={completions}
                  onEdit={onEditGoal}
                  onDelete={onDeleteGoal}
                  onComplete={onCompleteGoal}
                  onProgressGoal={handleProgressGoal}
                  allGoals={goals}
                  onAddBonusXP={onAddBonusXP}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Challenges tab ── */}
      {tab === 'challenges' && (
        <div className="goals-content">
          {showForm && (
            <div className="goal-form-wrap">
              <ChallengeForm
                initial={formInitial}
                onSave={(data) => { onAddChallenge(data); setShowForm(false); setFormInitial(null); }}
                onCancel={handleCancelForm}
              />
            </div>
          )}
          {challenges.length === 0 && !showForm ? (
            <div className="goals-empty">
              <p>No challenges yet.</p>
              <p>Create a challenge to build streaks over a set period.</p>
            </div>
          ) : (
            <div className="goals-list">
              {challenges.map(c => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  onEdit={onEditChallenge}
                  onDelete={onDeleteChallenge}
                  onToggleDay={onToggleChallenge}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Completed tab ── */}
      {tab === 'completed' && (
        <div className="goals-content">
          <div className="goals-list">
            {completedGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                habits={habits}
                completions={completions}
                onEdit={onEditGoal}
                onDelete={onDeleteGoal}
                onComplete={onCompleteGoal}
                onProgressGoal={handleProgressGoal}
                allGoals={goals}
                onAddBonusXP={onAddBonusXP}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
