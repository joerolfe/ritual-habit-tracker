import React, { useState, useMemo } from 'react';

const CATEGORIES = ['Health', 'Mind', 'Career', 'Fitness', 'Learning', 'Lifestyle'];
const CAT_COLORS = {
  Health: '#ff6b6b', Mind: '#a78bfa', Career: '#60a5fa',
  Fitness: '#34d399', Learning: '#fbbf24', Lifestyle: '#f472b6',
};

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

function GoalForm({ initial, habits, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || 'Health');
  const [targetDate, setTargetDate] = useState(initial?.targetDate || '');
  const [linkedHabits, setLinkedHabits] = useState(initial?.linkedHabits || []);

  const toggleHabit = (id) => {
    setLinkedHabits(prev => prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), description, category, targetDate, linkedHabits });
  };

  return (
    <div className="goal-form">
      <input className="goal-form-input" placeholder="Goal title" value={title} onChange={e => setTitle(e.target.value)} maxLength={60} />
      <textarea className="goal-form-textarea" placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={2} maxLength={200} />
      <div className="goal-form-row">
        <div className="goal-form-field">
          <label className="goal-form-label">Category</label>
          <select className="goal-form-select" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="goal-form-field">
          <label className="goal-form-label">Target date</label>
          <input type="date" className="goal-form-input" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
        </div>
      </div>
      {habits.length > 0 && (
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
  const [title, setTitle] = useState(initial?.title || '');
  const [icon, setIcon] = useState(initial?.icon || '🎯');
  const [description, setDescription] = useState(initial?.description || '');
  const [startDate, setStartDate] = useState(initial?.startDate || new Date().toISOString().split('T')[0]);
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

function GoalCard({ goal, habits, completions, onEdit, onDelete, onComplete }) {
  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);

  const linkedHabitObjs = useMemo(
    () => habits.filter(h => (goal.linkedHabits || []).includes(h.id)),
    [habits, goal.linkedHabits]
  );

  const progress = useMemo(() => {
    if (!linkedHabitObjs.length) return 0;
    const done = linkedHabitObjs.filter(h => !!completions[`${h.id}|${y}|${m}|${d}`]).length;
    return Math.round((done / linkedHabitObjs.length) * 100);
  }, [linkedHabitObjs, completions, y, m, d]);

  const dl = deadlineText(goal.targetDate);
  const catColor = CAT_COLORS[goal.category] || 'var(--t3)';

  if (editing) {
    return (
      <div className="goal-card editing">
        <GoalForm initial={goal} habits={habits} onSave={(data) => { onEdit(goal.id, data); setEditing(false); }} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="goal-card">
      <div className="goal-card-header">
        <div className="goal-card-title-row">
          <span className="goal-cat-badge" style={{ backgroundColor: catColor + '22', color: catColor }}>{goal.category}</span>
          <span className="goal-card-title">{goal.title}</span>
        </div>
        <div className="goal-card-actions">
          <button className="goal-action-btn" onClick={() => setEditing(true)} title="Edit">✎</button>
          <button
            className={`goal-action-btn delete ${confirmDelete ? 'confirm' : ''}`}
            onClick={() => { if (confirmDelete) { onDelete(goal.id); } else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2500); } }}
            title={confirmDelete ? 'Confirm delete' : 'Delete'}
          >
            {confirmDelete ? '!' : '×'}
          </button>
        </div>
      </div>

      {goal.description && <p className="goal-description">{goal.description}</p>}

      {linkedHabitObjs.length > 0 && (
        <div className="goal-progress-area">
          <div className="goal-progress-header">
            <span className="goal-progress-label">Today's progress</span>
            <span className="goal-progress-pct" style={{ color: progress >= 80 ? 'var(--green)' : progress >= 50 ? 'var(--orange)' : 'var(--t2)' }}>
              {progress}%
            </span>
          </div>
          <div className="goal-progress-bar">
            <div className="goal-progress-fill" style={{
              width: `${progress}%`,
              backgroundColor: progress >= 80 ? 'var(--green)' : progress >= 50 ? 'var(--orange)' : 'var(--red)',
            }} />
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
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const completions = challenge.completions || {};
  const totalDone = Object.values(completions).filter(Boolean).length;
  const pct = Math.round((totalDone / challenge.targetDays) * 100);

  // Count consecutive streak from highest completed
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
        <ChallengeForm initial={challenge} onSave={(data) => { onEdit(challenge.id, data); setEditing(false); }} onCancel={() => setEditing(false)} />
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
            onClick={() => { if (confirmDelete) { onDelete(challenge.id); } else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2500); } }}
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
          <span className="challenge-stat-value" style={{ color: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--orange)' : 'var(--t2)' }}>{pct}%</span>
          <span className="challenge-stat-label">Complete</span>
        </div>
      </div>

      <div className="challenge-progress-bar">
        <div className="goal-progress-fill" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--orange)' : 'var(--red)' }} />
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

export default function GoalsView({
  goals, challenges, habits, completions,
  onAddGoal, onEditGoal, onDeleteGoal, onCompleteGoal,
  onAddChallenge, onEditChallenge, onDeleteChallenge, onToggleChallenge,
}) {
  const [tab, setTab] = useState('goals');
  const [showForm, setShowForm] = useState(false);

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="goals-view">
      <div className="goals-header">
        <h2 className="goals-title">Goals</h2>
        <div className="goals-tabs">
          <button className={`goals-tab ${tab === 'goals' ? 'active' : ''}`} onClick={() => { setTab('goals'); setShowForm(false); }}>Goals</button>
          <button className={`goals-tab ${tab === 'challenges' ? 'active' : ''}`} onClick={() => { setTab('challenges'); setShowForm(false); }}>Challenges</button>
        </div>
      </div>

      {tab === 'goals' && (
        <div className="goals-content">
          {!showForm && (
            <button className="goals-add-btn" onClick={() => setShowForm(true)}>
              + New Goal
            </button>
          )}
          {showForm && (
            <div className="goal-card">
              <GoalForm habits={habits} onSave={(data) => { onAddGoal(data); setShowForm(false); }} onCancel={() => setShowForm(false)} />
            </div>
          )}

          {activeGoals.length === 0 && !showForm && (
            <div className="goals-empty">
              <span className="goals-empty-icon">🎯</span>
              <p>No active goals yet.</p>
              <p className="goals-empty-sub">Create a goal to track your progress.</p>
            </div>
          )}

          {activeGoals.map(g => (
            <GoalCard
              key={g.id}
              goal={g}
              habits={habits}
              completions={completions}
              onEdit={onEditGoal}
              onDelete={onDeleteGoal}
              onComplete={onCompleteGoal}
            />
          ))}

          {completedGoals.length > 0 && (
            <div className="goals-completed-section">
              <h3 className="goals-section-title">Completed</h3>
              {completedGoals.map(g => (
                <div key={g.id} className="goal-card completed">
                  <div className="goal-card-header">
                    <div className="goal-card-title-row">
                      <span className="goal-complete-check">✓</span>
                      <span className="goal-card-title">{g.title}</span>
                    </div>
                    <button className="goal-action-btn delete" onClick={() => onDeleteGoal(g.id)}>×</button>
                  </div>
                  {g.description && <p className="goal-description">{g.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'challenges' && (
        <div className="goals-content">
          {!showForm && (
            <button className="goals-add-btn" onClick={() => setShowForm(true)}>
              + New Challenge
            </button>
          )}
          {showForm && (
            <div className="goal-card">
              <ChallengeForm onSave={(data) => { onAddChallenge(data); setShowForm(false); }} onCancel={() => setShowForm(false)} />
            </div>
          )}

          {challenges.length === 0 && !showForm && (
            <div className="goals-empty">
              <span className="goals-empty-icon">🔥</span>
              <p>No challenges yet.</p>
              <p className="goals-empty-sub">Start a 30-day challenge to build momentum.</p>
            </div>
          )}

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
  );
}
