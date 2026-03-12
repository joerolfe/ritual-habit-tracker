import React, { useState, useEffect, useRef, useCallback } from 'react';

const MODES = [
  { id: 'focus',       label: 'Focus',       duration: 25 * 60, color: '#30d158' },
  { id: 'short',       label: 'Short Break', duration:  5 * 60, color: '#ff9f0a' },
  { id: 'long',        label: 'Long Break',  duration: 15 * 60, color: '#0a84ff' },
];

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch {}
}

export default function FocusTimer({ onClose, habits, onToggle }) {
  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();

  const [modeIdx, setModeIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedHabit, setSelectedHabit] = useState('');

  const intervalRef = useRef(null);
  const mode = MODES[modeIdx];

  const switchMode = useCallback((idx) => {
    setModeIdx(idx);
    setSecondsLeft(MODES[idx].duration);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            playBeep();
            if (modeIdx === 0) {
              setSessions(prev => prev + 1);
              if (selectedHabit) {
                onToggle(selectedHabit, y, m, d);
              }
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, modeIdx, selectedHabit, onToggle, y, m, d]);

  const reset = () => {
    setSecondsLeft(mode.duration);
    setRunning(false);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // SVG ring
  const size = 180;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = secondsLeft / mode.duration;
  const offset = circ * (1 - pct);

  return (
    <div className="focus-timer-overlay" onClick={onClose}>
      <div className="focus-timer-modal" onClick={e => e.stopPropagation()}>
        <div className="focus-timer-header">
          <span className="focus-timer-title">Focus Timer</span>
          <button className="focus-timer-close" onClick={onClose}>×</button>
        </div>

        {/* Mode tabs */}
        <div className="focus-mode-tabs">
          {MODES.map((md, i) => (
            <button
              key={md.id}
              className={`focus-mode-tab ${modeIdx === i ? 'active' : ''}`}
              onClick={() => switchMode(i)}
            >
              {md.label}
            </button>
          ))}
        </div>

        {/* Ring */}
        <div className="focus-ring-wrap">
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}
            />
            <circle
              cx={size / 2} cy={size / 2} r={radius}
              fill="none" stroke={mode.color} strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }}
            />
          </svg>
          <div className="focus-ring-inner">
            <span className="focus-time-display">{timeStr}</span>
            <span className="focus-mode-label">{mode.label}</span>
          </div>
        </div>

        {/* Session dots */}
        <div className="focus-sessions">
          {Array.from({ length: Math.max(4, sessions + 1) }, (_, i) => (
            <span key={i} className={`session-dot ${i < sessions ? 'done' : ''}`} />
          ))}
          <span className="focus-sessions-label">{sessions} session{sessions !== 1 ? 's' : ''}</span>
        </div>

        {/* Habit selector */}
        <div className="focus-habit-row">
          <span className="focus-habit-label">Working on</span>
          <select
            className="focus-habit-select"
            value={selectedHabit}
            onChange={e => setSelectedHabit(e.target.value)}
          >
            <option value="">— none —</option>
            {habits.map(h => (
              <option key={h.id} value={h.id}>{h.icon} {h.name}</option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="focus-controls">
          <button className="focus-reset-btn" onClick={reset} title="Reset">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className={`focus-start-btn ${running ? 'pause' : 'start'}`}
            onClick={() => setRunning(r => !r)}
          >
            {running ? 'Pause' : secondsLeft === mode.duration ? 'Start' : 'Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}
