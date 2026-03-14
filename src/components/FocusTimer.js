import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const MODES = [
  { id: 'focus',       label: 'Focus',       duration: 25 * 60, color: '#FF8C42' },
  { id: 'short',       label: 'Short Break', duration:  5 * 60, color: '#FFA726' },
  { id: 'long',        label: 'Long Break',  duration: 15 * 60, color: '#00BCD4' },
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
  const size = 260;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = secondsLeft / mode.duration;
  const offset = circ * (1 - pct);

  // Starfield: 80 stars with deterministic positions
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => {
      const x = (i * 137.5) % 100;
      const y = (i * 97.3 + 13.7) % 100;
      const opacity = 0.3 + ((i * 53) % 100) / 200; // 0.3–0.8
      const size = 1 + ((i * 31) % 3); // 1–3px
      return { x, y, opacity, size };
    });
  }, []);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Starfield */}
      {stars.map((star, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: '50%',
            background: '#ffffff',
            opacity: star.opacity,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          color: '#888888',
          fontSize: 24,
          cursor: 'pointer',
          zIndex: 10,
          borderRadius: '50%',
        }}
      >
        ×
      </button>

      {/* Inner content — stop propagation so clicks don't close */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          position: 'relative',
          zIndex: 5,
          width: '100%',
          maxWidth: 360,
          padding: '0 24px',
          boxSizing: 'border-box',
        }}
      >
        {/* Mode tabs */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            background: '#0D0D0D',
            padding: 4,
            borderRadius: 32,
          }}
        >
          {MODES.map((md, i) => (
            <button
              key={md.id}
              onClick={() => switchMode(i)}
              style={{
                padding: '8px 16px',
                borderRadius: 28,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                background: modeIdx === i ? '#FF8C42' : '#1A1A1A',
                color: modeIdx === i ? '#000000' : '#888888',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {md.label}
            </button>
          ))}
        </div>

        {/* SVG Ring */}
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg
            width={size}
            height={size}
            style={{ transform: 'rotate(-90deg)', display: 'block' }}
          >
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={stroke}
            />
            {/* Progress */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={mode.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'none' }}
            />
          </svg>
          {/* Centered text inside ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 56,
                fontWeight: 700,
                fontFamily: 'monospace',
                color: '#ffffff',
                lineHeight: 1,
                letterSpacing: 2,
              }}
            >
              {timeStr}
            </span>
            <span
              style={{
                fontSize: 13,
                color: '#888888',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              {mode.label}
            </span>
          </div>
        </div>

        {/* Session dots */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {Array.from({ length: Math.max(4, sessions + 1) }, (_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: i < sessions ? '#FF8C42' : '#1A1A1A',
                border: i < sessions ? 'none' : '1px solid #333',
              }}
            />
          ))}
          <span
            style={{
              fontSize: 13,
              color: '#888888',
              fontFamily: 'Inter, sans-serif',
              marginLeft: 4,
            }}
          >
            {sessions} session{sessions !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Habit linker */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: '#888888',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: 0.5,
            }}
          >
            Link to habit
          </span>
          <select
            value={selectedHabit}
            onChange={e => setSelectedHabit(e.target.value)}
            style={{
              width: '100%',
              height: 44,
              background: '#111111',
              border: '1px solid #333333',
              borderRadius: 10,
              color: '#ffffff',
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              padding: '0 12px',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
              accentColor: '#00BCD4',
            }}
          >
            <option value="">— none —</option>
            {habits.map(h => (
              <option key={h.id} value={h.id}>{h.icon} {h.name}</option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          {/* Reset button */}
          <button
            onClick={reset}
            title="Reset"
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'none',
              border: '2px solid #333333',
              color: '#888888',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Start / Pause button */}
          <button
            onClick={() => setRunning(r => !r)}
            style={{
              width: 140,
              height: 64,
              borderRadius: 32,
              background: '#00BCD4',
              border: 'none',
              color: '#000000',
              fontSize: 18,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              letterSpacing: 0.5,
            }}
          >
            {running ? 'Pause' : secondsLeft === mode.duration ? 'Start' : 'Resume'}
          </button>
        </div>
      </div>
    </div>
  );
}
