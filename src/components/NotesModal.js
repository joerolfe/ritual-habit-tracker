import React, { useState } from 'react';

export default function NotesModal({ habit, dateLabel, existingNote, onSave, onClose }) {
  const [text, setText] = useState(existingNote || '');

  const handleSave = () => {
    onSave(text.trim());
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="notes-modal" onClick={e => e.stopPropagation()}>
        <div className="notes-modal-header">
          <span className="notes-habit-icon">{habit.icon || '📝'}</span>
          <div className="notes-modal-info">
            <span className="notes-habit-name">{habit.name}</span>
            <span className="notes-date">{dateLabel}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <textarea
          className="notes-textarea"
          placeholder="How did it go? Add a quick note..."
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
          maxLength={300}
          rows={4}
        />

        <div className="notes-modal-footer">
          <span className="notes-char-count">{text.length}/300</span>
          <div className="notes-actions">
            <button className="notes-cancel-btn" onClick={onClose}>Cancel</button>
            <button className="notes-save-btn" onClick={handleSave}>Save Note</button>
          </div>
        </div>
      </div>
    </div>
  );
}
