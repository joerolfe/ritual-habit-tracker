import React, { useState, useEffect, useRef, useMemo } from 'react';

// ─── Exercise Library ────────────────────────────────────────────────────────
const EXERCISES = [
  // Strength
  { id: 'bench',    name: 'Bench Press',       category: 'Strength',    muscles: 'Chest, Triceps' },
  { id: 'squat',    name: 'Squat',             category: 'Strength',    muscles: 'Quads, Glutes' },
  { id: 'deadlift', name: 'Deadlift',          category: 'Strength',    muscles: 'Hamstrings, Back' },
  { id: 'pullup',   name: 'Pull-up',           category: 'Strength',    muscles: 'Lats, Biceps' },
  { id: 'ohp',      name: 'Shoulder Press',    category: 'Strength',    muscles: 'Shoulders, Triceps' },
  { id: 'row',      name: 'Row',               category: 'Strength',    muscles: 'Back, Biceps' },
  { id: 'curl',     name: 'Bicep Curl',        category: 'Strength',    muscles: 'Biceps' },
  { id: 'tricdip',  name: 'Tricep Dip',        category: 'Strength',    muscles: 'Triceps, Chest' },
  { id: 'legpress', name: 'Leg Press',         category: 'Strength',    muscles: 'Quads, Glutes' },
  { id: 'calf',     name: 'Calf Raise',        category: 'Strength',    muscles: 'Calves' },
  { id: 'plank',    name: 'Plank',             category: 'Strength',    muscles: 'Core' },
  { id: 'lunge',    name: 'Lunge',             category: 'Strength',    muscles: 'Quads, Glutes' },
  // Cardio
  { id: 'run',      name: 'Running',           category: 'Cardio',      muscles: 'Full Body' },
  { id: 'cycle',    name: 'Cycling',           category: 'Cardio',      muscles: 'Legs, Cardio' },
  { id: 'swim',     name: 'Swimming',          category: 'Cardio',      muscles: 'Full Body' },
  { id: 'jumprope', name: 'Jump Rope',         category: 'Cardio',      muscles: 'Calves, Cardio' },
  { id: 'rowmach',  name: 'Rowing Machine',    category: 'Cardio',      muscles: 'Back, Arms, Legs' },
  { id: 'stair',    name: 'Stair Climber',     category: 'Cardio',      muscles: 'Legs, Cardio' },
  // HIIT
  { id: 'burpee',   name: 'Burpees',           category: 'HIIT',        muscles: 'Full Body' },
  { id: 'mtnclmb',  name: 'Mountain Climbers', category: 'HIIT',        muscles: 'Core, Shoulders' },
  { id: 'jsquat',   name: 'Jump Squat',        category: 'HIIT',        muscles: 'Quads, Glutes' },
  { id: 'boxjump',  name: 'Box Jump',          category: 'HIIT',        muscles: 'Legs, Power' },
  { id: 'batrope',  name: 'Battle Ropes',      category: 'HIIT',        muscles: 'Arms, Shoulders, Core' },
  // Flexibility
  { id: 'yoga',     name: 'Yoga Flow',         category: 'Flexibility', muscles: 'Full Body' },
  { id: 'foam',     name: 'Foam Rolling',      category: 'Flexibility', muscles: 'Full Body' },
  { id: 'stretch',  name: 'Static Stretch',    category: 'Flexibility', muscles: 'Full Body' },
  // Extra Strength
  { id: 'incbench', name: 'Incline Bench',     category: 'Strength',    muscles: 'Upper Chest, Triceps' },
  { id: 'rdl',      name: 'Romanian Deadlift', category: 'Strength',    muscles: 'Hamstrings, Glutes' },
  { id: 'dips',     name: 'Dips',              category: 'Strength',    muscles: 'Chest, Triceps' },
  { id: 'laterais', name: 'Lateral Raise',     category: 'Strength',    muscles: 'Shoulders' },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const MOCK_WORKOUTS = [
  {
    id: 'mock1',
    date: daysAgo(1),
    type: 'Strength',
    name: 'Upper Body Strength',
    duration: 52,
    exercises: [
      { name: 'Bench Press',    sets: [{ weight: 80, reps: 8, done: true }, { weight: 82.5, reps: 6, done: true }, { weight: 85, reps: 5, done: true }] },
      { name: 'Pull-up',        sets: [{ weight: 0,  reps: 10, done: true }, { weight: 0,  reps: 9, done: true }, { weight: 0, reps: 8, done: true }] },
      { name: 'Shoulder Press', sets: [{ weight: 50, reps: 10, done: true }, { weight: 52.5, reps: 8, done: true }] },
    ],
    totalVolume: 3240,
  },
  {
    id: 'mock2',
    date: daysAgo(3),
    type: 'Cardio',
    name: '5K Run',
    duration: 28,
    exercises: [
      { name: 'Running', sets: [{ weight: 0, reps: 0, done: true }] },
    ],
    totalVolume: 0,
  },
  {
    id: 'mock3',
    date: daysAgo(5),
    type: 'HIIT',
    name: 'HIIT Circuit',
    duration: 35,
    exercises: [
      { name: 'Burpees',           sets: [{ weight: 0, reps: 15, done: true }, { weight: 0, reps: 12, done: true }, { weight: 0, reps: 10, done: true }] },
      { name: 'Jump Squat',        sets: [{ weight: 0, reps: 20, done: true }, { weight: 0, reps: 18, done: true }] },
      { name: 'Mountain Climbers', sets: [{ weight: 0, reps: 30, done: true }, { weight: 0, reps: 25, done: true }] },
    ],
    totalVolume: 0,
  },
  {
    id: 'mock4',
    date: daysAgo(8),
    type: 'Strength',
    name: 'Lower Body',
    duration: 60,
    exercises: [
      { name: 'Squat',             sets: [{ weight: 100, reps: 5, done: true }, { weight: 105, reps: 5, done: true }, { weight: 110, reps: 3, done: true }] },
      { name: 'Deadlift',          sets: [{ weight: 120, reps: 5, done: true }, { weight: 125, reps: 4, done: true }] },
      { name: 'Lunge',             sets: [{ weight: 30,  reps: 12, done: true }, { weight: 30, reps: 10, done: true }] },
    ],
    totalVolume: 4320,
  },
  {
    id: 'mock5',
    date: daysAgo(12),
    type: 'Strength',
    name: 'Full Body',
    duration: 55,
    exercises: [
      { name: 'Squat',          sets: [{ weight: 95, reps: 6, done: true }, { weight: 100, reps: 5, done: true }] },
      { name: 'Bench Press',    sets: [{ weight: 75, reps: 8, done: true }, { weight: 77.5, reps: 7, done: true }] },
      { name: 'Row',            sets: [{ weight: 60, reps: 10, done: true }, { weight: 62.5, reps: 8, done: true }] },
      { name: 'Shoulder Press', sets: [{ weight: 45, reps: 10, done: true }] },
    ],
    totalVolume: 3100,
  },
];

const MOCK_MEASUREMENTS = Array.from({ length: 7 }, (_, i) => ({
  id: `mm${i}`,
  date: daysAgo(6 - i),
  weight: parseFloat((77.5 + Math.sin(i) * 0.8 + i * 0.1).toFixed(1)),
  bodyFat: parseFloat((18.2 - i * 0.1).toFixed(1)),
}));

// ─── Colours & constants ─────────────────────────────────────────────────────
const C = {
  bg:       '#000000',
  card:     '#111111',
  teal:     '#00BCD4',
  orange:   '#FF8C42',
  white:    '#FFFFFF',
  muted:    '#888888',
  border:   '#222222',
  red:      '#FF4444',
  gold:     '#FFD700',
};

const TYPE_COLOR = {
  Strength:    C.teal,
  Cardio:      C.orange,
  HIIT:        '#E040FB',
  Flexibility: '#66BB6A',
  Sport:       '#42A5F5',
  Other:       C.muted,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (dateStr) => {
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const dateKey = (dateStr) => {
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const fmtTimer = (secs) => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const calcVolume = (exercises) =>
  (exercises || []).reduce((total, ex) =>
    total + (ex.sets || []).filter(s => s.done).reduce((st, s) =>
      st + (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0), 0), 0);

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: (TYPE_COLOR[type] || C.muted) + '22',
      color: TYPE_COLOR[type] || C.muted,
      border: `1px solid ${TYPE_COLOR[type] || C.muted}44`,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>{type}</span>
  );
}

function DumbbellIcon() {
  return (
    <svg width="80" height="40" viewBox="0 0 80 40" fill="none">
      <rect x="0"  y="14" width="14" height="12" rx="3" fill="#333"/>
      <rect x="4"  y="10" width="6"  height="20" rx="2" fill="#444"/>
      <rect x="14" y="17" width="52" height="6"  rx="3" fill="#333"/>
      <rect x="66" y="14" width="14" height="12" rx="3" fill="#333"/>
      <rect x="70" y="10" width="6"  height="20" rx="2" fill="#444"/>
    </svg>
  );
}

function WeightChart({ measurements, unit }) {
  if (!measurements || measurements.length < 2) return null;
  const vals = measurements.map(m => unit === 'lbs' ? m.weight * 2.205 : m.weight);
  const min = Math.min(...vals) - 1;
  const max = Math.max(...vals) + 1;
  const W = 320, H = 120, PAD = 32;
  const xs = vals.map((_, i) => PAD + (i / (vals.length - 1)) * (W - PAD * 2));
  const ys = vals.map(v => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2));
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>Weight ({unit})</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* grid lines */}
        {[0, 0.5, 1].map(t => (
          <line key={t} x1={PAD} x2={W - PAD}
            y1={H - PAD - t * (H - PAD * 2)} y2={H - PAD - t * (H - PAD * 2)}
            stroke="#222" strokeWidth="1" />
        ))}
        {/* y-axis labels */}
        {[0, 0.5, 1].map(t => (
          <text key={t} x={PAD - 4} y={H - PAD - t * (H - PAD * 2) + 4}
            textAnchor="end" fill={C.muted} fontSize="10">
            {(min + t * (max - min)).toFixed(1)}
          </text>
        ))}
        {/* line */}
        <path d={d} stroke="#555" strokeWidth="2" fill="none" />
        {/* dots */}
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r="4" fill={C.teal} />
        ))}
        {/* day labels */}
        {measurements.map((m, i) => (
          <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fill={C.muted} fontSize="9">
            {new Date(m.date + (m.date.includes('T') ? '' : 'T00:00:00')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </text>
        ))}
      </svg>
    </div>
  );
}

function VolumeBarChart({ allWorkouts }) {
  const days = 7;
  const labels = [];
  const volumes = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    labels.push(d.toLocaleDateString('en-GB', { weekday: 'short' }));
    const dayWorkouts = allWorkouts.filter(w => dateKey(w.date) === key);
    volumes.push(dayWorkouts.reduce((s, w) => s + (w.totalVolume || calcVolume(w.exercises)), 0));
  }
  const maxVol = Math.max(...volumes, 1);
  const W = 320, H = 120, PAD = 32, barW = 28, gap = (W - PAD * 2 - barW * days) / (days - 1);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>Weekly Volume (kg)</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {volumes.map((v, i) => {
          const barH = Math.max((v / maxVol) * (H - PAD * 2), v > 0 ? 4 : 0);
          const x = PAD + i * (barW + gap);
          return (
            <g key={i}>
              <rect x={x} y={H - PAD - barH} width={barW} height={barH}
                rx="3" fill={v > 0 ? C.teal : '#222'} />
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" fill={C.muted} fontSize="9">
                {labels[i]}
              </text>
              {v > 0 && (
                <text x={x + barW / 2} y={H - PAD - barH - 4} textAnchor="middle" fill={C.teal} fontSize="9">
                  {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function PRSection({ allWorkouts }) {
  const prs = useMemo(() => {
    const map = {};
    allWorkouts.forEach(w => {
      w.exercises.forEach(ex => {
        (ex.sets || []).filter(s => s.done && s.weight && s.reps).forEach(s => {
          const vol = parseFloat(s.weight) * parseFloat(s.reps);
          if (!map[ex.name] || vol > map[ex.name].vol) {
            map[ex.name] = { weight: s.weight, reps: s.reps, vol, date: w.date };
          }
        });
      });
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [allWorkouts]);

  if (prs.length === 0) return null;

  return (
    <div style={{ background: C.card, borderRadius: 16, padding: '16px', marginBottom: 16 }}>
      <div style={{ color: C.white, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
        Personal Records
      </div>
      {prs.map(([name, pr]) => (
        <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
          <div>
            <div style={{ color: C.white, fontSize: 13, fontWeight: 600 }}>{name}</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{fmtDate(pr.date)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: C.teal, fontWeight: 700, fontSize: 13 }}>
              {pr.weight}kg × {pr.reps} reps
            </span>
            <span style={{ marginLeft: 6, fontSize: 14 }}>🏅</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Workout Builder ──────────────────────────────────────────────────────────

function WorkoutBuilder({ onClose, onSave }) {
  const [wType, setWType] = useState('Strength');
  const [exercises, setExercises] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [timerSecs, setTimerSecs] = useState(0);
  const [restTimer, setRestTimer] = useState(null);
  const timerRef = useRef(null);
  const restRef  = useRef(null);

  // Main timer
  useEffect(() => {
    timerRef.current = setInterval(() => setTimerSecs(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Rest timer
  useEffect(() => {
    if (restTimer === null) return;
    if (restTimer <= 0) { setRestTimer(null); return; }
    restRef.current = setTimeout(() => setRestTimer(t => t - 1), 1000);
    return () => clearTimeout(restRef.current);
  }, [restTimer]);

  const addExercise = (ex) => {
    setExercises(prev => [...prev, {
      id: `ex${Date.now()}`,
      name: ex.name,
      muscles: ex.muscles,
      category: ex.category,
      sets: [{ weight: '', reps: '', done: false }],
    }]);
    setShowSearch(false);
    setSearchQ('');
  };

  const updateSet = (exIdx, setIdx, updated) => {
    setExercises(prev => {
      const next = [...prev];
      const prevDone = next[exIdx].sets[setIdx].done;
      next[exIdx] = { ...next[exIdx], sets: next[exIdx].sets.map((s, i) => i === setIdx ? updated : s) };
      if (!prevDone && updated.done) setRestTimer(60);
      return next;
    });
  };

  const addSet = (exIdx) => {
    setExercises(prev => {
      const next = [...prev];
      const last = next[exIdx].sets[next[exIdx].sets.length - 1] || {};
      next[exIdx] = { ...next[exIdx], sets: [...next[exIdx].sets, { weight: last.weight || '', reps: last.reps || '', done: false }] };
      return next;
    });
  };

  const removeSet = (exIdx, setIdx) => {
    setExercises(prev => {
      const next = [...prev];
      next[exIdx] = { ...next[exIdx], sets: next[exIdx].sets.filter((_, i) => i !== setIdx) };
      return next;
    });
  };

  const removeExercise = (exIdx) => setExercises(prev => prev.filter((_, i) => i !== exIdx));

  const filteredExercises = EXERCISES.filter(ex =>
    ex.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    ex.muscles.toLowerCase().includes(searchQ.toLowerCase())
  );

  const handleFinish = () => {
    const totalVolume = calcVolume(exercises);
    onSave({
      id: `w${Date.now()}`,
      date: todayKey(),
      type: wType,
      name: `${wType} Workout`,
      duration: Math.round(timerSecs / 60),
      exercises,
      totalVolume,
    });
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: C.bg, zIndex: 9999,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: `1px solid ${C.border}`, flexShrink: 0,
      }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.white, fontSize: 22, cursor: 'pointer', padding: '4px 8px' }}>✕</button>
        <span style={{ color: C.teal, fontWeight: 700, fontSize: 22, fontVariantNumeric: 'tabular-nums' }}>
          {fmtTimer(timerSecs)}
        </span>
        <button onClick={handleFinish} style={{
          background: C.teal, border: 'none', color: '#000', fontWeight: 700,
          fontSize: 14, borderRadius: 20, padding: '8px 18px', cursor: 'pointer',
        }}>Finish</button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 100px' }}>
        {/* Type chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Sport', 'Other'].map(t => (
            <button key={t} onClick={() => setWType(t)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: wType === t ? C.teal : '#1a1a1a',
              color: wType === t ? '#000' : C.muted,
              border: `1px solid ${wType === t ? C.teal : C.border}`,
            }}>{t}</button>
          ))}
        </div>

        {/* Exercise cards */}
        {exercises.map((ex, exIdx) => (
          <div key={ex.id} style={{ background: C.card, borderRadius: 14, padding: '14px 16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ color: C.white, fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{ex.muscles}</div>
              </div>
              <button onClick={() => removeExercise(exIdx)} style={{
                background: 'none', border: 'none', color: C.muted, fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
              }}>×</button>
            </div>

            {/* Set rows */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.muted, fontSize: 11, width: 36 }}>SET</span>
              <span style={{ color: C.muted, fontSize: 11, flex: 1, textAlign: 'center' }}>KG</span>
              <span style={{ color: C.muted, fontSize: 11, flex: 1, textAlign: 'center' }}>REPS</span>
              <span style={{ width: 36 }} />
            </div>
            {ex.sets.map((set, setIdx) => (
              <div key={setIdx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span style={{ color: C.muted, fontSize: 13, width: 30, flexShrink: 0 }}>Set {setIdx + 1}</span>
                <input
                  type="number"
                  placeholder="0"
                  value={set.weight}
                  onChange={e => updateSet(exIdx, setIdx, { ...set, weight: e.target.value })}
                  style={{
                    flex: 1, background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 8,
                    color: C.white, fontSize: 14, padding: '6px 8px', textAlign: 'center',
                  }}
                />
                <span style={{ color: C.muted, fontSize: 12 }}>×</span>
                <input
                  type="number"
                  placeholder="0"
                  value={set.reps}
                  onChange={e => updateSet(exIdx, setIdx, { ...set, reps: e.target.value })}
                  style={{
                    flex: 1, background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 8,
                    color: C.white, fontSize: 14, padding: '6px 8px', textAlign: 'center',
                  }}
                />
                <button
                  onClick={() => updateSet(exIdx, setIdx, { ...set, done: !set.done })}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, flexShrink: 0,
                    background: set.done ? C.teal : '#2a2a2a',
                    color: set.done ? '#000' : C.muted,
                    fontWeight: 700,
                  }}>✓</button>
                <button onClick={() => removeSet(exIdx, setIdx)} style={{
                  width: 28, height: 28, background: 'none', border: 'none', color: '#555', fontSize: 18, cursor: 'pointer', flexShrink: 0,
                }}>×</button>
              </div>
            ))}
            <button onClick={() => addSet(exIdx)} style={{
              background: 'none', border: 'none', color: C.teal, fontSize: 13, cursor: 'pointer', padding: '4px 0', fontWeight: 600,
            }}>+ Add Set</button>
          </div>
        ))}

        {/* Add exercise */}
        <button onClick={() => setShowSearch(true)} style={{
          width: '100%', padding: '14px', border: `1px dashed ${C.border}`, borderRadius: 14,
          background: 'none', color: C.teal, fontSize: 15, cursor: 'pointer', fontWeight: 600,
        }}>+ Add Exercise</button>
      </div>

      {/* Finish button fixed bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: 'linear-gradient(transparent, #000 40%)' }}>
        <button onClick={handleFinish} style={{
          width: '100%', padding: '16px', background: C.teal, border: 'none', borderRadius: 14,
          color: '#000', fontWeight: 800, fontSize: 16, cursor: 'pointer',
        }}>Finish Workout</button>
      </div>

      {/* Exercise search modal */}
      {showSearch && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }} onClick={() => setShowSearch(false)}>
          <div style={{
            background: '#111', borderRadius: '20px 20px 0 0', padding: '20px',
            maxHeight: '70vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
              <input
                autoFocus
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search exercises..."
                style={{
                  flex: 1, background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 10,
                  color: C.white, fontSize: 15, padding: '10px 14px',
                }}
              />
              <button onClick={() => setShowSearch(false)} style={{
                background: 'none', border: 'none', color: C.muted, fontSize: 24, cursor: 'pointer',
              }}>×</button>
            </div>
            {filteredExercises.map(ex => (
              <button key={ex.id} onClick={() => addExercise(ex)} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'none', border: 'none', padding: '12px 0', borderBottom: `1px solid ${C.border}`,
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div>
                  <div style={{ color: C.white, fontWeight: 600, fontSize: 14 }}>{ex.name}</div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{ex.muscles}</div>
                </div>
                <span style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 10,
                  background: (TYPE_COLOR[ex.category] || C.muted) + '22',
                  color: TYPE_COLOR[ex.category] || C.muted,
                }}>{ex.category}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rest timer overlay */}
      {restTimer !== null && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: C.muted, fontSize: 14, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Rest</div>
          <div style={{ color: C.teal, fontSize: 80, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {restTimer}
          </div>
          <button onClick={() => setRestTimer(null)} style={{
            marginTop: 24, background: '#1a1a1a', border: `1px solid ${C.border}`,
            color: C.white, padding: '10px 28px', borderRadius: 20, fontSize: 14, cursor: 'pointer',
          }}>Skip</button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorkoutView({ workouts = [], bodyMeasurements = [], onAddWorkout, onUpdateWorkout, onDeleteWorkout, onAddMeasurement, isPremium, onShowPremium }) {
  const [activeTab, setActiveTab] = useState('today');
  const [showWorkoutBuilder, setShowWorkoutBuilder] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [unit, setUnit] = useState('kg');

  // Log past workout form
  const [showLogPast, setShowLogPast] = useState(false);
  const [pastDate, setPastDate] = useState('');
  const [pastType, setPastType] = useState('Strength');
  const [pastName, setPastName] = useState('');
  const [pastDuration, setPastDuration] = useState('');

  // Body tab state
  const [bodyWeight, setBodyWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [measurements, setMeasurements] = useState({ chest: '', waist: '', hips: '', arms: '', thighs: '' });
  const [editingMeasure, setEditingMeasure] = useState(null);

  // Merge mock + real (real wins by date key)
  const allWorkouts = useMemo(() => {
    const real = [...(workouts || [])];
    const realKeys = new Set(real.map(w => dateKey(w.date) + w.type + w.name));
    const mocks = MOCK_WORKOUTS.filter(m => !realKeys.has(dateKey(m.date) + m.type + m.name));
    return [...mocks, ...real].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [workouts]);

  const allMeasurements = useMemo(() => {
    const real = [...(bodyMeasurements || [])];
    const realKeys = new Set(real.map(m => dateKey(m.date)));
    const mocks = MOCK_MEASUREMENTS.filter(m => !realKeys.has(dateKey(m.date)));
    return [...mocks, ...real].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [bodyMeasurements]);

  const todayWorkout = allWorkouts.find(w => dateKey(w.date) === todayKey());

  const handleSaveWorkout = (w) => {
    if (onAddWorkout) onAddWorkout(w);
    setShowWorkoutBuilder(false);
  };

  const handleDeleteWorkout = (id) => {
    if (onDeleteWorkout) onDeleteWorkout(id);
  };

  const handleSaveMeasurement = () => {
    if (!bodyWeight && !bodyFat) return;
    const m = {
      id: `m${Date.now()}`,
      date: todayKey(),
      weight: bodyWeight ? parseFloat(bodyWeight) : undefined,
      bodyFat: bodyFat ? parseFloat(bodyFat) : undefined,
      unit,
    };
    if (onAddMeasurement) onAddMeasurement(m);
    setBodyWeight('');
    setBodyFat('');
  };

  const handleLogPast = () => {
    if (!pastDate) return;
    const w = {
      id: `w${Date.now()}`,
      date: pastDate,
      type: pastType,
      name: pastName || `${pastType} Workout`,
      duration: parseInt(pastDuration) || 0,
      exercises: [],
      totalVolume: 0,
    };
    if (onAddWorkout) onAddWorkout(w);
    setShowLogPast(false);
    setPastDate('');
    setPastName('');
    setPastDuration('');
    setActiveTab('history');
  };

  // Tabs
  const tabs = [
    { key: 'today',   label: 'Today' },
    { key: 'history', label: 'History' },
    { key: 'body',    label: 'Body' },
  ];

  const s = {
    root: { background: C.bg, minHeight: '100vh', color: C.white, fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif', paddingBottom: 80 },
    header: { padding: '24px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 800, color: C.white, margin: 0 },
    subtext: { color: C.muted, fontSize: 13, marginTop: 4 },
    tabRow: { display: 'flex', padding: '0 20px', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 20 },
    tab: (active) => ({
      flex: 1, padding: '12px 0', background: 'none', border: 'none',
      borderBottom: active ? `2px solid ${C.teal}` : '2px solid transparent',
      color: active ? C.teal : C.muted, fontSize: 14, fontWeight: active ? 700 : 500,
      cursor: 'pointer', letterSpacing: '0.02em',
    }),
    section: { padding: '0 20px' },
    card: { background: C.card, borderRadius: 16, padding: '16px', marginBottom: 14 },
    btn: (primary) => ({
      width: '100%', padding: '15px', borderRadius: 12, border: primary ? 'none' : `1px solid ${C.border}`,
      background: primary ? C.teal : 'none', color: primary ? '#000' : C.white,
      fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 10,
    }),
    muted: { color: C.muted, fontSize: 13 },
  };

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Workout</h2>
          <p style={s.subtext}>Track your training</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isPremium && (
            <button onClick={onShowPremium} style={{
              background: 'none', border: `1px solid ${C.orange}`, color: C.orange,
              borderRadius: 20, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>PRO</button>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={s.tabRow}>
        {tabs.map(t => (
          <button key={t.key} style={s.tab(activeTab === t.key)} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TODAY ── */}
      {activeTab === 'today' && (
        <div style={s.section}>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>

          {todayWorkout ? (
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <TypeBadge type={todayWorkout.type} />
                  <div style={{ color: C.white, fontWeight: 700, fontSize: 17, marginTop: 8 }}>{todayWorkout.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: C.muted, fontSize: 12 }}>{todayWorkout.duration}min</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
                <div>
                  <div style={{ color: C.teal, fontWeight: 700, fontSize: 18 }}>
                    {todayWorkout.exercises?.length || 0}
                  </div>
                  <div style={{ color: C.muted, fontSize: 11 }}>exercises</div>
                </div>
                {(todayWorkout.totalVolume || calcVolume(todayWorkout.exercises)) > 0 && (
                  <div>
                    <div style={{ color: C.orange, fontWeight: 700, fontSize: 18 }}>
                      {(todayWorkout.totalVolume || calcVolume(todayWorkout.exercises)).toLocaleString()}kg
                    </div>
                    <div style={{ color: C.muted, fontSize: 11 }}>total volume</div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleDeleteWorkout(todayWorkout.id)}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1px solid ${C.red}33`, background: `${C.red}11`, color: C.red, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div style={{ ...s.card, textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ marginBottom: 12, opacity: 0.3 }}>
                <DumbbellIcon />
              </div>
              <div style={{ color: C.muted, fontSize: 14 }}>No workout logged today</div>
            </div>
          )}

          <button style={s.btn(true)} onClick={() => {
            if (!isPremium && onShowPremium) { onShowPremium(); return; }
            setShowWorkoutBuilder(true);
          }}>
            Start Workout
          </button>

          <button style={s.btn(false)} onClick={() => {
            if (!isPremium && onShowPremium) { onShowPremium(); return; }
            setShowLogPast(true);
          }}>
            Log Past Workout
          </button>

          {/* Log past workout form */}
          {showLogPast && (
            <div style={s.card}>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Log Past Workout</div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ color: C.muted, fontSize: 12, display: 'block', marginBottom: 4 }}>Date</label>
                <input
                  type="date"
                  value={pastDate}
                  onChange={e => setPastDate(e.target.value)}
                  style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontSize: 14, padding: '10px 12px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ color: C.muted, fontSize: 12, display: 'block', marginBottom: 4 }}>Type</label>
                <select value={pastType} onChange={e => setPastType(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontSize: 14, padding: '10px 12px', boxSizing: 'border-box' }}>
                  {['Strength', 'Cardio', 'HIIT', 'Flexibility', 'Sport', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ color: C.muted, fontSize: 12, display: 'block', marginBottom: 4 }}>Name</label>
                <input type="text" placeholder="e.g. Push Day" value={pastName} onChange={e => setPastName(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontSize: 14, padding: '10px 12px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: C.muted, fontSize: 12, display: 'block', marginBottom: 4 }}>Duration (min)</label>
                <input type="number" placeholder="45" value={pastDuration} onChange={e => setPastDuration(e.target.value)} style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 8, color: C.white, fontSize: 14, padding: '10px 12px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setShowLogPast(false)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'none', color: C.muted, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleLogPast} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: C.teal, color: '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Save</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY ── */}
      {activeTab === 'history' && (
        <div style={s.section}>
          {/* Weekly volume chart */}
          <div style={s.card}>
            <VolumeBarChart allWorkouts={allWorkouts} />
          </div>

          {/* Workout list */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: C.white, fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Past Workouts</div>
            {allWorkouts.length === 0 ? (
              <div style={{ color: C.muted, textAlign: 'center', padding: '24px 0', fontSize: 14 }}>
                No workouts yet. Start logging!
              </div>
            ) : allWorkouts.map(w => {
              const isExpanded = expandedWorkout === w.id;
              return (
                <div key={w.id} style={{ ...s.card, cursor: 'pointer', marginBottom: 10 }}
                  onClick={() => setExpandedWorkout(isExpanded ? null : w.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ color: C.muted, fontSize: 12 }}>{fmtDate(w.date)}</span>
                        <TypeBadge type={w.type} />
                      </div>
                      <div style={{ color: C.white, fontWeight: 600, fontSize: 14 }}>{w.name}</div>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: 12 }}>
                      <div style={{ color: C.muted, fontSize: 13 }}>{w.duration}min</div>
                      <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>▾</div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                      {w.exercises && w.exercises.length > 0 ? w.exercises.map((ex, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div style={{ color: C.teal, fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{ex.name}</div>
                          {(ex.sets || []).filter(s => s.done || s.weight || s.reps).map((set, si) => (
                            <div key={si} style={{ color: C.muted, fontSize: 12, paddingLeft: 8, marginBottom: 2 }}>
                              Set {si + 1}: {set.weight ? `${set.weight}kg` : '—'} × {set.reps ? `${set.reps} reps` : '—'}
                            </div>
                          ))}
                        </div>
                      )) : (
                        <div style={{ color: C.muted, fontSize: 13 }}>No exercises logged</div>
                      )}
                      {(w.totalVolume || calcVolume(w.exercises)) > 0 && (
                        <div style={{ color: C.orange, fontWeight: 600, fontSize: 13, marginTop: 8 }}>
                          Total Volume: {(w.totalVolume || calcVolume(w.exercises)).toLocaleString()}kg
                        </div>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteWorkout(w.id); }}
                        style={{ marginTop: 10, padding: '7px 14px', borderRadius: 8, border: `1px solid ${C.red}33`, background: `${C.red}11`, color: C.red, fontSize: 12, cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Personal Records */}
          <PRSection allWorkouts={allWorkouts} />
        </div>
      )}

      {/* ── BODY ── */}
      {activeTab === 'body' && (
        <div style={s.section}>
          {/* Unit toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: 20, padding: 3 }}>
              {['kg', 'lbs'].map(u => (
                <button key={u} onClick={() => setUnit(u)} style={{
                  padding: '5px 16px', borderRadius: 16, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  background: unit === u ? C.teal : 'none',
                  color: unit === u ? '#000' : C.muted,
                }}>{u}</button>
              ))}
            </div>
          </div>

          {/* Weight chart */}
          <div style={s.card}>
            <WeightChart measurements={allMeasurements} unit={unit} />
          </div>

          {/* Log today */}
          <div style={s.card}>
            <div style={{ color: C.white, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Log Today</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: C.muted, fontSize: 12, display: 'block', marginBottom: 4 }}>Weight ({unit})</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={bodyWeight}
                  onChange={e => setBodyWeight(e.target.value)}
                  style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 10, color: C.white, fontSize: 16, padding: '10px 12px', boxSizing: 'border-box', textAlign: 'center' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: C.muted, fontSize: 12, display: 'block', marginBottom: 4 }}>Body Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={bodyFat}
                  onChange={e => setBodyFat(e.target.value)}
                  style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${C.border}`, borderRadius: 10, color: C.white, fontSize: 16, padding: '10px 12px', boxSizing: 'border-box', textAlign: 'center' }}
                />
              </div>
            </div>
            <button onClick={handleSaveMeasurement} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: C.teal, color: '#000', fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>Save</button>
          </div>

          {/* Measurements accordion */}
          <div style={s.card}>
            <div style={{ color: C.white, fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Body Measurements</div>
            {[
              { key: 'chest',  label: 'Chest' },
              { key: 'waist',  label: 'Waist' },
              { key: 'hips',   label: 'Hips' },
              { key: 'arms',   label: 'Arms' },
              { key: 'thighs', label: 'Thighs' },
            ].map(({ key, label }) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <div>
                  <div style={{ color: C.white, fontSize: 14 }}>{label}</div>
                  <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                    {measurements[key] ? `${measurements[key]} cm` : 'Not logged'}
                  </div>
                </div>
                {editingMeasure === key ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      autoFocus
                      type="number"
                      step="0.1"
                      value={measurements[key]}
                      onChange={e => setMeasurements(prev => ({ ...prev, [key]: e.target.value }))}
                      style={{ width: 70, background: '#1a1a1a', border: `1px solid ${C.teal}`, borderRadius: 8, color: C.white, fontSize: 14, padding: '6px 8px', textAlign: 'center' }}
                    />
                    <span style={{ color: C.muted, fontSize: 12 }}>cm</span>
                    <button onClick={() => setEditingMeasure(null)} style={{ background: C.teal, border: 'none', borderRadius: 6, color: '#000', padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✓</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingMeasure(key)} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Recent measurements */}
          {allMeasurements.length > 0 && (
            <div style={s.card}>
              <div style={{ color: C.white, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Recent Logs</div>
              {allMeasurements.slice().reverse().slice(0, 7).map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.muted, fontSize: 13 }}>{fmtDate(m.date)}</span>
                  <div style={{ display: 'flex', gap: 14 }}>
                    {m.weight && (
                      <span style={{ color: C.white, fontSize: 13 }}>
                        {unit === 'lbs' ? `${(m.weight * 2.205).toFixed(1)}lbs` : `${m.weight}kg`}
                      </span>
                    )}
                    {m.bodyFat && (
                      <span style={{ color: C.teal, fontSize: 13 }}>{m.bodyFat}% fat</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Workout Builder overlay */}
      {showWorkoutBuilder && (
        <WorkoutBuilder
          onClose={() => setShowWorkoutBuilder(false)}
          onSave={handleSaveWorkout}
        />
      )}
    </div>
  );
}
