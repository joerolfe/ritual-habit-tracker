import React, { useState, useEffect, useRef } from 'react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
function buildMockWellbeing() {
  const today = new Date();
  const data = {};
  const feelingPool = [
    ['Calm', 'Focused'],
    ['Grateful', 'Happy'],
    ['Tired', 'Anxious'],
    ['Content', 'Excited'],
    ['Focused', 'Grateful'],
    ['Calm', 'Content'],
    ['Happy', 'Excited'],
  ];
  const notePool = [
    'Productive morning',
    'Felt a bit scattered today',
    'Great workout session',
    'Long meeting, but stayed grounded',
    'Enjoyed some quiet time',
    'Had a good talk with a friend',
    'Early start, feeling energised',
  ];
  const stressArr  = [4, 6, 3, 7, 2, 5, 8];
  const energyArr  = [7, 5, 9, 4, 8, 6, 7];
  const moodArr    = [6, 5, 8, 4, 7, 6, 8];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    data[key] = {
      stress: stressArr[6 - i],
      energy: energyArr[6 - i],
      mood:   moodArr[6 - i],
      feelings: feelingPool[6 - i],
      notes: notePool[6 - i],
    };
  }
  return data;
}
const MOCK_WELLBEING = buildMockWellbeing();

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const FEELINGS = ['Happy','Calm','Anxious','Grateful','Tired','Focused','Overwhelmed','Excited','Sad','Content'];

const BREATHING_EXERCISES = [
  {
    id: 'box',
    name: 'Box Breathing',
    pattern: '4-4-4-4',
    desc: 'Equal inhale, hold, exhale, hold for calm focus',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold',   duration: 4 },
      { label: 'Exhale', duration: 4 },
      { label: 'Hold',   duration: 4 },
    ],
    gradient: 'linear-gradient(135deg, #1565C0, #42A5F5)',
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    pattern: '4-7-8',
    desc: 'Deep relaxation technique for sleep & anxiety',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold',   duration: 7 },
      { label: 'Exhale', duration: 8 },
    ],
    gradient: 'linear-gradient(135deg, #6A1B9A, #CE93D8)',
  },
  {
    id: 'calm',
    name: 'Calm Breath',
    pattern: '4-6',
    desc: 'Simple breath to ease stress in under a minute',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Exhale', duration: 6 },
    ],
    gradient: 'linear-gradient(135deg, #00838F, #4DD0E1)',
  },
  {
    id: 'power',
    name: 'Power Breathing',
    pattern: '6-2-6-2',
    desc: 'Boost alertness and mental energy quickly',
    phases: [
      { label: 'Inhale', duration: 6 },
      { label: 'Hold',   duration: 2 },
      { label: 'Exhale', duration: 6 },
      { label: 'Hold',   duration: 2 },
    ],
    gradient: 'linear-gradient(135deg, #E65100, #FFB74D)',
  },
];

const MEDITATION_CATEGORIES = [
  { name: 'Guided',   gradient: 'linear-gradient(135deg,#00BCD4,#006064)' },
  { name: 'Unguided', gradient: 'linear-gradient(135deg,#424242,#9E9E9E)' },
  { name: 'Sleep',    gradient: 'linear-gradient(135deg,#1A237E,#7986CB)' },
  { name: 'Focus',    gradient: 'linear-gradient(135deg,#F57F17,#FFD54F)' },
  { name: 'Anxiety',  gradient: 'linear-gradient(135deg,#4A148C,#CE93D8)' },
  { name: 'Morning',  gradient: 'linear-gradient(135deg,#BF360C,#FFAB91)' },
];

const PERIOD_SYMPTOMS = [
  'Cramps','Bloating','Headache','Fatigue','Mood swings','Spotting','Tender','Nausea','Back pain','Cravings',
];

const PHASE_COLORS = {
  Menstrual:  '#EF5350',
  Follicular: '#66BB6A',
  Ovulation:  '#00BCD4',
  Luteal:     '#AB47BC',
};

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
];

const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid as if something awful might happen',
];

const ASSESSMENT_OPTIONS = ['Not at all','Several days','More than half the days','Nearly every day'];

const JOURNAL_PROMPTS = [
  "What's one thing you're grateful for today?",
  "What emotion am I feeling most strongly right now?",
  "What would make today feel meaningful?",
  "What is draining my energy, and can I change it?",
  "What small act of kindness can I do for myself today?",
  "What am I looking forward to this week?",
  "What boundary do I need to set or maintain?",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function moodColor(val) {
  if (val >= 7) return '#66BB6A';
  if (val >= 5) return '#FFD54F';
  return '#EF5350';
}

function severityLabel(score, type) {
  if (type === 'phq9') {
    if (score <= 4)  return { label: 'Minimal',  color: '#66BB6A' };
    if (score <= 9)  return { label: 'Mild',     color: '#FFD54F' };
    if (score <= 14) return { label: 'Moderate', color: '#FFA726' };
    if (score <= 19) return { label: 'Mod-Severe', color: '#EF5350' };
    return              { label: 'Severe',   color: '#B71C1C' };
  }
  // GAD-7
  if (score <= 4)  return { label: 'Minimal',  color: '#66BB6A' };
  if (score <= 9)  return { label: 'Mild',     color: '#FFD54F' };
  if (score <= 14) return { label: 'Moderate', color: '#FFA726' };
  return              { label: 'Severe',   color: '#EF5350' };
}

function pad2(n) { return String(n).padStart(2, '0'); }

// ─── PHASE CIRCLE SVG ─────────────────────────────────────────────────────────
function PhaseArc({ phase }) {
  const phases = ['Menstrual','Follicular','Ovulation','Luteal'];
  const cx = 60, cy = 60, r = 50;
  const total = phases.length;
  const arcs = phases.map((p, i) => {
    const startAngle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const endAngle   = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = endAngle - startAngle > Math.PI ? 1 : 0;
    const active = p === phase;
    return (
      <path
        key={p}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
        fill={PHASE_COLORS[p]}
        opacity={active ? 1 : 0.25}
        stroke="#0D0D1A"
        strokeWidth="2"
      />
    );
  });
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      {arcs}
      <circle cx={cx} cy={cy} r="28" fill="#0D0D1A" />
    </svg>
  );
}

// ─── BREATHING SESSION ────────────────────────────────────────────────────────
function BreathingSession({ exercise, onClose }) {
  const [phaseIdx, setPhaseIdx]   = useState(0);
  const [count, setCount]         = useState(exercise.phases[0].duration);
  const [cyclesDone, setCyclesDone] = useState(0);
  const [circleSize, setCircleSize] = useState(120);
  const totalCycles = 4;

  const phase = exercise.phases[phaseIdx];

  // colour + size per phase label
  const phaseStyle = (() => {
    switch (phase.label) {
      case 'Inhale':  return { glow: '#00BCD4', size: 160 };
      case 'Hold':    return { glow: '#FFA726', size: 160 };
      case 'Exhale':  return { glow: '#AB47BC', size: 80 };
      default:        return { glow: '#FFA726', size: 120 };
    }
  })();

  useEffect(() => {
    setCircleSize(phaseStyle.size);
  }, [phaseIdx]); // eslint-disable-line

  useEffect(() => {
    if (cyclesDone >= totalCycles) return;
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          setPhaseIdx(pi => {
            const next = (pi + 1) % exercise.phases.length;
            if (next === 0) setCyclesDone(c => c + 1);
            setCount(exercise.phases[next].duration);
            return next;
          });
          return exercise.phases[(phaseIdx + 1) % exercise.phases.length].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phaseIdx, exercise, cyclesDone]); // eslint-disable-line

  const progress = (exercise.phases[phaseIdx].duration - count) / exercise.phases[phaseIdx].duration;
  const circumference = 2 * Math.PI * 70;
  const dash = circumference * progress;

  const done = cyclesDone >= totalCycles;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0D0D1A',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      {/* close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.1)', border: 'none', color: '#F5F5F5',
        borderRadius: '50%', width: 40, height: 40, fontSize: 20, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>×</button>

      <div style={{ color: '#F5F5F5', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{exercise.name}</div>
      <div style={{ color: 'rgba(245,245,245,0.5)', fontSize: 14, marginBottom: 48 }}>
        {done ? 'Session complete' : `Cycle ${cyclesDone + 1} of ${totalCycles}`}
      </div>

      {/* Circle + SVG ring */}
      <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* SVG arc */}
        <svg width="200" height="200" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle
            cx="100" cy="100" r="70" fill="none"
            stroke="#00BCD4" strokeWidth="4"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dasharray 0.9s linear' }}
          />
        </svg>
        {/* Animated circle */}
        <div style={{
          width: circleSize, height: circleSize,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,188,212,0.3) 0%, rgba(0,188,212,0.05) 100%)',
          border: `2px solid ${phaseStyle.glow}`,
          boxShadow: `0 0 30px ${phaseStyle.glow}60`,
          transition: 'width 0.9s ease, height 0.9s ease, border-color 0.5s, box-shadow 0.5s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#F5F5F5', fontSize: 36, fontWeight: 700 }}>
            {done ? '✓' : count}
          </span>
        </div>
      </div>

      <div style={{ color: '#F5F5F5', fontSize: 20, marginTop: 28, letterSpacing: 2 }}>
        {done ? 'Well done' : phase.label.toUpperCase()}
      </div>

      {done && (
        <button onClick={onClose} style={{
          marginTop: 32, padding: '12px 40px',
          background: '#00BCD4', border: 'none', color: '#0D0D1A',
          borderRadius: 30, fontSize: 16, fontWeight: 700, cursor: 'pointer',
        }}>Done</button>
      )}
    </div>
  );
}

// ─── LOG SESSION MODAL ────────────────────────────────────────────────────────
function LogSessionModal({ onClose, onSave }) {
  const [dur, setDur]   = useState('10');
  const [type, setType] = useState('Guided');
  const [notes, setNotes] = useState('');
  const [moodAfter, setMoodAfter] = useState(null);
  const emojis = ['😞','😕','😐','🙂','😄'];
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: '#1A1A2E', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ color: '#F5F5F5', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Log Session</div>

        <label style={labelStyle}>Duration (min)</label>
        <input type="number" min="1" value={dur} onChange={e => setDur(e.target.value)}
          style={{ ...inputStyle, marginBottom: 14 }} />

        <label style={labelStyle}>Type</label>
        <select value={type} onChange={e => setType(e.target.value)}
          style={{ ...inputStyle, marginBottom: 14 }}>
          {MEDITATION_CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
        </select>

        <label style={labelStyle}>Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="How was it?"
          style={{ ...inputStyle, height: 64, resize: 'vertical', marginBottom: 14 }} />

        <label style={labelStyle}>Mood after</label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {emojis.map((em, i) => (
            <button key={i} onClick={() => setMoodAfter(i + 1)}
              style={{
                fontSize: 24, background: moodAfter === i + 1 ? 'rgba(0,188,212,0.3)' : 'transparent',
                border: moodAfter === i + 1 ? '2px solid #00BCD4' : '2px solid transparent',
                borderRadius: 10, padding: 6, cursor: 'pointer',
              }}>{em}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 0', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)', color: '#F5F5F5',
            borderRadius: 30, cursor: 'pointer', fontSize: 15,
          }}>Cancel</button>
          <button onClick={() => { onSave({ duration: Number(dur), type, notes, moodAfter }); onClose(); }}
            style={tealBtnStyle}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const labelStyle = {
  display: 'block', color: 'rgba(245,245,245,0.6)', fontSize: 12,
  marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1,
};
const inputStyle = {
  width: '100%', background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 10, padding: '10px 14px', color: '#F5F5F5', fontSize: 15,
  boxSizing: 'border-box', outline: 'none',
};
const tealBtnStyle = {
  flex: 1, padding: '12px 0', background: '#00BCD4', border: 'none',
  color: '#0D0D1A', borderRadius: 30, cursor: 'pointer', fontWeight: 700, fontSize: 15,
};

// ─── SLIDER ───────────────────────────────────────────────────────────────────
function Slider({ label, value, onChange }) {
  const pct = ((value - 1) / 9) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#F5F5F5', fontSize: 15, fontWeight: 600 }}>{label}</span>
        <span style={{ color: '#00BCD4', fontWeight: 700, fontSize: 15 }}>{value}</span>
      </div>
      <input
        type="range" min="1" max="10" value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%', height: 6, borderRadius: 3, outline: 'none', cursor: 'pointer',
          appearance: 'none', WebkitAppearance: 'none',
          background: `linear-gradient(to right, #00BCD4 0%, #00BCD4 ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`,
        }}
      />
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WellbeingView({ wellbeing = {}, period = {}, onSetWellbeing, onSetPeriod, onAddBonusXP }) {
  // merge mock + real (real wins)
  const mergedWellbeing = { ...MOCK_WELLBEING, ...wellbeing };

  // ── tabs
  const [activeTab, setActiveTab] = useState('checkin');

  // ── check-in state
  const [stress,   setStress]   = useState(5);
  const [energy,   setEnergy]   = useState(5);
  const [mood,     setMood]     = useState(5);
  const [feelings, setFeelings] = useState([]);
  const [notes,    setNotes]    = useState('');
  const promptIdx = useRef(Math.floor(Math.random() * JOURNAL_PROMPTS.length));

  // ── breathing
  const [activeExercise, setActiveExercise] = useState(null);

  // ── meditation
  const [meditationTimer, setMeditationTimer] = useState(null); // { durationSec, elapsed, paused }
  const [showLogModal,    setShowLogModal]    = useState(false);
  const [sessionsToday,   setSessionsToday]   = useState([]);
  const [streakDays]      = useState(4);
  const medTimerRef       = useRef(null);

  // ── period
  const [cycleDay]          = useState(period.cycleDay   || 14);
  const [periodPhase]       = useState(period.phase      || 'Follicular');
  const [selectedSymptoms,  setSelectedSymptoms] = useState(period.symptoms || []);

  // ── assessment
  const [assessmentType,    setAssessmentType]    = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState([]);
  const [assessmentQ,       setAssessmentQ]       = useState(0);
  const [assessmentDone,    setAssessmentDone]    = useState(false);

  // ── meditation timer effect
  useEffect(() => {
    if (!meditationTimer || meditationTimer.paused) {
      clearInterval(medTimerRef.current);
      return;
    }
    medTimerRef.current = setInterval(() => {
      setMeditationTimer(prev => {
        if (!prev) return null;
        const next = prev.elapsed + 1;
        if (next >= prev.durationSec) {
          clearInterval(medTimerRef.current);
          return { ...prev, elapsed: prev.durationSec, paused: true };
        }
        return { ...prev, elapsed: next };
      });
    }, 1000);
    return () => clearInterval(medTimerRef.current);
  }, [meditationTimer?.paused, meditationTimer?.durationSec]); // eslint-disable-line

  // ── helpers
  const toggleFeeling = (f) => setFeelings(prev =>
    prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
  );
  const toggleSymptom = (s) => setSelectedSymptoms(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );
  const saveCheckin = () => {
    const key = todayKey();
    const data = { stress, energy, mood, feelings, notes };
    if (onSetWellbeing) onSetWellbeing(key, data);
    if (onAddBonusXP)   onAddBonusXP(10);
    setNotes('');
  };

  const startMeditation = (min) => {
    setMeditationTimer({ durationSec: min * 60, elapsed: 0, paused: false });
  };
  const stopMeditation = () => {
    clearInterval(medTimerRef.current);
    const mins = Math.floor((meditationTimer?.elapsed || 0) / 60);
    if (mins > 0) setSessionsToday(prev => [...prev, mins]);
    setMeditationTimer(null);
  };

  const startAssessment = (type) => {
    setAssessmentType(type);
    setAssessmentAnswers([]);
    setAssessmentQ(0);
    setAssessmentDone(false);
  };
  const answerQuestion = (val) => {
    const questions = assessmentType === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
    const newAnswers = [...assessmentAnswers, val];
    setAssessmentAnswers(newAnswers);
    if (assessmentQ + 1 >= questions.length) {
      setAssessmentDone(true);
    } else {
      setAssessmentQ(assessmentQ + 1);
    }
  };

  const totalMinToday = sessionsToday.reduce((a, b) => a + b, 0);

  // last 7 days for mood strip
  const last7 = (() => {
    const arr = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      arr.push({ key: k, data: mergedWellbeing[k] || null });
    }
    return arr;
  })();

  // ─── TAB BAR ────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'checkin',    label: 'Check-in' },
    { id: 'breathing',  label: 'Breathing' },
    { id: 'meditation', label: 'Meditation' },
    { id: 'period',     label: 'Period' },
    { id: 'assessment', label: 'Assessment' },
  ];

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#0D0D1A', minHeight: '100vh', color: '#F5F5F5', fontFamily: 'Inter, sans-serif', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ padding: '28px 20px 0' }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#F5F5F5', letterSpacing: -0.5 }}>Wellbeing</div>
        <div style={{ color: 'rgba(245,245,245,0.45)', fontSize: 13, marginTop: 2 }}>Mind, body & inner balance</div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 8, padding: '18px 20px 0',
        overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '8px 18px', borderRadius: 30, border: 'none', whiteSpace: 'nowrap',
            cursor: 'pointer', fontSize: 14, fontWeight: 600,
            background: activeTab === t.id ? '#00BCD4' : 'rgba(255,255,255,0.08)',
            color: activeTab === t.id ? '#0D0D1A' : 'rgba(245,245,245,0.55)',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '24px 20px 0' }}>

        {/* ═══════════════════════════════ CHECK-IN ═══════════════════════════ */}
        {activeTab === 'checkin' && (
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#F5F5F5', marginBottom: 24 }}>
              How are you feeling?
            </div>

            {/* Sliders */}
            <div style={{ background: '#1A1A2E', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <Slider label="😤 Stress" value={stress} onChange={setStress} />
              <Slider label="⚡ Energy" value={energy} onChange={setEnergy} />
              <Slider label="😊 Mood"   value={mood}   onChange={setMood} />
            </div>

            {/* Feelings grid */}
            <div style={{ background: '#1A1A2E', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ color: 'rgba(245,245,245,0.55)', fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Feelings</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {FEELINGS.map(f => (
                  <button key={f} onClick={() => toggleFeeling(f)} style={{
                    padding: '8px 4px', borderRadius: 20, border: feelings.includes(f) ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    background: feelings.includes(f) ? '#00BCD4' : 'transparent',
                    color: feelings.includes(f) ? '#0D0D1A' : 'rgba(245,245,245,0.55)',
                    fontWeight: feelings.includes(f) ? 700 : 400,
                    fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                  }}>{f}</button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ background: '#1A1A2E', borderRadius: 16, padding: 20, marginBottom: 16 }}>
              <div style={{ color: 'rgba(245,245,245,0.55)', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>What's on your mind?</div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Write freely…"
                style={{
                  width: '100%', height: 80, background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                  color: '#F5F5F5', fontSize: 15, padding: '10px 12px',
                  resize: 'none', outline: 'none', boxSizing: 'border-box',
                }} />
            </div>

            {/* Journal prompt */}
            <div style={{
              background: '#1A1A2E', borderRadius: 16, padding: 20, marginBottom: 20,
              borderLeft: '3px solid #00BCD4',
            }}>
              <div style={{ color: '#00BCD4', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Journal Prompt</div>
              <div style={{ color: '#F5F5F5', fontSize: 15, lineHeight: 1.5 }}>
                {JOURNAL_PROMPTS[promptIdx.current]}
              </div>
            </div>

            {/* Save button */}
            <button onClick={saveCheckin} style={{
              width: '100%', padding: '15px 0', background: '#00BCD4', border: 'none',
              color: '#0D0D1A', borderRadius: 30, fontWeight: 700, fontSize: 16, cursor: 'pointer',
              marginBottom: 24,
            }}>Save Check-in (+10 XP)</button>

            {/* Past 7 days mood strip */}
            <div style={{ background: '#1A1A2E', borderRadius: 16, padding: 16 }}>
              <div style={{ color: 'rgba(245,245,245,0.55)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Last 7 Days</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
                {last7.map(({ key, data }) => {
                  const val = data?.mood || 0;
                  const maxH = 48;
                  return (
                    <div key={key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: '100%', height: val ? Math.max(8, (val / 10) * maxH) : 4,
                        background: val ? moodColor(val) : 'rgba(255,255,255,0.1)',
                        borderRadius: 4, transition: 'height 0.3s',
                      }} />
                      <div style={{ color: 'rgba(245,245,245,0.35)', fontSize: 9 }}>
                        {key.split('-')[2]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════ BREATHING ══════════════════════════ */}
        {activeTab === 'breathing' && (
          <div>
            {activeExercise ? (
              <BreathingSession exercise={activeExercise} onClose={() => setActiveExercise(null)} />
            ) : (
              <>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#F5F5F5', marginBottom: 20 }}>Breathing Exercises</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {BREATHING_EXERCISES.map(ex => (
                    <button key={ex.id} onClick={() => setActiveExercise(ex)} style={{
                      background: '#1A1A2E', border: 'none', borderRadius: 16,
                      padding: 0, cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
                    }}>
                      {/* gradient thumb */}
                      <div style={{ height: 60, background: ex.gradient, width: '100%' }} />
                      <div style={{ padding: '12px 14px' }}>
                        <div style={{ color: '#F5F5F5', fontWeight: 700, fontSize: 14 }}>{ex.name}</div>
                        <div style={{ color: '#00BCD4', fontSize: 12, marginTop: 2 }}>{ex.pattern}</div>
                        <div style={{ color: 'rgba(245,245,245,0.5)', fontSize: 11, marginTop: 4, lineHeight: 1.4 }}>{ex.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ═══════════════════════════════ MEDITATION ═════════════════════════ */}
        {activeTab === 'meditation' && (
          <div>
            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
              {[
                { icon: '🔥', val: `${streakDays}d`, lbl: 'Streak' },
                { icon: '⏱', val: `${totalMinToday}m`, lbl: 'Today' },
                { icon: '📅', val: `${sessionsToday.length + 3}`, lbl: 'Sessions' },
              ].map(s => (
                <div key={s.lbl} style={{ background: '#1A1A2E', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22 }}>{s.icon}</div>
                  <div style={{ color: '#F5F5F5', fontWeight: 700, fontSize: 18 }}>{s.val}</div>
                  <div style={{ color: 'rgba(245,245,245,0.45)', fontSize: 11 }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Active timer */}
            {meditationTimer ? (
              <div style={{
                background: '#1A1A2E', borderRadius: 20, padding: 32,
                textAlign: 'center', marginBottom: 24, position: 'relative',
              }}>
                {/* Pulsing bg */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 200, height: 200, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,188,212,0.08) 0%, transparent 70%)',
                  animation: 'pulse 3s ease-in-out infinite',
                }} />
                <style>{`@keyframes pulse { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.15)} }`}</style>
                <div style={{ color: '#F5F5F5', fontSize: 52, fontWeight: 800, letterSpacing: 2, position: 'relative' }}>
                  {pad2(Math.floor((meditationTimer.durationSec - meditationTimer.elapsed) / 60))}:{pad2((meditationTimer.durationSec - meditationTimer.elapsed) % 60)}
                </div>
                <div style={{ color: 'rgba(245,245,245,0.45)', fontSize: 13, marginTop: 4, marginBottom: 24, position: 'relative' }}>
                  {meditationTimer.paused ? 'Paused' : 'In progress'}
                </div>
                {/* Progress bar */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 24 }}>
                  <div style={{
                    height: '100%', borderRadius: 2, background: '#00BCD4',
                    width: `${(meditationTimer.elapsed / meditationTimer.durationSec) * 100}%`,
                    transition: 'width 0.9s linear',
                  }} />
                </div>
                <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  <button onClick={() => setMeditationTimer(p => ({ ...p, paused: !p.paused }))} style={{
                    flex: 1, padding: '12px 0', background: 'rgba(255,255,255,0.1)', border: 'none',
                    color: '#F5F5F5', borderRadius: 30, cursor: 'pointer', fontWeight: 700, fontSize: 15,
                  }}>{meditationTimer.paused ? 'Resume' : 'Pause'}</button>
                  <button onClick={stopMeditation} style={{
                    flex: 1, padding: '12px 0', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)', color: '#F5F5F5',
                    borderRadius: 30, cursor: 'pointer', fontWeight: 700, fontSize: 15,
                  }}>Stop</button>
                </div>
              </div>
            ) : (
              <>
                {/* Quick start */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ color: 'rgba(245,245,245,0.55)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Quick Start</div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[5, 10, 20].map(m => (
                      <button key={m} onClick={() => startMeditation(m)} style={{
                        padding: '10px 22px', background: '#00BCD4', border: 'none',
                        color: '#0D0D1A', borderRadius: 30, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}>{m} min</button>
                    ))}
                    <button onClick={() => {
                      const val = prompt('Enter duration (minutes):');
                      const n = parseInt(val);
                      if (n > 0) startMeditation(n);
                    }} style={{
                      padding: '10px 22px', background: 'transparent',
                      border: '1px solid #00BCD4', color: '#00BCD4',
                      borderRadius: 30, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}>Custom</button>
                  </div>
                </div>
              </>
            )}

            {/* Categories horizontal scroll */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: 'rgba(245,245,245,0.55)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Categories</div>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                {MEDITATION_CATEGORIES.map(c => (
                  <div key={c.name} style={{ flexShrink: 0, width: 80, cursor: 'pointer' }}>
                    <div style={{ height: 60, borderRadius: 12, background: c.gradient, marginBottom: 6 }} />
                    <div style={{ color: '#F5F5F5', fontSize: 12, textAlign: 'center', fontWeight: 600 }}>{c.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Log Session button */}
            <button onClick={() => setShowLogModal(true)} style={{
              width: '100%', padding: '13px 0',
              background: 'transparent', border: '1.5px solid #00BCD4',
              color: '#00BCD4', borderRadius: 30, fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>Log Session</button>

            {showLogModal && (
              <LogSessionModal
                onClose={() => setShowLogModal(false)}
                onSave={(d) => setSessionsToday(p => [...p, d.duration])}
              />
            )}
          </div>
        )}

        {/* ═══════════════════════════════ PERIOD ═════════════════════════════ */}
        {activeTab === 'period' && (
          <div>
            {/* Cycle day */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: '#F5F5F5', lineHeight: 1 }}>Day {cycleDay}</div>
              <div style={{ color: 'rgba(245,245,245,0.45)', fontSize: 15, marginTop: 4 }}>of your cycle</div>
            </div>

            {/* Phase arc */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
              <PhaseArc phase={periodPhase} />
              <div style={{
                marginTop: 10, fontSize: 20, fontWeight: 700,
                color: PHASE_COLORS[periodPhase] || '#00BCD4',
              }}>{periodPhase} Phase</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {Object.entries(PHASE_COLORS).map(([p, c]) => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: p === periodPhase ? 1 : 0.4 }} />
                    <span style={{ color: p === periodPhase ? '#F5F5F5' : 'rgba(245,245,245,0.4)', fontSize: 12 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Log buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button style={{ flex: 1, padding: '12px 0', background: '#00BCD4', border: 'none', color: '#0D0D1A', borderRadius: 30, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Log period start
              </button>
              <button style={{ flex: 1, padding: '12px 0', background: 'transparent', border: '1.5px solid #00BCD4', color: '#00BCD4', borderRadius: 30, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Log period end
              </button>
            </div>

            {/* Symptoms */}
            <div style={{ background: '#1A1A2E', borderRadius: 16, padding: 18, marginBottom: 16 }}>
              <div style={{ color: 'rgba(245,245,245,0.55)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Symptoms</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PERIOD_SYMPTOMS.map(s => (
                  <button key={s} onClick={() => toggleSymptom(s)} style={{
                    padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    background: selectedSymptoms.includes(s) ? '#00BCD4' : 'rgba(255,255,255,0.08)',
                    color: selectedSymptoms.includes(s) ? '#0D0D1A' : 'rgba(245,245,245,0.6)',
                    fontWeight: selectedSymptoms.includes(s) ? 700 : 400,
                    fontSize: 13, transition: 'all 0.15s',
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Predicted next */}
            <div style={{ background: '#1A1A2E', borderRadius: 16, padding: 18 }}>
              <div style={{ color: 'rgba(245,245,245,0.55)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Next Period</div>
              <div style={{ color: '#F5F5F5', fontSize: 18, fontWeight: 700, marginTop: 6 }}>Predicted in 14 days</div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════ ASSESSMENT ═════════════════════════ */}
        {activeTab === 'assessment' && (
          <div>
            {/* Disclaimer */}
            <div style={{
              background: '#1A1A2E', borderRadius: 14, padding: 16, marginBottom: 24,
              borderLeft: '2px solid #FFA726',
            }}>
              <div style={{ color: '#FFA726', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>DISCLAIMER</div>
              <div style={{ color: 'rgba(245,245,245,0.65)', fontSize: 13, lineHeight: 1.5 }}>
                This is a screening tool only. Consult a healthcare professional for diagnosis and treatment.
              </div>
            </div>

            {!assessmentType ? (
              /* Card picker */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { type: 'phq9', name: 'PHQ-9 Depression Screen', desc: 'A validated 9-question screen for depressive symptoms over the past two weeks.', qs: 9 },
                  { type: 'gad7', name: 'GAD-7 Anxiety Screen', desc: 'A validated 7-question tool to assess the severity of generalised anxiety disorder.', qs: 7 },
                ].map(a => (
                  <div key={a.type} style={{ background: '#1A1A2E', borderRadius: 16, padding: 20 }}>
                    <div style={{ color: '#F5F5F5', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{a.name}</div>
                    <div style={{ color: 'rgba(245,245,245,0.55)', fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>{a.desc}</div>
                    <div style={{ color: 'rgba(245,245,245,0.35)', fontSize: 12, marginBottom: 14 }}>{a.qs} questions · ~2 minutes</div>
                    <button onClick={() => startAssessment(a.type)} style={{
                      padding: '11px 28px', background: '#00BCD4', border: 'none',
                      color: '#0D0D1A', borderRadius: 30, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}>Take Assessment</button>
                  </div>
                ))}
              </div>
            ) : assessmentDone ? (
              /* Results */
              (() => {
                const score = assessmentAnswers.reduce((a, b) => a + b, 0);
                const sev = severityLabel(score, assessmentType);
                const maxScore = assessmentType === 'phq9' ? 27 : 21;
                return (
                  <div style={{ background: '#1A1A2E', borderRadius: 20, padding: 28, textAlign: 'center' }}>
                    <div style={{ color: 'rgba(245,245,245,0.55)', fontSize: 13, marginBottom: 8 }}>
                      {assessmentType === 'phq9' ? 'PHQ-9' : 'GAD-7'} Results
                    </div>
                    <div style={{ fontSize: 64, fontWeight: 800, color: '#F5F5F5', lineHeight: 1 }}>{score}</div>
                    <div style={{ color: 'rgba(245,245,245,0.35)', fontSize: 14, marginBottom: 16 }}>out of {maxScore}</div>
                    <div style={{
                      display: 'inline-block', padding: '6px 20px', borderRadius: 20,
                      background: sev.color + '30', color: sev.color, fontWeight: 700, fontSize: 16, marginBottom: 24,
                    }}>{sev.label}</div>
                    <div style={{ color: 'rgba(245,245,245,0.5)', fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
                      Remember: these scores are informational only. Please speak with a qualified professional for personalised guidance.
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => startAssessment(assessmentType)} style={{
                        flex: 1, padding: '12px 0', background: '#00BCD4', border: 'none',
                        color: '#0D0D1A', borderRadius: 30, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}>Retake</button>
                      <button onClick={() => setAssessmentType(null)} style={{
                        flex: 1, padding: '12px 0', background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)', color: '#F5F5F5',
                        borderRadius: 30, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}>Back</button>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Question view */
              (() => {
                const questions = assessmentType === 'phq9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
                const total = questions.length;
                const q = questions[assessmentQ];
                const pct = (assessmentQ / total) * 100;
                return (
                  <div>
                    {/* Progress */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ color: 'rgba(245,245,245,0.45)', fontSize: 13 }}>
                        {assessmentType === 'phq9' ? 'PHQ-9' : 'GAD-7'}
                      </div>
                      <div style={{ color: '#00BCD4', fontWeight: 700, fontSize: 13 }}>Q {assessmentQ + 1} of {total}</div>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 28 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: '#00BCD4', width: `${pct}%`, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ color: '#F5F5F5', fontSize: 18, fontWeight: 600, lineHeight: 1.5, marginBottom: 32 }}>
                      Over the last 2 weeks, how often have you been bothered by:<br />
                      <span style={{ color: '#00BCD4' }}>{q}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                      {ASSESSMENT_OPTIONS.map((opt, i) => (
                        <button key={opt} onClick={() => answerQuestion(i)} style={{
                          padding: '15px 20px', background: '#1A1A2E', border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 14, color: '#F5F5F5', fontSize: 15, textAlign: 'left', cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#00BCD4'; e.currentTarget.style.background = 'rgba(0,188,212,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = '#1A1A2E'; }}
                        >{opt}</button>
                      ))}
                    </div>
                    {assessmentQ > 0 && (
                      <button onClick={() => {
                        setAssessmentQ(q => q - 1);
                        setAssessmentAnswers(a => a.slice(0, -1));
                      }} style={{
                        background: 'none', border: 'none', color: 'rgba(245,245,245,0.45)',
                        fontSize: 14, cursor: 'pointer', textDecoration: 'underline',
                      }}>← Previous</button>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}

      </div>
    </div>
  );
}
