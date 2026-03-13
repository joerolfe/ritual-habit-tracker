import React, { useState, useRef } from 'react';
import { getCurrentStreak } from '../utils/streaks';
import { HABIT_COLORS } from '../utils/constants';
import EmojiPicker from './EmojiPicker';

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAYS_FULL  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORIES = ['fitness', 'mindfulness', 'health', 'learning', 'lifestyle'];
const CAT_LABELS = { fitness: 'Fitness', mindfulness: 'Mindfulness', health: 'Health', learning: 'Learning', lifestyle: 'Lifestyle' };

const STACK_COLORS = ['#c8a96e', '#4d96ff', '#30d158', '#ff9f0a', '#ff453a', '#7c3aed'];

function DaySelector({ value, onChange }) {
  const toggle = (i) => {
    const next = value.includes(i) ? value.filter(d => d !== i) : [...value, i].sort((a, b) => a - b);
    if (next.length > 0) onChange(next);
  };
  return (
    <div className="day-selector">
      {DAYS_SHORT.map((d, i) => (
        <button
          key={i}
          type="button"
          className={`day-btn ${value.includes(i) ? 'on' : ''}`}
          onClick={() => toggle(i)}
          title={DAYS_FULL[i]}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

const EMPTY_FORM = {
  name: '',
  icon: '⭐',
  days: [0,1,2,3,4,5,6],
  reminder: '',
  category: '',
  why: '',
  difficulty: 1,
  frequency: 'daily',
  frequencyTarget: null,
};

export default function Sidebar({
  open, habits, completions,
  onAdd, onDelete, onEdit, onReorder, onShowStats, onShowTemplates,
  onArchive, archivedHabits, onRestore,
  isPremium, onShowPremium,
  stacks = [], onAddStack, onEditStack, onDeleteStack,
}) {
  /* ── Add-habit form state ── */
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showNewEmoji,  setShowNewEmoji]  = useState(false);
  const [showNewAdv,    setShowNewAdv]    = useState(false);

  /* ── Edit-habit state ── */
  const [editingId,    setEditingId]    = useState(null);
  const [editName,     setEditName]     = useState('');
  const [editColor,    setEditColor]    = useState('');
  const [editIcon,     setEditIcon]     = useState('');
  const [editDays,     setEditDays]     = useState([0,1,2,3,4,5,6]);
  const [editReminder, setEditReminder] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editWhy,      setEditWhy]      = useState('');
  const [editDifficulty, setEditDifficulty] = useState(1);
  const [editFrequency,  setEditFrequency]  = useState('daily');
  const [editFrequencyTarget, setEditFrequencyTarget] = useState(null);
  const [showEditEmoji, setShowEditEmoji] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /* ── UI state ── */
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  /* ── Drag state ── */
  const dragIndex    = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragging,    setIsDragging]    = useState(false);

  /* ── Stack modal state ── */
  const [stackModalOpen,    setStackModalOpen]    = useState(false);
  const [editingStackId,    setEditingStackId]    = useState(null);
  const [stackForm, setStackForm] = useState({ name: '', icon: '📚', color: STACK_COLORS[0], habitIds: [] });

  /* ── Add ─────────────────────────────────────────────────── */
  const handleAdd = () => {
    const t = form.name.trim();
    if (!t) return;
    onAdd(t, undefined, form.icon, form.days.length === 7 ? undefined : form.days, form.reminder || null, form.category || null, form.why || null, form.difficulty, form.frequency, form.frequencyTarget);
    setForm({ ...EMPTY_FORM });
    setShowNewAdv(false);
  };

  /* ── Edit ────────────────────────────────────────────────── */
  const startEdit = (habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
    setEditColor(habit.color);
    setEditIcon(habit.icon || '⭐');
    setEditDays(habit.days || [0,1,2,3,4,5,6]);
    setEditReminder(habit.reminderTime || '');
    setEditCategory(habit.category || '');
    setEditWhy(habit.why || '');
    setEditDifficulty(habit.difficulty || 1);
    setEditFrequency(habit.frequency || 'daily');
    setEditFrequencyTarget(habit.frequencyTarget || null);
    setShowEditEmoji(false);
  };
  const confirmEdit = () => {
    const t = editName.trim();
    if (t) onEdit(editingId, t, editColor, editIcon, editDays, editReminder || null, editCategory || null, editWhy || null, editDifficulty, editFrequency, editFrequencyTarget);
    setEditingId(null);
  };
  const cancelEdit = () => setEditingId(null);

  /* ── Delete ──────────────────────────────────────────────── */
  const handleDelete = (id) => {
    if (deleteConfirm === id) { onDelete(id); setDeleteConfirm(null); }
    else { setDeleteConfirm(id); setTimeout(() => setDeleteConfirm(null), 2500); }
  };

  /* ── Drag ────────────────────────────────────────────────── */
  const handleDragStart = (e, index) => {
    dragIndex.current = index; setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e, index) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  };
  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragIndex.current !== null && dragIndex.current !== index)
      onReorder(dragIndex.current, index);
    dragIndex.current = null; setDragOverIndex(null); setIsDragging(false);
  };
  const handleDragEnd = () => {
    dragIndex.current = null; setDragOverIndex(null); setIsDragging(false);
  };

  /* ── Filter ──────────────────────────────────────────────── */
  const filteredHabits = categoryFilter === 'all'
    ? habits
    : habits.filter(h => h.category === categoryFilter);

  const archived = archivedHabits || [];

  /* ── Stack modal helpers ── */
  const openNewStack = () => {
    setEditingStackId(null);
    setStackForm({ name: '', icon: '📚', color: STACK_COLORS[0], habitIds: [] });
    setStackModalOpen(true);
  };
  const openEditStack = (stack) => {
    setEditingStackId(stack.id);
    setStackForm({ name: stack.name, icon: stack.icon, color: stack.color, habitIds: stack.habitIds || [] });
    setStackModalOpen(true);
  };
  const toggleStackHabit = (habitId) => {
    setStackForm(f => ({
      ...f,
      habitIds: f.habitIds.includes(habitId)
        ? f.habitIds.filter(id => id !== habitId)
        : [...f.habitIds, habitId],
    }));
  };
  const saveStack = () => {
    if (!stackForm.name.trim()) return;
    if (editingStackId) {
      onEditStack && onEditStack(editingStackId, { name: stackForm.name, icon: stackForm.icon, color: stackForm.color, habitIds: stackForm.habitIds });
    } else {
      onAddStack && onAddStack({ id: Date.now().toString(), name: stackForm.name, icon: stackForm.icon, color: stackForm.color, habitIds: stackForm.habitIds });
    }
    setStackModalOpen(false);
  };

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      <div className="sidebar-inner">
        <div className="sidebar-top-bar">
          <span className="sidebar-label">Habits</span>
          <button className="sidebar-library-btn" onClick={onShowTemplates} title="Habit Library">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h4v10H2zM6 3h4v10H6zM10 3h4v10h-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            </svg>
            Library
          </button>
        </div>

        {/* ── Category filter tabs ── */}
        <div className="sidebar-cat-tabs">
          <button
            className={`sidebar-cat-tab ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >All</button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`sidebar-cat-tab ${categoryFilter === c ? 'active' : ''}`}
              onClick={() => setCategoryFilter(c)}
            >{CAT_LABELS[c]}</button>
          ))}
        </div>

        <div className={`habit-list ${isDragging ? 'is-dragging' : ''}`}>
          {filteredHabits.length === 0 && habits.length === 0 && (
            <div className="sidebar-empty">No habits yet.<br />Add one below or browse the library.</div>
          )}
          {filteredHabits.length === 0 && habits.length > 0 && (
            <div className="sidebar-empty">No habits in this category.</div>
          )}

          {filteredHabits.map((habit, index) => {
            const streak = getCurrentStreak(habit.id, completions, habit);
            const realIndex = habits.indexOf(habit);
            return (
              <div
                key={habit.id}
                className={[
                  'habit-item',
                  dragOverIndex === realIndex && dragIndex.current !== realIndex ? 'drag-over' : '',
                  dragIndex.current === realIndex ? 'dragging' : '',
                ].join(' ')}
                draggable={editingId !== habit.id}
                onDragStart={e => handleDragStart(e, realIndex)}
                onDragOver={e => handleDragOver(e, realIndex)}
                onDrop={e => handleDrop(e, realIndex)}
                onDragEnd={handleDragEnd}
              >
                {editingId === habit.id ? (
                  <div className="habit-edit-col">
                    {/* Emoji + color row */}
                    <div className="edit-icon-color-row">
                      <button
                        type="button"
                        className="edit-emoji-btn"
                        onClick={() => setShowEditEmoji(v => !v)}
                      >
                        {editIcon}
                      </button>
                      <div className="color-picker-row">
                        {HABIT_COLORS.map(c => (
                          <button
                            key={c}
                            className={`color-swatch ${editColor === c ? 'selected' : ''}`}
                            style={{ backgroundColor: c }}
                            onMouseDown={() => setEditColor(c)}
                            type="button"
                          />
                        ))}
                        <input
                          type="color"
                          className="color-picker-custom"
                          value={editColor || '#ffffff'}
                          onChange={e => setEditColor(e.target.value)}
                          title="Custom color"
                        />
                      </div>
                    </div>
                    {showEditEmoji && (
                      <EmojiPicker selected={editIcon} onSelect={e => { setEditIcon(e); setShowEditEmoji(false); }} />
                    )}
                    <div className="habit-edit-row">
                      <input
                        className="habit-edit-input"
                        value={editName}
                        autoFocus
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      />
                      <button className="icon-btn confirm-btn" onMouseDown={confirmEdit} title="Save">✓</button>
                    </div>

                    {/* Why field */}
                    <div className="edit-reminder-row">
                      <span className="edit-days-label">Why</span>
                      <input
                        type="text"
                        className="reminder-input"
                        placeholder="Why is this habit important to you?"
                        value={editWhy}
                        onChange={e => setEditWhy(e.target.value)}
                      />
                    </div>

                    {/* Difficulty selector */}
                    <div className="edit-reminder-row">
                      <span className="edit-days-label">Difficulty</span>
                      <div className="difficulty-selector">
                        {[1,2,3].map(d => (
                          <button
                            key={d}
                            type="button"
                            className={`diff-btn ${editDifficulty === d ? 'active' : ''}`}
                            onClick={() => setEditDifficulty(d)}
                          >
                            {'🔥'.repeat(d)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Frequency selector */}
                    <div className="edit-reminder-row frequency-field">
                      <span className="edit-days-label">Frequency</span>
                      <div className="frequency-controls">
                        <select
                          className="reminder-input"
                          value={editFrequency}
                          onChange={e => { setEditFrequency(e.target.value); setEditFrequencyTarget(null); }}
                        >
                          <option value="daily">Daily</option>
                          <option value="specific">Specific days</option>
                          <option value="weekly">X times per week</option>
                          <option value="monthly">X times per month</option>
                        </select>
                        {editFrequency === 'weekly' && (
                          <input
                            type="number"
                            className="reminder-input"
                            min="2"
                            max="6"
                            value={editFrequencyTarget || 3}
                            onChange={e => setEditFrequencyTarget(parseInt(e.target.value))}
                          />
                        )}
                        {editFrequency === 'monthly' && (
                          <input
                            type="number"
                            className="reminder-input"
                            min="1"
                            max="28"
                            value={editFrequencyTarget || 10}
                            onChange={e => setEditFrequencyTarget(parseInt(e.target.value))}
                          />
                        )}
                      </div>
                    </div>

                    <div className="edit-days-row">
                      <span className="edit-days-label">Schedule</span>
                      <DaySelector value={editDays} onChange={setEditDays} />
                    </div>
                    <div className="edit-reminder-row">
                      <span className="edit-days-label">Reminder</span>
                      <input
                        type="time"
                        className="reminder-input"
                        value={editReminder}
                        onChange={e => setEditReminder(e.target.value)}
                      />
                      {editReminder && (
                        <button type="button" className="reminder-clear" onClick={() => setEditReminder('')}>✕</button>
                      )}
                    </div>
                    <div className="edit-reminder-row">
                      <span className="edit-days-label">Category</span>
                      <select
                        className="reminder-input"
                        value={editCategory}
                        onChange={e => setEditCategory(e.target.value)}
                      >
                        <option value="">None</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="drag-handle" title="Drag to reorder">
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                        <circle cx="2" cy="2"  r="1.2" fill="currentColor"/>
                        <circle cx="6" cy="2"  r="1.2" fill="currentColor"/>
                        <circle cx="2" cy="7"  r="1.2" fill="currentColor"/>
                        <circle cx="6" cy="7"  r="1.2" fill="currentColor"/>
                        <circle cx="2" cy="12" r="1.2" fill="currentColor"/>
                        <circle cx="6" cy="12" r="1.2" fill="currentColor"/>
                      </svg>
                    </span>

                    <span className="habit-icon-badge" style={{ color: habit.color }}>
                      {habit.icon || <span className="habit-color-dot" style={{ backgroundColor: habit.color }} />}
                    </span>

                    <div className="habit-item-main">
                      <span className="habit-item-name">{habit.name}</span>
                      {habit.days && habit.days.length < 7 && (
                        <span className="habit-schedule-pill">{habit.days.length}×/wk</span>
                      )}
                    </div>

                    {streak > 0 && (
                      <span className="habit-streak-pill" title={`${streak}-day streak`}>
                        {streak > 1 ? `🔥${streak}` : '🔥'}
                      </span>
                    )}

                    <div className="habit-actions">
                      <button className="icon-btn stats-btn" onClick={() => onShowStats(habit)} title="Stats">
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <rect x="0"   y="7" width="3"  height="5" rx="1" fill="currentColor"/>
                          <rect x="4.5" y="4" width="3"  height="8" rx="1" fill="currentColor"/>
                          <rect x="9"   y="1" width="3"  height="11" rx="1" fill="currentColor"/>
                        </svg>
                      </button>
                      <button className="icon-btn edit-btn" onClick={() => startEdit(habit)} title="Edit">✎</button>
                      {onArchive && (
                        <button
                          className="icon-btn archive-btn"
                          onClick={() => onArchive(habit.id)}
                          title="Archive"
                        >
                          📦
                        </button>
                      )}
                      <button
                        className={`icon-btn delete-btn ${deleteConfirm === habit.id ? 'confirm' : ''}`}
                        onClick={() => handleDelete(habit.id)}
                        title={deleteConfirm === habit.id ? 'Confirm delete' : 'Delete'}
                      >
                        {deleteConfirm === habit.id ? '!' : '×'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Freemium limit banner ── */}
        {!isPremium && habits.length >= 5 && (
          <div className="freemium-limit-banner">
            <div className="freemium-limit-title">Free plan: 5 habit limit</div>
            <div className="freemium-limit-sub">Upgrade to Premium for unlimited habits</div>
            <button className="freemium-upgrade-btn" onClick={onShowPremium}>👑 Upgrade</button>
          </div>
        )}

        {/* ── Add habit area ── */}
        <div className={`add-habit-area ${!isPremium && habits.length >= 5 ? 'locked' : ''}`}>
          <div className="add-habit-top-row">
            <button
              type="button"
              className="new-habit-emoji-btn"
              onClick={() => setShowNewEmoji(v => !v)}
              title="Pick icon"
            >
              {form.icon}
            </button>
            <input
              className="add-habit-input"
              placeholder="New habit name..."
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              maxLength={40}
            />
          </div>
          {showNewEmoji && (
            <EmojiPicker selected={form.icon} onSelect={e => { setForm(f => ({ ...f, icon: e })); setShowNewEmoji(false); }} />
          )}

          <button
            className="add-adv-toggle"
            type="button"
            onClick={() => setShowNewAdv(v => !v)}
          >
            {showNewAdv ? '▲ Less options' : '▼ Schedule & reminder'}
          </button>

          {showNewAdv && (
            <div className="new-habit-adv">
              {/* Why field */}
              <div className="edit-reminder-row">
                <span className="edit-days-label">Why</span>
                <input
                  type="text"
                  className="reminder-input"
                  placeholder="Why is this habit important to you?"
                  value={form.why || ''}
                  onChange={e => setForm(f => ({ ...f, why: e.target.value }))}
                />
              </div>

              {/* Difficulty selector */}
              <div className="edit-reminder-row">
                <span className="edit-days-label">Difficulty</span>
                <div className="difficulty-selector">
                  {[1,2,3].map(d => (
                    <button
                      key={d}
                      type="button"
                      className={`diff-btn ${form.difficulty === d ? 'active' : ''}`}
                      onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                    >
                      {'🔥'.repeat(d)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency selector */}
              <div className="edit-reminder-row frequency-field">
                <span className="edit-days-label">Frequency</span>
                <div className="frequency-controls">
                  <select
                    className="reminder-input"
                    value={form.frequency || 'daily'}
                    onChange={e => setForm(f => ({ ...f, frequency: e.target.value, frequencyTarget: null }))}
                  >
                    <option value="daily">Daily</option>
                    <option value="specific">Specific days</option>
                    <option value="weekly">X times per week</option>
                    <option value="monthly">X times per month</option>
                  </select>
                  {form.frequency === 'weekly' && (
                    <input
                      type="number"
                      className="reminder-input"
                      min="2"
                      max="6"
                      value={form.frequencyTarget || 3}
                      onChange={e => setForm(f => ({ ...f, frequencyTarget: parseInt(e.target.value) }))}
                    />
                  )}
                  {form.frequency === 'monthly' && (
                    <input
                      type="number"
                      className="reminder-input"
                      min="1"
                      max="28"
                      value={form.frequencyTarget || 10}
                      onChange={e => setForm(f => ({ ...f, frequencyTarget: parseInt(e.target.value) }))}
                    />
                  )}
                </div>
              </div>

              <div className="edit-days-row">
                <span className="edit-days-label">Days</span>
                <DaySelector value={form.days} onChange={days => setForm(f => ({ ...f, days }))} />
              </div>
              <div className="edit-reminder-row">
                <span className="edit-days-label">Remind</span>
                <input
                  type="time"
                  className="reminder-input"
                  value={form.reminder}
                  onChange={e => setForm(f => ({ ...f, reminder: e.target.value }))}
                />
                {form.reminder && (
                  <button type="button" className="reminder-clear" onClick={() => setForm(f => ({ ...f, reminder: '' }))}>✕</button>
                )}
              </div>
              <div className="edit-reminder-row">
                <span className="edit-days-label">Category</span>
                <select
                  className="reminder-input"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">None</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </div>
            </div>
          )}

          <button
            className={`add-btn-full ${form.name.trim() ? 'active' : ''}`}
            onClick={handleAdd}
            disabled={!form.name.trim()}
          >
            {form.name.trim() ? `Add "${form.name.trim()}"` : '+ New habit'}
          </button>
        </div>

        {/* ── Stacks section ── */}
        <div className="stacks-section">
          <div className="stacks-header">
            <span>Stacks</span>
            <button onClick={openNewStack}>+ New Stack</button>
          </div>
          {stacks.map(stack => (
            <div key={stack.id} className="stack-card" style={{ borderLeft: `3px solid ${stack.color}` }}>
              <span>{stack.icon} {stack.name}</span>
              <span className="stack-habit-count">{stack.habitIds?.length || 0} habits</span>
              <button onClick={() => openEditStack(stack)}>✏️</button>
              <button onClick={() => onDeleteStack && onDeleteStack(stack.id)}>🗑️</button>
            </div>
          ))}
        </div>

        {/* ── Archived section ── */}
        {archived.length > 0 && (
          <div className="sidebar-archived-section">
            <button
              className="archived-toggle-btn"
              onClick={() => setArchivedExpanded(v => !v)}
            >
              <span>📦 Archived ({archived.length})</span>
              <span>{archivedExpanded ? '▲' : '▼'}</span>
            </button>
            {archivedExpanded && (
              <div className="archived-list">
                {archived.map(habit => (
                  <div key={habit.id} className="archived-item">
                    <span className="habit-icon-badge" style={{ color: habit.color }}>{habit.icon}</span>
                    <span className="archived-item-name">{habit.name}</span>
                    <button
                      className="restore-btn"
                      onClick={() => onRestore && onRestore(habit.id)}
                      title="Restore"
                    >
                      ↩ Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            {habits.length} {habits.length === 1 ? 'habit' : 'habits'} tracked
          </div>
        </div>
      </div>

      {/* ── Stack modal ── */}
      {stackModalOpen && (
        <div className="stack-modal-overlay" onClick={() => setStackModalOpen(false)}>
          <div className="stack-modal" onClick={e => e.stopPropagation()}>
            <div className="stack-modal-header">
              <span>{editingStackId ? 'Edit Stack' : 'New Stack'}</span>
              <button className="stack-modal-close" onClick={() => setStackModalOpen(false)}>✕</button>
            </div>

            <div className="stack-modal-body">
              <div className="stack-field-row">
                <label>Icon</label>
                <input
                  type="text"
                  className="stack-icon-input"
                  value={stackForm.icon}
                  onChange={e => setStackForm(f => ({ ...f, icon: e.target.value }))}
                  maxLength={2}
                  placeholder="📚"
                />
              </div>

              <div className="stack-field-row">
                <label>Name</label>
                <input
                  type="text"
                  className="stack-name-input"
                  placeholder="Stack name"
                  value={stackForm.name}
                  onChange={e => setStackForm(f => ({ ...f, name: e.target.value }))}
                  maxLength={40}
                />
              </div>

              <div className="stack-field-row">
                <label>Color</label>
                <div className="stack-color-picker">
                  {STACK_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`stack-color-swatch ${stackForm.color === c ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setStackForm(f => ({ ...f, color: c }))}
                    />
                  ))}
                </div>
              </div>

              <div className="stack-field-row stack-habits-field">
                <label>Habits</label>
                <div className="stack-habit-checkboxes">
                  {habits.map(habit => (
                    <label key={habit.id} className="stack-habit-checkbox-label">
                      <input
                        type="checkbox"
                        checked={stackForm.habitIds.includes(habit.id)}
                        onChange={() => toggleStackHabit(habit.id)}
                      />
                      <span style={{ color: habit.color }}>{habit.icon}</span>
                      {habit.name}
                    </label>
                  ))}
                  {habits.length === 0 && (
                    <span className="stack-no-habits">No habits yet. Add habits first.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="stack-modal-footer">
              <button
                className="stack-save-btn"
                onClick={saveStack}
                disabled={!stackForm.name.trim()}
              >
                Save Stack
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
