import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

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
      { name: 'Bench Press',    sets: [{ weight: 80,   reps: 8,  done: true }, { weight: 82.5, reps: 6, done: true }, { weight: 85,   reps: 5, done: true }] },
      { name: 'Pull-up',        sets: [{ weight: 0,    reps: 10, done: true }, { weight: 0,    reps: 9, done: true }, { weight: 0,    reps: 8, done: true }] },
      { name: 'Shoulder Press', sets: [{ weight: 50,   reps: 10, done: true }, { weight: 52.5, reps: 8, done: true }] },
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
      { name: 'Squat',    sets: [{ weight: 100, reps: 5,  done: true }, { weight: 105, reps: 5,  done: true }, { weight: 110, reps: 3,  done: true }] },
      { name: 'Deadlift', sets: [{ weight: 120, reps: 5,  done: true }, { weight: 125, reps: 4,  done: true }] },
      { name: 'Lunge',    sets: [{ weight: 30,  reps: 12, done: true }, { weight: 30,  reps: 10, done: true }] },
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
      { name: 'Squat',          sets: [{ weight: 95,   reps: 6,  done: true }, { weight: 100,  reps: 5, done: true }] },
      { name: 'Bench Press',    sets: [{ weight: 75,   reps: 8,  done: true }, { weight: 77.5, reps: 7, done: true }] },
      { name: 'Row',            sets: [{ weight: 60,   reps: 10, done: true }, { weight: 62.5, reps: 8, done: true }] },
      { name: 'Shoulder Press', sets: [{ weight: 45,   reps: 10, done: true }] },
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

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG       = '#000000';
const CARD     = '#111111';
const ELEVATED = '#1A1A1A';
const WHITE    = '#FFFFFF';
const MUTED    = '#888888';
const BORDER   = 'rgba(255,255,255,0.08)';

const TYPE_COLOR = {
  Strength:    'rgba(255,255,255,0.12)',
  Cardio:      'rgba(255,255,255,0.12)',
  HIIT:        'rgba(255,255,255,0.12)',
  Flexibility: 'rgba(255,255,255,0.12)',
  Sport:       'rgba(255,255,255,0.12)',
  Other:       'rgba(255,255,255,0.12)',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (dateStr) => {
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtDateShort = (dateStr) => {
  const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
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

const cardStyle = {
  background: CARD,
  borderRadius: 16,
  border: `1px solid ${BORDER}`,
  padding: 16,
  boxSizing: 'border-box',
  width: '100%',
};

// ─── Workout Builder Modal ────────────────────────────────────────────────────
function WorkoutBuilder({ onClose, onSave }) {
  const [wType, setWType]         = useState('Strength');
  const [exercisesList, setExercisesList] = useState([]);
  const [showSearch, setShowSearch]   = useState(false);
  const [searchQ, setSearchQ]         = useState('');
  const [timerSecs, setTimerSecs]     = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimerSecs(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const addExercise = (ex) => {
    setExercisesList(prev => [...prev, {
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
    setExercisesList(prev => {
      const next = [...prev];
      next[exIdx] = { ...next[exIdx], sets: next[exIdx].sets.map((s, i) => i === setIdx ? updated : s) };
      return next;
    });
  };

  const addSet = (exIdx) => {
    setExercisesList(prev => {
      const next = [...prev];
      const last = next[exIdx].sets[next[exIdx].sets.length - 1] || {};
      next[exIdx] = { ...next[exIdx], sets: [...next[exIdx].sets, { weight: last.weight || '', reps: last.reps || '', done: false }] };
      return next;
    });
  };

  const removeExercise = (exIdx) => setExercisesList(prev => prev.filter((_, i) => i !== exIdx));

  const filteredExercises = EXERCISES.filter(ex =>
    ex.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    ex.muscles.toLowerCase().includes(searchQ.toLowerCase())
  );

  const handleFinish = () => {
    const totalVolume = calcVolume(exercisesList);
    onSave({
      id: `w${Date.now()}`,
      date: todayKey(),
      type: wType,
      name: `${wType} Workout`,
      duration: Math.round(timerSecs / 60),
      exercises: exercisesList,
      totalVolume,
    });
  };

  const inputStyle = {
    flex: 1,
    background: ELEVATED,
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    color: WHITE,
    fontSize: 14,
    padding: '6px 8px',
    textAlign: 'center',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 500,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        background: BG,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: `1px solid ${BORDER}`,
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: WHITE, fontSize: 22, cursor: 'pointer', padding: '4px 8px', lineHeight: 1 }}
          >✕</button>
          <span style={{
            color: WHITE, fontWeight: 700, fontSize: 36,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
          }}>
            {fmtTimer(timerSecs)}
          </span>
          <button onClick={handleFinish} style={{
            background: '#FFFFFF', border: 'none', color: '#000000', fontWeight: 700,
            fontSize: 14, borderRadius: 12, padding: '8px 18px', cursor: 'pointer',
          }}>Finish</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 120px' }}>
          {/* Type chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
            {['Strength', 'Cardio', 'HIIT', 'Flexibility', 'Other'].map(t => (
              <button key={t} onClick={() => setWType(t)} style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', flexShrink: 0, border: 'none',
                background: wType === t ? '#FFFFFF' : ELEVATED,
                color: wType === t ? '#000000' : MUTED,
              }}>{t}</button>
            ))}
          </div>

          {/* Exercise cards */}
          {exercisesList.map((ex, exIdx) => (
            <div key={ex.id} style={{ ...cardStyle, marginBottom: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <span style={{ color: WHITE, fontWeight: 700, fontSize: 15 }}>{ex.name}</span>
                  {' '}
                  <span style={{
                    display: 'inline-block', padding: '2px 7px', borderRadius: 20,
                    fontSize: 11, background: 'rgba(255,255,255,0.12)', color: WHITE,
                    fontWeight: 600, verticalAlign: 'middle',
                  }}>{ex.muscles.split(',')[0]}</span>
                </div>
                <button onClick={() => removeExercise(exIdx)} style={{
                  background: 'none', border: 'none', color: MUTED,
                  fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
                }}>×</button>
              </div>

              {/* Column headers */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ color: MUTED, fontSize: 11, width: 44 }}>SET</span>
                <span style={{ color: MUTED, fontSize: 11, flex: 1, textAlign: 'center' }}>KG</span>
                <span style={{ color: MUTED, fontSize: 11, width: 14, textAlign: 'center' }} />
                <span style={{ color: MUTED, fontSize: 11, flex: 1, textAlign: 'center' }}>REPS</span>
                <span style={{ width: 32 }} />
              </div>

              {ex.sets.map((set, setIdx) => (
                <div key={setIdx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ color: MUTED, fontSize: 13, width: 44, flexShrink: 0 }}>Set {setIdx + 1}</span>
                  <input
                    type="number" placeholder="0" value={set.weight}
                    onChange={e => updateSet(exIdx, setIdx, { ...set, weight: e.target.value })}
                    style={inputStyle}
                  />
                  <span style={{ color: MUTED, fontSize: 12, width: 14, textAlign: 'center', flexShrink: 0 }}>×</span>
                  <input
                    type="number" placeholder="0" value={set.reps}
                    onChange={e => updateSet(exIdx, setIdx, { ...set, reps: e.target.value })}
                    style={inputStyle}
                  />
                  <button
                    onClick={() => updateSet(exIdx, setIdx, { ...set, done: !set.done })}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: 'none',
                      cursor: 'pointer', fontSize: 14, flexShrink: 0,
                      background: set.done ? '#FFFFFF' : ELEVATED,
                      color: set.done ? '#000000' : MUTED, fontWeight: 700,
                    }}>✓</button>
                </div>
              ))}

              <button onClick={() => addSet(exIdx)} style={{
                background: 'none', border: 'none', color: WHITE,
                fontSize: 13, cursor: 'pointer', padding: '4px 0', fontWeight: 600,
              }}>+ Add set</button>
            </div>
          ))}

          {/* Add Exercise button */}
          <button onClick={() => setShowSearch(true)} style={{
            width: '100%', padding: '14px',
            border: `1px solid ${BORDER}`, borderRadius: 16,
            background: 'none', color: WHITE,
            fontSize: 15, cursor: 'pointer', fontWeight: 600,
            boxSizing: 'border-box',
          }}>+ Add Exercise</button>
        </div>

        {/* Finish fixed bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '16px 20px',
          background: `linear-gradient(transparent, ${BG} 40%)`,
        }}>
          <button onClick={handleFinish} style={{
            width: '100%', height: 52, background: '#FFFFFF',
            border: 'none', borderRadius: 14,
            color: '#000000', fontWeight: 800, fontSize: 16, cursor: 'pointer',
            boxSizing: 'border-box',
          }}>Finish Workout</button>
        </div>

        {/* Exercise search sheet */}
        {showSearch && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }} onClick={() => setShowSearch(false)}>
            <div style={{
              background: CARD, borderRadius: '20px 20px 0 0',
              padding: 20, maxHeight: '70vh', overflowY: 'auto',
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
                <input
                  autoFocus value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search exercises..."
                  style={{
                    flex: 1, background: ELEVATED,
                    border: `1px solid ${BORDER}`, borderRadius: 10,
                    color: WHITE, fontSize: 15, padding: '10px 14px',
                    boxSizing: 'border-box',
                  }}
                />
                <button onClick={() => setShowSearch(false)} style={{
                  background: 'none', border: 'none', color: MUTED, fontSize: 24, cursor: 'pointer',
                }}>×</button>
              </div>
              {filteredExercises.map(ex => (
                <button key={ex.id} onClick={() => addExercise(ex)} style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', background: 'none', border: 'none',
                  padding: '12px 0', borderBottom: `1px solid ${BORDER}`,
                  cursor: 'pointer', textAlign: 'left',
                }}>
                  <div>
                    <div style={{ color: WHITE, fontWeight: 600, fontSize: 14 }}>{ex.name}</div>
                    <div style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>{ex.muscles}</div>
                  </div>
                  <span style={{
                    fontSize: 11, padding: '3px 8px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.12)',
                    color: WHITE,
                  }}>{ex.category}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WorkoutView({
  workouts = [],
  bodyMeasurements = [],
  onAddWorkout,
  onUpdateWorkout,
  onDeleteWorkout,
  onAddMeasurement,
  isPremium,
  onShowPremium,
}) {
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showNLHint, setShowNLHint]             = useState(false);
  const [expandedWorkout, setExpandedWorkout]   = useState(null);
  const [showMeasurements, setShowMeasurements] = useState(false);

  // Merge mock + real workouts (real wins by id)
  const allWorkouts = useMemo(() => {
    const real = [...(workouts || [])];
    const realIds = new Set(real.map(w => w.id));
    const mocks = MOCK_WORKOUTS.filter(m => !realIds.has(m.id));
    return [...mocks, ...real].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [workouts]);

  const allMeasurements = useMemo(() => {
    const real = [...(bodyMeasurements || [])];
    const realKeys = new Set(real.map(m => dateKey(m.date)));
    const mocks = MOCK_MEASUREMENTS.filter(m => !realKeys.has(dateKey(m.date)));
    return [...mocks, ...real].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [bodyMeasurements]);

  const todayWorkout = allWorkouts.find(w => dateKey(w.date) === todayKey());

  // Personal records from allWorkouts
  const prs = useMemo(() => {
    const map = {};
    allWorkouts.forEach(w => {
      (w.exercises || []).forEach(ex => {
        (ex.sets || []).filter(s => s.done && s.weight && s.reps).forEach(s => {
          const vol = parseFloat(s.weight) * parseFloat(s.reps);
          if (!map[ex.name] || vol > map[ex.name].vol) {
            map[ex.name] = {
              weight: s.weight,
              reps: s.reps,
              vol,
              date: w.date,
              muscles: EXERCISES.find(e => e.name === ex.name)?.muscles || '',
            };
          }
        });
      });
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [allWorkouts]);

  // Weight trend data — 30 days, 78 → ~77.2
  const weightData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const w = parseFloat((78 - (i / 29) * 0.8 + Math.sin(i * 0.7) * 0.15).toFixed(1));
      return { date: label, w };
    });
  }, []);

  const handleSaveWorkout = (w) => {
    if (onAddWorkout) onAddWorkout(w);
    setShowWorkoutModal(false);
  };

  const handleDeleteWorkout = (id) => {
    if (onDeleteWorkout) onDeleteWorkout(id);
  };

  // Spark data builder for a workout
  const getSparkData = (workout) => {
    const vols = (workout.exercises || []).flatMap(ex =>
      (ex.sets || []).filter(s => s.done).map(s =>
        (parseFloat(s.weight) || 1) * (parseFloat(s.reps) || 1)
      )
    );
    if (vols.length === 0) return [1, 2, 3, 2, 3].map(v => ({ v }));
    return vols.slice(0, 8).map(v => ({ v }));
  };

  const sectionHeader = { color: WHITE, fontWeight: 700, fontSize: 17, marginBottom: 12 };

  return (
    <div style={{
      background: BG,
      minHeight: '100vh',
      color: WHITE,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
      paddingBottom: 120,
      boxSizing: 'border-box',
    }}>
      <div style={{ padding: '0 16px' }}>

        {/* ── 1. TODAY CARD ── */}
        <div style={{ height: 24 }} />
        <div style={{ ...cardStyle, marginBottom: 12 }}>
          <div style={{ color: WHITE, fontWeight: 700, fontSize: 17, marginBottom: 12 }}>
            Today's Workout
          </div>

          {todayWorkout ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 20,
                  fontSize: 12, fontWeight: 700,
                  background: 'rgba(255,255,255,0.12)',
                  color: WHITE,
                  border: `1px solid rgba(255,255,255,0.2)`,
                }}>{todayWorkout.type}</span>
                <span style={{ color: MUTED, fontSize: 13 }}>{todayWorkout.duration}min</span>
              </div>
              <div style={{ color: WHITE, fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{todayWorkout.name}</div>
              <div style={{ color: MUTED, fontSize: 13 }}>
                {todayWorkout.exercises?.length || 0} exercises
                {(todayWorkout.totalVolume || calcVolume(todayWorkout.exercises)) > 0 &&
                  ` · ${(todayWorkout.totalVolume || calcVolume(todayWorkout.exercises)).toLocaleString()}kg volume`
                }
              </div>
            </div>
          ) : (
            <div style={{ color: MUTED, fontSize: 14, padding: 12 }}>
              No workout logged yet
            </div>
          )}

          {/* NL hint */}
          {showNLHint && (
            <div style={{
              background: ELEVATED, borderRadius: 10, padding: '10px 12px',
              color: MUTED, fontSize: 13, marginBottom: 8, marginTop: 4,
            }}>
              Use the 🗣️ Quick Log in the header to log a workout via natural language
            </div>
          )}

          {/* NL button */}
          <button
            onClick={() => setShowNLHint(h => !h)}
            style={{
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent', color: WHITE,
              borderRadius: 12, height: 44, width: '100%',
              fontSize: 14, cursor: 'pointer', marginBottom: 8,
              boxSizing: 'border-box', marginTop: 8,
            }}
          >
            🗣️ Log via Natural Language
          </button>

          {/* Manual entry button */}
          <button
            onClick={() => setShowWorkoutModal(true)}
            style={{
              background: '#FFFFFF', color: '#000000', fontWeight: 700,
              borderRadius: 12, height: 44, width: '100%',
              fontSize: 14, cursor: 'pointer', border: 'none',
              boxSizing: 'border-box',
            }}
          >
            + Manual Entry
          </button>
        </div>

        {/* ── 2. WORKOUT HISTORY ── */}
        <div style={{ marginBottom: 4 }}>
          <div style={sectionHeader}>Recent Workouts</div>

          {allWorkouts.map(w => {
            const isExpanded = expandedWorkout === w.id;
            const vol = w.totalVolume || calcVolume(w.exercises);
            const sparkData = getSparkData(w);

            return (
              <div
                key={w.id}
                style={{ ...cardStyle, marginBottom: 8, cursor: 'pointer' }}
                onClick={() => setExpandedWorkout(isExpanded ? null : w.id)}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: MUTED, fontSize: 12 }}>{fmtDate(w.date)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 9px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700,
                      background: 'rgba(255,255,255,0.12)', color: WHITE,
                      border: `1px solid rgba(255,255,255,0.2)`,
                    }}>{w.type}</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteWorkout(w.id); }}
                      style={{
                        background: 'none', border: 'none', color: MUTED,
                        fontSize: 16, cursor: 'pointer', padding: '0 2px', lineHeight: 1,
                      }}
                      title="Delete workout"
                    >🗑</button>
                  </div>
                </div>

                {/* Duration + volume + sparkline row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: WHITE, fontSize: 14, marginRight: 12 }}>⏱ {w.duration}min</span>
                    {vol > 0 && (
                      <span style={{ color: WHITE, fontSize: 14 }}>🏋️ {vol.toLocaleString()}kg total</span>
                    )}
                    {vol === 0 && (
                      <span style={{ color: MUTED, fontSize: 13 }}>{w.name}</span>
                    )}
                  </div>
                  {/* Mini sparkline — fixed width, no ResponsiveContainer */}
                  <div style={{ flexShrink: 0 }}>
                    <LineChart width={80} height={40} data={sparkData}>
                      <Line
                        type="monotone" dataKey="v" stroke='#FFFFFF'
                        strokeWidth={2} dot={false} isAnimationActive={false}
                      />
                    </LineChart>
                  </div>
                </div>

                {/* Expanded exercise breakdown */}
                {isExpanded && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                    {w.exercises && w.exercises.length > 0 ? w.exercises.map((ex, i) => {
                      const doneSets = (ex.sets || []).filter(s => s.done || s.weight || s.reps);
                      // Summarise: "3×8 @ 80kg" style
                      const topWeight = Math.max(0, ...doneSets.map(s => parseFloat(s.weight) || 0));
                      const avgReps = doneSets.length > 0
                        ? Math.round(doneSets.reduce((a, s) => a + (parseFloat(s.reps) || 0), 0) / doneSets.length)
                        : 0;
                      const summary = doneSets.length > 0
                        ? `${doneSets.length}×${avgReps}${topWeight > 0 ? ` @ ${topWeight}kg` : ''}`
                        : '';
                      return (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: 6,
                        }}>
                          <span style={{ color: WHITE, fontWeight: 600, fontSize: 13 }}>{ex.name}</span>
                          {summary && (
                            <span style={{ color: MUTED, fontSize: 12 }}>{summary}</span>
                          )}
                        </div>
                      );
                    }) : (
                      <span style={{ color: MUTED, fontSize: 13 }}>No exercises logged</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── 3. PERSONAL RECORDS ── */}
        {prs.length > 0 && (
          <div style={{ marginBottom: 4 }}>
            <div style={sectionHeader}>Personal Records</div>

            {prs.map(([name, pr]) => (
              <div key={name} style={{
                ...cardStyle, marginBottom: 8,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                {/* Left: name + muscle tag */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: WHITE, fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{name}</div>
                  {pr.muscles && (
                    <span style={{
                      display: 'inline-block', padding: '2px 7px', borderRadius: 20,
                      fontSize: 11, fontWeight: 500,
                      background: 'rgba(136,136,136,0.15)', color: MUTED,
                    }}>{pr.muscles.split(',')[0].trim()}</span>
                  )}
                </div>

                {/* Center: weight × reps */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ color: WHITE, fontWeight: 700, fontSize: 20, lineHeight: 1 }}>
                    {parseFloat(pr.weight) > 0 ? `${pr.weight}kg` : 'BW'} × {pr.reps}
                  </div>
                  <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>reps</div>
                </div>

                {/* Right: PR badge + date + trend */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 7px', borderRadius: 10,
                    fontSize: 11, fontWeight: 700,
                    background: 'rgba(255,255,255,0.15)', color: '#FFFFFF',
                  }}>🏅 PR</span>
                  <div style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>
                    {fmtDateShort(pr.date)}
                  </div>
                  <div style={{ color: '#FFFFFF', fontSize: 13, marginTop: 2 }}>▲</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 4. BODY MEASUREMENTS ── */}
        <div style={{ marginBottom: 4 }}>
          <div style={sectionHeader}>Body Measurements</div>

          {/* Weight trend chart */}
          <div style={{ ...cardStyle, marginBottom: 12, paddingBottom: 8 }}>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={weightData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <Line
                  type="monotone" dataKey="w" stroke='rgba(255,255,255,0.6)' strokeWidth={2}
                  dot={{ fill: MUTED, r: 3 }} isAnimationActive={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: MUTED, fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  interval={6}
                />
                <YAxis
                  domain={['dataMin-2', 'dataMax+2']}
                  tick={{ fill: MUTED, fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  width={35}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stat cards 2-col */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 12, boxSizing: 'border-box' }}>
            <div style={{ ...cardStyle, flex: 1 }}>
              <div style={{ color: MUTED, fontSize: 12, marginBottom: 4 }}>Weight</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ color: WHITE, fontWeight: 700, fontSize: 20 }}>77.2</span>
                <span style={{ color: MUTED, fontSize: 13 }}>kg</span>
                <span style={{ color: '#888888', fontSize: 16, marginLeft: 4 }}>▼</span>
              </div>
            </div>
            <div style={{ ...cardStyle, flex: 1 }}>
              <div style={{ color: MUTED, fontSize: 12, marginBottom: 4 }}>Body Fat</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ color: WHITE, fontWeight: 700, fontSize: 20 }}>14.2</span>
                <span style={{ color: MUTED, fontSize: 13 }}>%</span>
                <span style={{ color: '#888888', fontSize: 16, marginLeft: 4 }}>▼</span>
              </div>
            </div>
          </div>

          {/* Measurements accordion */}
          <div style={{ ...cardStyle }}>
            <button
              onClick={() => setShowMeasurements(s => !s)}
              style={{
                background: 'none', border: 'none', color: WHITE,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                padding: 0, width: '100%', textAlign: 'left',
              }}
            >
              {showMeasurements ? 'Hide measurements' : 'Show measurements'}
            </button>

            {showMeasurements && (
              <div style={{ marginTop: 12 }}>
                {[
                  { label: 'Chest',  value: '97cm',  date: 'Mar 1' },
                  { label: 'Waist',  value: '81cm',  date: 'Mar 1' },
                  { label: 'Hips',   value: '94cm',  date: 'Mar 1' },
                  { label: 'Arms',   value: '36cm',  date: 'Mar 1' },
                  { label: 'Thighs', value: '58cm',  date: 'Mar 1' },
                ].map(({ label, value, date }, i, arr) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}>
                    <span style={{ color: MUTED, fontSize: 14 }}>{label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: WHITE, fontWeight: 600, fontSize: 14 }}>{value}</span>
                      <span style={{ color: MUTED, fontSize: 11 }}>{date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Live Workout Modal ── */}
      {showWorkoutModal && (
        <WorkoutBuilder
          onClose={() => setShowWorkoutModal(false)}
          onSave={handleSaveWorkout}
        />
      )}
    </div>
  );
}
