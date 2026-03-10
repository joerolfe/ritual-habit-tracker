import React, { useState, useRef } from 'react';
import { getCurrentStreak } from '../utils/streaks';
import { HABIT_COLORS } from '../App';

export default function Sidebar({ open, habits, completions, onAdd, onDelete, onEdit, onReorder, onShowStats }) {
  const [newName,      setNewName]      = useState('');
  const [editingId,    setEditingId]    = useState(null);
  const [editingName,  setEditingName]  = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Drag state
  const dragIndex    = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [isDragging,    setIsDragging]    = useState(false);

  /* ── CRUD ──────────────────────────────────────────────── */
  const handleAdd = () => {
    const t = newName.trim();
    if (t) { onAdd(t); setNewName(''); }
  };

  const startEdit = (habit) => {
    setEditingId(habit.id);
    setEditingName(habit.name);
    setEditingColor(habit.color);
  };

  const confirmEdit = () => {
    const t = editingName.trim();
    if (t) onEdit(editingId, t, editingColor);
    setEditingId(null); setEditingName(''); setEditingColor('');
  };
  const cancelEdit = () => { setEditingId(null); setEditingName(''); setEditingColor(''); };

  const handleKeyDown = (e, onEnter, onEsc) => {
    if (e.key === 'Enter') onEnter();
    if (e.key === 'Escape' && onEsc) onEsc();
  };

  const handleDelete = (id) => {
    if (deleteConfirm === id) { onDelete(id); setDeleteConfirm(null); }
    else { setDeleteConfirm(id); setTimeout(() => setDeleteConfirm(null), 2500); }
  };

  /* ── Drag ──────────────────────────────────────────────── */
  const handleDragStart = (e, index) => {
    dragIndex.current = index;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(e.currentTarget, 12, 18);
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      <div className="sidebar-inner">
        <div className="sidebar-label">Habits</div>

        <div className={`habit-list ${isDragging ? 'is-dragging' : ''}`}>
          {habits.length === 0 && (
            <div className="sidebar-empty">No habits yet.<br />Add one below to start.</div>
          )}

          {habits.map((habit, index) => {
            const streak = getCurrentStreak(habit.id, completions);
            return (
              <div
                key={habit.id}
                className={[
                  'habit-item',
                  dragOverIndex === index && dragIndex.current !== index ? 'drag-over' : '',
                  dragIndex.current === index ? 'dragging' : '',
                ].join(' ')}
                draggable={editingId !== habit.id}
                onDragStart={e => handleDragStart(e, index)}
                onDragOver={e => handleDragOver(e, index)}
                onDrop={e => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                {editingId === habit.id ? (
                  <div className="habit-edit-col">
                    {/* Color picker */}
                    <div className="color-picker-row">
                      {HABIT_COLORS.map(c => (
                        <button
                          key={c}
                          className={`color-swatch ${editingColor === c ? 'selected' : ''}`}
                          style={{ backgroundColor: c }}
                          onMouseDown={() => setEditingColor(c)}
                          type="button"
                        />
                      ))}
                    </div>
                    <div className="habit-edit-row">
                      <input
                        className="habit-edit-input"
                        value={editingName}
                        autoFocus
                        onChange={e => setEditingName(e.target.value)}
                        onBlur={confirmEdit}
                        onKeyDown={e => handleKeyDown(e, confirmEdit, cancelEdit)}
                      />
                      <button className="icon-btn confirm-btn" onMouseDown={confirmEdit} title="Save">✓</button>
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

                    {/* Colored dot */}
                    <span className="habit-color-dot" style={{ backgroundColor: habit.color }} />

                    <span className="habit-item-name">{habit.name}</span>

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

        <div className="add-habit-area">
          <input
            className="add-habit-input"
            placeholder="Add a habit..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => handleKeyDown(e, handleAdd)}
            maxLength={40}
          />
          <button
            className={`add-btn-full ${newName.trim() ? 'active' : ''}`}
            onClick={handleAdd}
            disabled={!newName.trim()}
          >
            {newName.trim() ? `Add "${newName.trim()}"` : '+ New habit'}
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            {habits.length} {habits.length === 1 ? 'habit' : 'habits'} tracked
          </div>
        </div>
      </div>
    </aside>
  );
}
