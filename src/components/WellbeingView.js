import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis,
  AreaChart, Area, ReferenceArea, Tooltip,
} from 'recharts';

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
  const stressArr = [4, 6, 3, 7, 2, 5, 8];
  const energyArr = [7, 5, 9, 4, 8, 6, 7];
  const moodArr   = [6, 5, 8, 4, 7, 6, 8];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    data[key] = {
      stress:   stressArr[6 - i],
      energy:   energyArr[6 - i],
      mood:     moodArr[6 - i],
      feelings: feelingPool[6 - i],
      notes:    notePool[6 - i],
    };
  }
  return data;
}
const MOCK_WELLBEING = buildMockWellbeing();

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
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
    gradient: 'linear-gradient(135deg, #00BCD4, #0097A7)',
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
    gradient: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
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

const CHECKIN_PROMPTS = [
  "What's one thing you're grateful for today?",
  "What would make today great?",
  "How are you really feeling right now?",
  "What's draining your energy?",
  "What are you proud of this week?",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function severityLabel(score, type) {
  if (type === 'phq9') {
    if (score <= 4)  return { label: 'Minimal',     color: '#66BB6A' };
    if (score <= 9)  return { label: 'Mild',        color: '#FFD54F' };
    if (score <= 14) return { label: 'Moderate',    color: '#FFA726' };
    if (score <= 19) return { label: 'Mod-Severe',  color: '#EF5350' };
    return               { label: 'Severe',      color: '#B71C1C' };
  }
  if (score <= 4)  return { label: 'Minimal',  color: '#66BB6A' };
  if (score <= 9)  return { label: 'Mild',     color: '#FFD54F' };
  if (score <= 14) return { label: 'Moderate', color: '#FFA726' };
  return               { label: 'Severe',   color: '#EF5350' };
}

function pad2(n) { return String(n).padStart(2, '0'); }

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const BG       = '#0A0A14';
const SURFACE  = '#12121F';
const ELEVATED = '#1A1A2E';
const TEAL     = '#00BCD4';
const TEXT     = '#FFFFFF';
const MUTED    = '#8888AA';
const BORDER   = '1px solid rgba(255,255,255,0.08)';

const card = {
  background: SURFACE,
  borderRadius: 16,
  border: BORDER,
  padding: 16,
  boxSizing: 'border-box',
};

const elevatedCard = {
  background: ELEVATED,
  borderRadius: 16,
  border: BORDER,
  padding: 16,
  boxSizing: 'border-box',
};

// ─── BREATHING SESSION ────────────────────────────────────────────────────────
function BreathingSession({ exercise, onClose }) {
  const [phaseIdx,    setPhaseIdx]    = useState(0);
  const [count,       setCount]       = useState(exercise.phases[0].duration);
  const [cyclesDone,  setCyclesDone]  = useState(0);
  const [circleSize,  setCircleSize]  = useState(120);
  const totalCycles = 4;

  const phase = exercise.phases[phaseIdx];

  const phaseStyle = (() => {
    switch (phase.label) {
      case 'Inhale': return { glow: TEAL,      size: 160 };
      case 'Hold':   return { glow: '#FFA726', size: 160 };
      case 'Exhale': return { glow: '#AB47BC', size: 80  };
      default:       return { glow: '#FFA726', size: 120 };
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

  const progress      = (exercise.phases[phaseIdx].duration - count) / exercise.phases[phaseIdx].duration;
  const circumference = 2 * Math.PI * 70;
  const dash          = circumference * progress;
  const done          = cyclesDone >= totalCycles;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.1)', border: 'none', color: TEXT,
        borderRadius: '50%', width: 40, height: 40, fontSize: 20, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>×</button>

      <div style={{ color: TEXT, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{exercise.name}</div>
      <div style={{ color: MUTED, fontSize: 14, marginBottom: 48 }}>
        {done ? 'Session complete' : `Cycle ${cyclesDone + 1} of ${totalCycles}`}
      </div>

      <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="200" height="200" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle
            cx="100" cy="100" r="70" fill="none"
            stroke={TEAL} strokeWidth="4"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dasharray 0.9s linear' }}
          />
        </svg>
        <div style={{
          width: circleSize, height: circleSize,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,188,212,0.3) 0%, rgba(0,188,212,0.05) 100%)',
          border: `2px solid ${phaseStyle.glow}`,
          boxShadow: `0 0 30px ${phaseStyle.glow}60`,
          transition: 'width 0.9s ease, height 0.9s ease, border-color 0.5s, box-shadow 0.5s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: TEXT, fontSize: 36, fontWeight: 700 }}>
            {done ? '✓' : count}
          </span>
        </div>
      </div>

      <div style={{ color: TEXT, fontSize: 20, marginTop: 28, letterSpacing: 2 }}>
        {done ? 'Well done' : phase.label.toUpperCase()}
      </div>

      <button onClick={onClose} style={{
        marginTop: 32, padding: '12px 40px',
        background: done ? TEAL : 'rgba(255,255,255,0.12)',
        border: 'none',
        color: done ? '#0A0A14' : TEXT,
        borderRadius: 30, fontSize: 16, fontWeight: 700, cursor: 'pointer',
      }}>{done ? 'Done' : 'End Session'}</button>
    </div>
  );
}

// ─── LOG SESSION MODAL ────────────────────────────────────────────────────────
function LogSessionModal({ onClose, onSave }) {
  const [dur,       setDur]       = useState('10');
  const [type,      setType]      = useState('Guided');
  const [notes,     setNotes]     = useState('');
  const [moodAfter, setMoodAfter] = useState(null);
  const emojis = ['😞','😕','😐','🙂','😄'];
  const iStyle = {
    width: '100%', background: BG, border: `1px solid rgba(255,255,255,0.15)`,
    borderRadius: 10, padding: '10px 14px', color: TEXT, fontSize: 15,
    boxSizing: 'border-box', outline: 'none', marginBottom: 14,
  };
  const lStyle = {
    display: 'block', color: MUTED, fontSize: 12,
    marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1,
  };
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20,
    }} onClick={onClose}>
      <div style={{ background: ELEVATED, borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 }}
           onClick={e => e.stopPropagation()}>
        <div style={{ color: TEXT, fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Log Session</div>
        <label style={lStyle}>Duration (min)</label>
        <input type="number" min="1" value={dur} onChange={e => setDur(e.target.value)} style={iStyle} />
        <label style={lStyle}>Type</label>
        <select value={type} onChange={e => setType(e.target.value)} style={{ ...iStyle, background: BG }}>
          {MEDITATION_CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
        </select>
        <label style={lStyle}>Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="How was it?"
          style={{ ...iStyle, height: 64, resize: 'vertical' }} />
        <label style={lStyle}>Mood after</label>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {emojis.map((em, i) => (
            <button key={i} onClick={() => setMoodAfter(i + 1)} style={{
              fontSize: 24,
              background: moodAfter === i + 1 ? 'rgba(0,188,212,0.3)' : 'transparent',
              border: moodAfter === i + 1 ? `2px solid ${TEAL}` : '2px solid transparent',
              borderRadius: 10, padding: 6, cursor: 'pointer',
            }}>{em}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '12px 0', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)', color: TEXT,
            borderRadius: 30, cursor: 'pointer', fontSize: 15,
          }}>Cancel</button>
          <button onClick={() => { onSave({ duration: Number(dur), type, notes, moodAfter }); onClose(); }}
            style={{
              flex: 1, padding: '12px 0', background: TEAL, border: 'none',
              color: '#0A0A14', borderRadius: 30, cursor: 'pointer', fontWeight: 700, fontSize: 15,
            }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WellbeingView({ wellbeing = {}, period = {}, onSetWellbeing, onSetPeriod, onAddBonusXP }) {
  const mergedWellbeing = { ...MOCK_WELLBEING, ...wellbeing };

  // ── inner tab
  const [innerTab, setInnerTab] = useState('checkin');

  // ── check-in state
  const [stress,   setStress]   = useState(5);
  const [energy,   setEnergy]   = useState(5);
  const [mood,     setMood]     = useState(5);
  const [feelings, setFeelings] = useState([]);
  const [notes,    setNotes]    = useState('');
  const [promptIdx, setPromptIdx] = useState(0);

  // rotating prompt every 10s
  useEffect(() => {
    const id = setInterval(() => {
      setPromptIdx(p => (p + 1) % CHECKIN_PROMPTS.length);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  // ── breathing
  const [activeExercise, setActiveExercise] = useState(null);

  // ── meditation
  const [meditationTimer, setMeditationTimer] = useState(null);
  const [showLogModal,    setShowLogModal]    = useState(false);
  const [sessionsToday,   setSessionsToday]   = useState([]);
  const [streakDays]      = useState(7);
  const medTimerRef       = useRef(null);

  // ── period
  const [selectedSymptoms, setSelectedSymptoms] = useState(period.symptoms || ['Cramps']);

  // ── assessment
  const [assessmentType,    setAssessmentType]    = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState([]);
  const [assessmentQ,       setAssessmentQ]       = useState(0);
  const [assessmentDone,    setAssessmentDone]    = useState(false);

  // meditation timer effect
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
  const toggleFeeling = f => setFeelings(prev =>
    prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
  );
  const toggleSymptom = s => setSelectedSymptoms(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );
  const saveCheckin = () => {
    const key = todayKey();
    const data = { stress, energy, mood, feelings, notes };
    if (onSetWellbeing) onSetWellbeing(key, data);
    if (onAddBonusXP)   onAddBonusXP(10);
    setNotes('');
  };
  const startMeditation = min => {
    setMeditationTimer({ durationSec: min * 60, elapsed: 0, paused: false });
  };
  const stopMeditation = () => {
    clearInterval(medTimerRef.current);
    const mins = Math.floor((meditationTimer?.elapsed || 0) / 60);
    if (mins > 0) setSessionsToday(prev => [...prev, mins]);
    setMeditationTimer(null);
  };
  const startAssessment = type => {
    setAssessmentType(type);
    setAssessmentAnswers([]);
    setAssessmentQ(0);
    setAssessmentDone(false);
  };
  const answerQuestion = val => {
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

  // ─── INNER TAB BAR ──────────────────────────────────────────────────────────
  const TABS = [
    { id: 'checkin',    label: 'Check-in'   },
    { id: 'breathing',  label: 'Breathing'  },
    { id: 'meditation', label: 'Meditation' },
    { id: 'energy',     label: 'Energy'     },
    { id: 'stress',     label: 'Stress'     },
    { id: 'period',     label: 'Period'     },
    { id: 'assessment', label: 'Assessment' },
  ];

  // ─── ENERGY CHART DATA ──────────────────────────────────────────────────────
  const energyRaw  = [60,55,50,45,40,38,40,55,70,80,82,78,75,72,70,68,65,60,55,50,48,45,42,40];
  const stressRaw  = [30,28,25,22,20,18,20,35,50,60,55,50,60,65,70,68,65,55,45,40,35,30,28,25];
  const energyChartData = energyRaw.map((e, i) => ({ hour: i, energy: e, stress: stressRaw[i] }));

  // ─── STRESS CHART DATA ──────────────────────────────────────────────────────
  const stressSeriesRaw = [30,28,25,22,20,18,20,35,60,70,65,60,55,50,55,65,70,60,50,45,40,35,30,28];
  const stressChartData = stressSeriesRaw.map((s, i) => ({ hour: i, stress: s }));

  // ─── ASSESSMENT 7-DAY MOCK ──────────────────────────────────────────────────
  const assessmentHistory = [
    { day: 'Mon', phq: 5, gad: 4 },
    { day: 'Tue', phq: 6, gad: 5 },
    { day: 'Wed', phq: 4, gad: 3 },
    { day: 'Thu', phq: 7, gad: 6 },
    { day: 'Fri', phq: 5, gad: 4 },
    { day: 'Sat', phq: 4, gad: 3 },
    { day: 'Sun', phq: 5, gad: 4 },
  ];

  // determine bg for the whole view
  const isPeriodTab = innerTab === 'period';
  const viewBg = isPeriodTab ? '#FAFAFA' : BG;

  return (
    <div style={{ background: viewBg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', paddingBottom: 120, boxSizing: 'border-box' }}>

      {/* Header */}
      <div style={{ padding: '28px 20px 0' }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: isPeriodTab ? '#1A1A2E' : TEXT, letterSpacing: -0.5 }}>Wellbeing</div>
        <div style={{ color: isPeriodTab ? '#666' : MUTED, fontSize: 13, marginTop: 2 }}>Mind, body & inner balance</div>
      </div>

      {/* ── INNER TAB BAR ─────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 16px 12px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{
          background: ELEVATED,
          borderRadius: 12,
          padding: 4,
          display: 'flex',
          gap: 4,
          width: 'max-content',
          minWidth: '100%',
          boxSizing: 'border-box',
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setInnerTab(t.id)}
              style={{
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: 13,
                height: 36,
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: innerTab === t.id ? 700 : 400,
                background: innerTab === t.id ? '#FFFFFF' : 'transparent',
                color: innerTab === t.id ? '#0A0A14' : MUTED,
                transition: 'all 0.2s',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ───────────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px', boxSizing: 'border-box' }}>

        {/* ════════════════════════ CHECK-IN ════════════════════════════════ */}
        {innerTab === 'checkin' && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 20 }}>How are you feeling?</div>

            {/* Sliders */}
            <div style={{ ...card, marginBottom: 12 }}>
              {[
                { emoji: '😤', label: 'Stress', value: stress, onChange: setStress },
                { emoji: '⚡', label: 'Energy', value: energy, onChange: setEnergy },
                { emoji: '😊', label: 'Mood',   value: mood,   onChange: setMood   },
              ].map(sl => {
                const pct = ((sl.value - 1) / 9) * 100;
                return (
                  <div key={sl.label} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{sl.emoji}</span>
                      <span style={{ fontSize: 14, color: TEXT, flex: 1 }}>{sl.label}</span>
                      <span style={{ fontSize: 14, color: TEAL, fontWeight: 600 }}>{sl.value}</span>
                    </div>
                    <input
                      type="range" min="1" max="10" value={sl.value}
                      onChange={e => sl.onChange(Number(e.target.value))}
                      style={{
                        width: '100%', height: 4, borderRadius: 2,
                        outline: 'none', cursor: 'pointer',
                        appearance: 'none', WebkitAppearance: 'none',
                        accentColor: TEAL,
                        background: `linear-gradient(to right, ${TEAL} 0%, ${TEAL} ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Rotating prompt card */}
            <div style={{
              background: ELEVATED,
              borderLeft: `3px solid ${TEAL}`,
              padding: 14,
              borderRadius: 12,
              marginBottom: 16,
              boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 11, color: TEAL, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Journal Prompt</div>
              <div style={{ fontSize: 14, color: TEXT, lineHeight: 1.5 }}>{CHECKIN_PROMPTS[promptIdx]}</div>
            </div>

            {/* Feelings chips */}
            <div style={{ ...card, marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Feelings</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {FEELINGS.map(f => {
                  const sel = feelings.includes(f);
                  return (
                    <button key={f} onClick={() => toggleFeeling(f)} style={{
                      background: sel ? TEAL : ELEVATED,
                      borderRadius: 20,
                      padding: '8px 14px',
                      fontSize: 13,
                      color: sel ? '#000' : TEXT,
                      border: sel ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      fontWeight: sel ? 700 : 400,
                      cursor: 'pointer',
                    }}>{f}</button>
                  );
                })}
              </div>
            </div>

            {/* Notes textarea */}
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Write freely…"
              rows={3}
              style={{
                background: SURFACE,
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: TEXT,
                padding: 12,
                fontSize: 14,
                width: '100%',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 16,
              }}
            />

            {/* Save button */}
            <button onClick={saveCheckin} style={{
              background: TEAL, color: '#000', fontWeight: 700,
              borderRadius: 12, height: 48, width: '100%',
              border: 'none', fontSize: 16, cursor: 'pointer',
            }}>Save Check-in (+10 XP)</button>
          </div>
        )}

        {/* ════════════════════════ BREATHING ═══════════════════════════════ */}
        {innerTab === 'breathing' && (
          <div>
            {activeExercise ? (
              <BreathingSession exercise={activeExercise} onClose={() => setActiveExercise(null)} />
            ) : (
              <>
                <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Breathing Exercises</div>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                  {BREATHING_EXERCISES.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => setActiveExercise(ex)}
                      style={{
                        background: ex.gradient,
                        borderRadius: 16,
                        padding: 16,
                        minWidth: 160,
                        height: 120,
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <div style={{ color: TEXT, fontWeight: 700, fontSize: 15 }}>{ex.name}</div>
                      <div style={{
                        display: 'inline-block', background: 'rgba(255,255,255,0.2)',
                        borderRadius: 8, padding: '2px 8px', fontSize: 11, color: TEXT, marginTop: 4,
                      }}>{ex.pattern}</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4, lineHeight: 1.3 }}>{ex.desc}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════ MEDITATION ══════════════════════════════ */}
        {innerTab === 'meditation' && (
          <div>
            {/* Stats strip */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[
                { icon: '🔥', val: `${streakDays} days`, lbl: 'Streak'   },
                { icon: '⏱', val: `${totalMinToday} min`, lbl: 'Today'   },
                { icon: '🧘', val: `${sessionsToday.length + 24}`,         lbl: 'Sessions' },
              ].map(s => (
                <div key={s.lbl} style={{
                  ...card, flex: 1, textAlign: 'center', padding: 12, borderRadius: 12,
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ color: TEXT, fontWeight: 700, fontSize: 16 }}>{s.val}</div>
                  <div style={{ color: MUTED, fontSize: 11 }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Active timer */}
            {meditationTimer ? (
              <div style={{ ...elevatedCard, borderRadius: 20, padding: 32, textAlign: 'center', marginBottom: 16, position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)',
                  width: 200, height: 200, borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(0,188,212,0.08) 0%, transparent 70%)`,
                  animation: 'pulse 3s ease-in-out infinite',
                }} />
                <style>{`@keyframes pulse { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.15)} }`}</style>
                <div style={{ color: TEXT, fontSize: 52, fontWeight: 800, letterSpacing: 2, position: 'relative' }}>
                  {pad2(Math.floor((meditationTimer.durationSec - meditationTimer.elapsed) / 60))}:{pad2((meditationTimer.durationSec - meditationTimer.elapsed) % 60)}
                </div>
                <div style={{ color: MUTED, fontSize: 13, marginTop: 4, marginBottom: 24, position: 'relative' }}>
                  {meditationTimer.paused ? 'Paused' : 'In progress'}
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 24 }}>
                  <div style={{
                    height: '100%', borderRadius: 2, background: TEAL,
                    width: `${(meditationTimer.elapsed / meditationTimer.durationSec) * 100}%`,
                    transition: 'width 0.9s linear',
                  }} />
                </div>
                <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  <button onClick={() => setMeditationTimer(p => ({ ...p, paused: !p.paused }))} style={{
                    flex: 1, padding: '12px 0', background: 'rgba(255,255,255,0.1)', border: 'none',
                    color: TEXT, borderRadius: 30, cursor: 'pointer', fontWeight: 700, fontSize: 15,
                  }}>{meditationTimer.paused ? 'Resume' : 'Pause'}</button>
                  <button onClick={stopMeditation} style={{
                    flex: 1, padding: '12px 0', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)', color: TEXT,
                    borderRadius: 30, cursor: 'pointer', fontWeight: 700, fontSize: 15,
                  }}>Stop</button>
                </div>
              </div>
            ) : (
              /* Quick start pills */
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: MUTED, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Quick Start</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[5, 10, 20].map(m => (
                    <button key={m} onClick={() => startMeditation(m)} style={{
                      background: ELEVATED, borderRadius: 20, padding: '8px 16px',
                      border: `1px solid ${TEAL}`, color: TEAL,
                      fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}>{m}m</button>
                  ))}
                  <button onClick={() => {
                    const val = prompt('Enter duration (minutes):');
                    const n = parseInt(val);
                    if (n > 0) startMeditation(n);
                  }} style={{
                    background: ELEVATED, borderRadius: 20, padding: '8px 16px',
                    border: '1px solid rgba(255,255,255,0.2)', color: TEXT,
                    fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  }}>Custom</button>
                </div>
              </div>
            )}

            {/* Session list - last 5 mock */}
            <div style={{ fontSize: 12, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Recent Sessions</div>
            {[
              { date: 'Mar 14', type: 'Focused', duration: '20 min', moodAfter: '😊' },
              { date: 'Mar 13', type: 'Guided',  duration: '10 min', moodAfter: '😄' },
              { date: 'Mar 12', type: 'Sleep',   duration: '30 min', moodAfter: '😐' },
              { date: 'Mar 11', type: 'Focused', duration: '15 min', moodAfter: '🙂' },
              { date: 'Mar 10', type: 'Guided',  duration: '10 min', moodAfter: '😊' },
            ].map((s, i) => (
              <div key={i} style={{ ...card, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: TEXT, fontSize: 14, fontWeight: 600 }}>{s.date}</div>
                  <div style={{ color: MUTED, fontSize: 12 }}>{s.type}</div>
                </div>
                <div style={{ color: MUTED, fontSize: 13 }}>{s.duration}</div>
                <div style={{ fontSize: 20 }}>{s.moodAfter}</div>
              </div>
            ))}

            <button onClick={() => setShowLogModal(true)} style={{
              width: '100%', marginTop: 8, padding: '13px 0',
              background: 'transparent', border: `1.5px solid ${TEAL}`,
              color: TEAL, borderRadius: 30, fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>Log Session</button>

            {showLogModal && (
              <LogSessionModal
                onClose={() => setShowLogModal(false)}
                onSave={d => setSessionsToday(p => [...p, d.duration])}
              />
            )}
          </div>
        )}

        {/* ════════════════════════ ENERGY ══════════════════════════════════ */}
        {innerTab === 'energy' && (
          <div>
            {/* Battery hero card */}
            <div style={{ ...card, marginBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
              <svg width="160" height="90" viewBox="0 0 160 90">
                <rect x="2" y="10" width="140" height="70" rx="8" ry="8" fill="none" stroke="white" strokeWidth="2.5"/>
                <rect x="142" y="30" width="14" height="30" rx="4" fill="white" opacity="0.6"/>
                <rect x="7" y="15" width={Math.round(0.82 * 130)} height="60" rx="5" fill="#4CAF50"/>
                <path d="M75 25 L65 47 L75 47 L65 65 L90 38 L78 38 Z" fill="white"/>
              </svg>
              <div style={{ fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 4, marginTop: 8 }}>82%</div>
              <div style={{ fontSize: 13, color: MUTED }}>Last charged to 98% at 9:32 AM</div>
            </div>

            {/* Stat cards 2-col */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ ...card, borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#4CAF50' }}>+38%</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Charge rate</div>
              </div>
              <div style={{ ...card, borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#FF4444' }}>−16%</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Drain rate</div>
              </div>
            </div>

            {/* Insight card */}
            <div style={{
              background: ELEVATED,
              borderLeft: `3px solid ${TEAL}`,
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              position: 'relative',
              boxSizing: 'border-box',
            }}>
              <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 20, color: MUTED }}>↗</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 6 }}>Solid recharge last night ⚡</div>
              <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
                Your overnight recovery was excellent. Energy stores are well replenished for today's activities.
              </div>
            </div>

            {/* Energy & Stress chart */}
            <div style={{ ...card, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Energy &amp; Stress Level</div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={energyChartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <ReferenceArea x1={0} x2={6} fill="rgba(74,127,212,0.15)" />
                  <ReferenceArea x1={7} x2={9} fill="rgba(255,140,66,0.1)" />
                  <Line type="monotone" dataKey="energy" stroke="#4CAF50" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="stress" stroke="#FFB800" strokeWidth={2} dot={false} />
                  <XAxis dataKey="hour" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
                  <Tooltip
                    contentStyle={{ background: ELEVATED, border: 'none', borderRadius: 8, color: TEXT, fontSize: 12 }}
                    labelStyle={{ color: MUTED }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4CAF50' }} />
                  <span style={{ fontSize: 12, color: MUTED }}>Energy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFB800' }} />
                  <span style={{ fontSize: 12, color: MUTED }}>Stress Level</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════ STRESS ══════════════════════════════════ */}
        {innerTab === 'stress' && (
          <div>
            {/* Gauge hero card - light themed */}
            <div style={{
              background: 'linear-gradient(135deg, #E8F4FD, #C5E8F5)',
              borderRadius: 16,
              padding: 24,
              marginBottom: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}>
              <svg width="200" height="120" viewBox="0 0 200 120">
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E0E0E0" strokeWidth="12" strokeLinecap="round"/>
                <path d="M 20 100 A 80 80 0 0 1 80 28"  fill="none" stroke="#4CAF50" strokeWidth="12" strokeLinecap="round"/>
                <path d="M 80 28  A 80 80 0 0 1 140 28" fill="none" stroke="#FFB800" strokeWidth="12" strokeLinecap="round"/>
                <path d="M 140 28 A 80 80 0 0 1 180 100" fill="none" stroke="#FF4444" strokeWidth="12" strokeLinecap="round"/>
                <line x1="100" y1="100" x2="65" y2="45" stroke="#1A1A2E" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="100" cy="100" r="6" fill="#1A1A2E"/>
                <text x="15"  y="118" fontSize="12" fill="#666">0</text>
                <text x="180" y="118" fontSize="12" fill="#666">100</text>
              </svg>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#1A1A2E', textAlign: 'center' }}>33</div>
              <div style={{ fontSize: 13, color: '#666', textAlign: 'center' }}>Stress Score</div>
            </div>

            {/* Stat cards - white for stress tab */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E0E0E0', padding: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>Average HRV</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', marginTop: 4 }}>85 ms <span style={{ color: '#4A7FD4', fontSize: 16 }}>▲</span></div>
                <div style={{ fontSize: 12, color: '#666' }}>Above normal</div>
              </div>
              <div style={{ background: '#FFFFFF', borderRadius: 16, border: '1px solid #E0E0E0', padding: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E' }}>Average HR</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', marginTop: 4 }}>98 bpm <span style={{ color: '#FF8C42', fontSize: 16 }}>▼</span></div>
                <div style={{ fontSize: 12, color: '#666' }}>Below normal</div>
              </div>
            </div>

            {/* Insight card - white */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #E0E0E0',
              padding: 16,
              marginBottom: 12,
              boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>Calm and collected 🧘</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                Your HRV is elevated indicating good recovery. Stress levels are well managed today.
              </div>
            </div>

            {/* Stress area chart - dark card */}
            <div style={{ ...card, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Stress Over 24h</div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={stressChartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#FF4444" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="stress" stroke="#FF8C42" fill="url(#stressGrad)" strokeWidth={2} />
                  <XAxis dataKey="hour" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
                  <Tooltip
                    contentStyle={{ background: ELEVATED, border: 'none', borderRadius: 8, color: TEXT, fontSize: 12 }}
                    labelStyle={{ color: MUTED }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown bars */}
            <div style={{ ...card, borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Time in Zone</div>
              {[
                { label: 'High 🔴',  color: '#FF4444', pct: 11, time: '02:38:24' },
                { label: 'Med 🟡',   color: '#FFB800', pct: 33, time: '07:55:12' },
                { label: 'Low 🟢',   color: TEAL,      pct: 56, time: '13:26:24' },
              ].map(b => (
                <div key={b.label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: TEXT }}>{b.label}</span>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 13, color: MUTED }}>{b.pct}%</span>
                      <span style={{ fontSize: 13, color: MUTED }}>{b.time}</span>
                    </div>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════ PERIOD ══════════════════════════════════ */}
        {innerTab === 'period' && (
          <div style={{ background: '#FAFAFA', minHeight: '100%', color: '#1A1A2E', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E' }}>Cycle</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A2E', marginTop: 4 }}>September 22, 2025</div>
              <div style={{ fontSize: 14, color: '#666' }}>Day 3 of Period</div>
            </div>

            {/* Week row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16, flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: '20', day: 'Sep 20', isPeriod: true,  isToday: false },
                  { label: '21', day: 'Sep 21', isPeriod: true,  isToday: false },
                  { label: '22', day: 'Sep 22', isPeriod: true,  isToday: true  },
                  { label: '23', day: 'Sep 23', isPeriod: false, isToday: false },
                  { label: '24', day: 'Sep 24', isPeriod: false, isToday: false },
                  { label: '25', day: 'Sep 25', isPeriod: false, isToday: false },
                  { label: '26', day: 'Sep 26', isPeriod: false, isToday: false },
                ].map(d => (
                  <div key={d.label} style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: d.isPeriod ? '#FF6B9D' : '#FFFFFF',
                    border: d.isToday ? `3px solid ${TEAL}` : (d.isPeriod ? 'none' : '1px solid #E0E0E0'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: d.isPeriod ? '#FFFFFF' : '#999',
                    fontWeight: d.isPeriod ? 700 : 400,
                    fontSize: 14,
                    flexShrink: 0,
                  }}>{d.label}</div>
                ))}
              </div>
              <div style={{
                background: '#FF6B9D', color: '#FFFFFF',
                borderRadius: 12, padding: '4px 14px', fontSize: 12, fontWeight: 600,
              }}>Period</div>
            </div>

            {/* Today card */}
            <div style={{
              background: '#FFFFFF', borderRadius: 16, border: '1px solid #F0E0E8',
              padding: 16, marginBottom: 12, boxSizing: 'border-box',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: '#1A1A2E', fontSize: 15 }}>Today, Sep 22 →</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A2E', marginBottom: 12 }}>Heavy flow</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PERIOD_SYMPTOMS.map(s => {
                  const sel = selectedSymptoms.includes(s);
                  return (
                    <button key={s} onClick={() => {
                      const newSymptoms = selectedSymptoms.includes(s)
                        ? selectedSymptoms.filter(x => x !== s)
                        : [...selectedSymptoms, s];
                      setSelectedSymptoms(newSymptoms);
                      if (onSetPeriod) onSetPeriod({ symptoms: newSymptoms });
                    }} style={{
                      background: sel ? '#FF6B9D' : '#FFF0F5',
                      color: sel ? '#FFFFFF' : '#FF6B9D',
                      border: sel ? 'none' : '1px solid #FFB8D4',
                      borderRadius: 20, padding: '6px 14px',
                      fontSize: 13, cursor: 'pointer',
                      fontWeight: sel ? 600 : 400,
                    }}>{s}</button>
                  );
                })}
              </div>
            </div>

            {/* Insight card */}
            <div style={{
              background: '#FFF8F0', borderRadius: 12, border: '1px solid #FFE0C0',
              padding: 16, marginBottom: 12, boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginBottom: 6 }}>You're powering through! ✨</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                During your period, iron-rich foods and gentle movement can help with energy and cramps.
              </div>
            </div>

            {/* Prediction */}
            <div style={{
              background: '#FFFFFF', borderRadius: 16, border: '1px solid #E0E0E0',
              padding: 16, boxSizing: 'border-box',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E' }}>Period Prediction</div>
                <span style={{ fontSize: 20 }}>📅</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A2E', marginTop: 8 }}>Around Oct 18, 2025</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>Estimated start date</div>
            </div>
          </div>
        )}

        {/* ════════════════════════ ASSESSMENT ══════════════════════════════ */}
        {innerTab === 'assessment' && (
          <div>
            {/* Disclaimer */}
            <div style={{
              background: ELEVATED,
              borderLeft: `3px solid ${TEAL}`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 11, color: TEAL, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Medical Disclaimer</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                This is a screening tool only and does not constitute a medical diagnosis. Please consult a qualified healthcare professional for guidance.
              </div>
            </div>

            {!assessmentType ? (
              /* Card picker */
              <>
                {/* 7-day chart */}
                <div style={{ ...card, marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>7-Day Score History</div>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={assessmentHistory} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                      <Line type="monotone" dataKey="phq" stroke={TEAL}     strokeWidth={2} dot={false} name="PHQ-9" />
                      <Line type="monotone" dataKey="gad" stroke="#AB47BC"  strokeWidth={2} dot={false} name="GAD-7" />
                      <XAxis dataKey="day" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: ELEVATED, border: 'none', borderRadius: 8, color: TEXT, fontSize: 12 }}
                        labelStyle={{ color: MUTED }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: TEAL }} />
                      <span style={{ fontSize: 12, color: MUTED }}>PHQ-9</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#AB47BC' }} />
                      <span style={{ fontSize: 12, color: MUTED }}>GAD-7</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { type: 'phq9', name: 'PHQ-9 Depression Screen',  desc: 'A validated 9-question screen for depressive symptoms over the past two weeks.', qs: 9  },
                    { type: 'gad7', name: 'GAD-7 Anxiety Screen',     desc: 'A validated 7-question tool to assess the severity of generalised anxiety disorder.', qs: 7 },
                  ].map(a => (
                    <div key={a.type} style={{ ...card }}>
                      <div style={{ color: TEXT, fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{a.name}</div>
                      <div style={{ color: MUTED, fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>{a.desc}</div>
                      <div style={{ color: MUTED, fontSize: 12, marginBottom: 14 }}>{a.qs} questions · ~2 minutes</div>
                      <button onClick={() => startAssessment(a.type)} style={{
                        padding: '11px 28px', background: TEAL, border: 'none',
                        color: '#0A0A14', borderRadius: 30, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}>Take Assessment</button>
                    </div>
                  ))}
                </div>
              </>
            ) : assessmentDone ? (
              /* Results */
              (() => {
                const score    = assessmentAnswers.reduce((a, b) => a + b, 0);
                const sev      = severityLabel(score, assessmentType);
                const maxScore = assessmentType === 'phq9' ? 27 : 21;
                return (
                  <div style={{ ...elevatedCard, borderRadius: 20, padding: 28, textAlign: 'center' }}>
                    <div style={{ color: MUTED, fontSize: 13, marginBottom: 8 }}>
                      {assessmentType === 'phq9' ? 'PHQ-9' : 'GAD-7'} Results
                    </div>
                    <div style={{ fontSize: 64, fontWeight: 800, color: TEXT, lineHeight: 1 }}>{score}</div>
                    <div style={{ color: MUTED, fontSize: 14, marginBottom: 16 }}>out of {maxScore}</div>
                    <div style={{
                      display: 'inline-block', padding: '6px 20px', borderRadius: 20,
                      background: sev.color + '30', color: sev.color, fontWeight: 700, fontSize: 16, marginBottom: 24,
                    }}>{sev.label}</div>
                    <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.6, marginBottom: 28 }}>
                      Remember: these scores are informational only. Please speak with a qualified professional for personalised guidance.
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => startAssessment(assessmentType)} style={{
                        flex: 1, padding: '12px 0', background: TEAL, border: 'none',
                        color: '#0A0A14', borderRadius: 30, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                      }}>Retake</button>
                      <button onClick={() => setAssessmentType(null)} style={{
                        flex: 1, padding: '12px 0', background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)', color: TEXT,
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
                const total     = questions.length;
                const q         = questions[assessmentQ];
                const pct       = (assessmentQ / total) * 100;
                return (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ color: MUTED, fontSize: 13 }}>
                        {assessmentType === 'phq9' ? 'PHQ-9' : 'GAD-7'}
                      </div>
                      <div style={{ color: TEAL, fontWeight: 700, fontSize: 13 }}>Q {assessmentQ + 1} of {total}</div>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 28 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: TEAL, width: `${pct}%`, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ color: TEXT, fontSize: 18, fontWeight: 600, lineHeight: 1.5, marginBottom: 32 }}>
                      Over the last 2 weeks, how often have you been bothered by:<br />
                      <span style={{ color: TEAL }}>{q}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                      {ASSESSMENT_OPTIONS.map((opt, i) => (
                        <button key={opt} onClick={() => answerQuestion(i)}
                          style={{
                            padding: '15px 20px', background: ELEVATED, border: `1px solid rgba(255,255,255,0.12)`,
                            borderRadius: 14, color: TEXT, fontSize: 15, textAlign: 'left', cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.background = 'rgba(0,188,212,0.1)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = ELEVATED; }}
                        >{opt}</button>
                      ))}
                    </div>
                    {assessmentQ > 0 && (
                      <button onClick={() => {
                        setAssessmentQ(q => q - 1);
                        setAssessmentAnswers(a => a.slice(0, -1));
                      }} style={{
                        background: 'none', border: 'none', color: MUTED,
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
