import React, { useState, useEffect } from 'react';

export default function ScreenTimeWidget({ dateKey, screenTime, screenGoal, onSetScreenTime, onSetScreenGoal }) {
  const entry = screenTime[dateKey] || {};
  const goal = entry.goal !== undefined ? entry.goal : (screenGoal || 3);
  const actual = entry.actual !== undefined ? entry.actual : '';

  const [localGoal, setLocalGoal] = useState(goal);
  const [localActual, setLocalActual] = useState(actual === '' ? '' : String(actual));
  const [editingGoal, setEditingGoal] = useState(false);

  useEffect(() => {
    const e = screenTime[dateKey] || {};
    setLocalGoal(e.goal !== undefined ? e.goal : (screenGoal || 3));
    setLocalActual(e.actual !== undefined ? String(e.actual) : '');
  }, [dateKey, screenTime, screenGoal]);

  const handleGoalBlur = () => {
    const v = Math.max(1, Math.min(24, Number(localGoal) || 3));
    setLocalGoal(v);
    onSetScreenGoal(v);
    onSetScreenTime(dateKey, { ...entry, goal: v });
    setEditingGoal(false);
  };

  const handleActualBlur = () => {
    const v = localActual === '' ? '' : Math.max(0, Number(localActual) || 0);
    onSetScreenTime(dateKey, { ...entry, goal: localGoal, actual: v });
  };

  const actualNum = parseFloat(localActual);
  const goalNum = parseFloat(localGoal);
  const hasActual = localActual !== '' && !isNaN(actualNum);
  const pct = hasActual ? Math.min(100, Math.round((actualNum / goalNum) * 100)) : 0;
  const over = hasActual && actualNum > goalNum;

  return (
    <div className="screen-time-widget">
      <div className="screen-time-header">
        <span className="widget-label">📱 Screen Time</span>
        {hasActual && (
          <span className={`screen-time-status ${over ? 'over' : 'under'}`}>
            {over ? 'Over goal' : 'Under goal'}
          </span>
        )}
      </div>
      <div className="screen-time-body">
        <div className="screen-time-inputs">
          <div className="screen-time-field">
            <span className="screen-time-field-label">Goal (h)</span>
            {editingGoal ? (
              <input
                type="number"
                className="screen-time-input"
                value={localGoal}
                min="1"
                max="24"
                autoFocus
                onChange={e => setLocalGoal(e.target.value)}
                onBlur={handleGoalBlur}
                onKeyDown={e => e.key === 'Enter' && handleGoalBlur()}
              />
            ) : (
              <button className="screen-time-goal-display" onClick={() => setEditingGoal(true)}>
                {localGoal}h
              </button>
            )}
          </div>
          <div className="screen-time-field">
            <span className="screen-time-field-label">Actual (h)</span>
            <input
              type="number"
              className="screen-time-input"
              value={localActual}
              min="0"
              max="24"
              step="0.5"
              placeholder="—"
              onChange={e => setLocalActual(e.target.value)}
              onBlur={handleActualBlur}
            />
          </div>
        </div>
        {hasActual && (
          <div className="screen-time-bar-wrap">
            <div className="screen-time-bar-track">
              <div
                className="screen-time-bar-fill"
                style={{
                  width: `${pct}%`,
                  backgroundColor: over ? 'var(--red)' : 'var(--green)',
                }}
              />
            </div>
            <span className="screen-time-pct">{actualNum}h / {goalNum}h</span>
          </div>
        )}
      </div>
    </div>
  );
}
