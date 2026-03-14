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

  const statCells = [
    ['Habits', stats.habits],
    ['Completions', stats.completions],
    ['Goals', stats.goals],
    ['Workouts', stats.workouts],
    ['Nutrition Days', stats.nutritionDays],
    ['Sleep Entries', stats.sleepDays],
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111111',
          borderRadius: '24px 24px 0 0',
          padding: '24px',
          width: '100%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Pull indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div style={{ width: '40px', height: '4px', background: '#333', borderRadius: '2px' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <span style={{ fontSize: '22px', color: '#fff', fontFamily: 'Playfair Display, serif', fontWeight: 700 }}>
            Export Data
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '22px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {statCells.map(([label, val]) => (
            <div
              key={label}
              style={{
                background: '#1A1A1A',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '24px', color: '#fff', fontWeight: 700 }}>
                {val.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.5px' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Export JSON button */}
        <button
          onClick={exportJSON}
          style={{
            width: '100%',
            background: '#00BCD4',
            color: '#000',
            border: 'none',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: '12px',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: '40px', lineHeight: 1 }}>📦</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>Export as JSON</div>
            <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', marginTop: '2px' }}>
              Full data dump — habits, sleep, nutrition, workouts
            </div>
          </div>
        </button>

        {/* Export CSV button */}
        <button
          onClick={exportCSV}
          style={{
            width: '100%',
            background: 'transparent',
            color: '#fff',
            border: '1.5px solid #333',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: '40px', lineHeight: 1 }}>📊</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>Export as CSV</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              Habit completion history — opens in Excel or Sheets
            </div>
          </div>
        </button>

        {/* Footer note */}
        <p style={{ fontSize: '12px', color: '#555', textAlign: 'center', marginTop: '16px', marginBottom: 0 }}>
          Your data is stored locally. We never sell your data.
        </p>
      </div>
    </div>
  );
}
