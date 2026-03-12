import React, { useState, useRef } from 'react';
import { getCurrentStreak } from '../utils/streaks';
import { HABIT_COLORS } from '../utils/constants';
import EmojiPicker from './EmojiPicker';

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAYS_FULL  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORIES = ['fitness', 'mindfulness', 'health', 'learning', 'lifestyle'];
const CAT_LABELS = { fitness: 'Fitness', mindfulness: 'Mindfulness', health: 'Health', learning: 'Learning', lifestyle: 'Lifestyle' };

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

export default function Sidebar({
  open, habits, completions,
  onAdd, onDelete, onEdit, onReorder, onShowStats, onShowTemplates,
  onArchive, archivedHabits, onRestore,
}) {
  const [newName,       setNewName]       = useState('');
  const [newIcon,       setNewIcon]       = useState('⭐');
  const [showNewEmoji,  setShowNewEmoji]  = useState(false);
  const [newDays,       setNewDays]       = useState([0,1,2,3,4,5,6]);
  const [newReminder,   setNewReminder]   = useState('');
  const [newCategory,   setNewCategory]   = useState('');
  const [showNewAdv,    setShowNewAdv]    = useState(false);

  const [editingId,    setEditingId]    = useState(null);
  const [editName,     setEditName]     = useState('');
  const [editColor,    setEditColor]    = useState('');
  const [editIcon,     setEditIcon]     = useState('');
  const [editDays,     setEditDays]     = useState([0,1,2,3,4,5,6]);
  const [editReminder, setEditReminder] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [showEditEmoji, setShowEditEmoji] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  const dragIndex    = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragging,    setIsDragging]    = useState(false);

  /* ── Add ─────────────────────────────────────────────────── */
  const handleAdd = () => {
    const t = newName.trim();
    if (!t) return;
    onAdd(t, undefined, newIcon, newDays.length === 7 ? undefined : newDays, newReminder || null, newCategory || null);
    setNewName(''); setNewIcon('⭐'); setNewDays([0,1,2,3,4,5,6]); setNewReminder(''); setNewCategory(''); setShowNewAdv(false);
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
    setShowEditEmoji(false);
  };
  const confirmEdit = () => {
    const t = editName.trim();
    if (t) onEdit(editingId, t, editColor, editIcon, editDays, editReminder || null, editCategory || null);
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
                        onBlur={confirmEdit}
                        onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      />
                      <button className="icon-btn confirm-btn" onMouseDown={confirmEdit} title="Save">✓</button>
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

        {/* ── Add habit area ── */}
        <div className="add-habit-area">
          <div className="add-habit-top-row">
            <button
              type="button"
              className="new-habit-emoji-btn"
              onClick={() => setShowNewEmoji(v => !v)}
              title="Pick icon"
            >
              {newIcon}
            </button>
            <input
              className="add-habit-input"
              placeholder="New habit name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              maxLength={40}
            />
          </div>
          {showNewEmoji && (
            <EmojiPicker selected={newIcon} onSelect={e => { setNewIcon(e); setShowNewEmoji(false); }} />
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
              <div className="edit-days-row">
                <span className="edit-days-label">Days</span>
                <DaySelector value={newDays} onChange={setNewDays} />
              </div>
              <div className="edit-reminder-row">
                <span className="edit-days-label">Remind</span>
                <input
                  type="time"
                  className="reminder-input"
                  value={newReminder}
                  onChange={e => setNewReminder(e.target.value)}
                />
                {newReminder && (
                  <button type="button" className="reminder-clear" onClick={() => setNewReminder('')}>✕</button>
                )}
              </div>
              <div className="edit-reminder-row">
                <span className="edit-days-label">Category</span>
                <select
                  className="reminder-input"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                >
                  <option value="">None</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </div>
            </div>
          )}

          <button
            className={`add-btn-full ${newName.trim() ? 'active' : ''}`}
            onClick={handleAdd}
            disabled={!newName.trim()}
          >
            {newName.trim() ? `Add "${newName.trim()}"` : '+ New habit'}
          </button>
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
    </aside>
  );
}
