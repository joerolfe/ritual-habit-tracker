import React, { useMemo } from 'react';

export default function ExportModal({ habits, completions, goals, workouts, nutrition, sleep, wellbeing, moods, water, onClose }) {
  const stats = useMemo(() => ({
    habits: habits?.length || 0,
    completions: Object.keys(completions || {}).filter(k => completions[k]).length,
    goals: goals?.length || 0,
    workouts: workouts?.length || 0,
    nutritionDays: Object.keys(nutrition || {}).length,
    sleepDays: Object.keys(sleep || {}).length,
    wellbeingDays: Object.keys(wellbeing || {}).length,
    moodDays: Object.keys(moods || {}).length,
  }), [habits, completions, goals, workouts, nutrition, sleep, wellbeing, moods]);

  const exportJSON = () => {
    const data = { habits, completions, goals, workouts, nutrition, sleep, wellbeing, moods, water, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ritual_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    // Build CSV: Date, HabitName, Completed
    const rows = [['Date', 'Habit', 'Completed']];
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const y = d.getFullYear(), m = d.getMonth(), dd = d.getDate();
      const dateStr = d.toISOString().split('T')[0];
      (habits || []).forEach(h => {
        const scheduled = !h.days || h.days.includes(d.getDay());
        if (scheduled) {
          rows.push([dateStr, h.name, completions[`${h.id}|${y}|${m}|${dd}`] ? 'Yes' : 'No']);
        }
      });
    }
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ritual_habits_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={e => e.stopPropagation()}>
        <div className="export-modal-header">
          <h2 className="export-modal-title">Export Your Data</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <p className="export-modal-desc">Download a copy of all your Ritual data. Your data belongs to you.</p>

        <div className="export-stats">
          {[
            ['Habits', stats.habits],
            ['Completions', stats.completions],
            ['Goals', stats.goals],
            ['Workouts', stats.workouts],
            ['Nutrition days', stats.nutritionDays],
            ['Sleep entries', stats.sleepDays],
          ].map(([label, val]) => (
            <div key={label} className="export-stat">
              <span className="export-stat-val">{val.toLocaleString()}</span>
              <span className="export-stat-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="export-buttons">
          <button className="export-btn json" onClick={exportJSON}>
            <span className="export-btn-icon">📦</span>
            <div>
              <div className="export-btn-title">Export as JSON</div>
              <div className="export-btn-sub">All data — habits, sleep, nutrition, workouts, goals</div>
            </div>
          </button>
          <button className="export-btn csv" onClick={exportCSV}>
            <span className="export-btn-icon">📊</span>
            <div>
              <div className="export-btn-title">Export as CSV</div>
              <div className="export-btn-sub">Habit completion history — opens in Excel/Sheets</div>
            </div>
          </button>
        </div>

        <p className="export-gdpr-note">Your data is stored locally on your device. We never sell or share your personal data.</p>
      </div>
    </div>
  );
}
