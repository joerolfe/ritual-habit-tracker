import React, { useState, useMemo } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const CAT_COLOR = {
  Health: '#00BCD4', Career: '#3B82F6', Finance: '#22C55E',
  Fitness: '#FF8C42', Learning: '#A855F7', Lifestyle: '#6B7280',
};

const EMOJI_OPTIONS = ['🏃', '📚', '⚖️', '🧘', '💰', '🎯', '🥗', '🎓', '💼', '🎨', '🏋️', '🚴'];

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_GOALS = [
  {
    id: 'mock-1',
    type: 'numeric',
    category: 'Fitness',
    title: 'Run a 5K',
    description: 'Build up to running 5 kilometres without stopping',
    emoji: '🏃',
    target: 5,
    current: 3,
    unit: 'km',
    deadline: '2026-04-30',
    milestones: [
      { id: 'm1', text: 'Run 1km without stopping', done: true },
      { id: 'm2', text: 'Complete Couch to 5K Week 3', done: true },
      { id: 'm3', text: 'Run 3km continuously', done: true },
      { id: 'm4', text: 'Run 4km', done: false },
      { id: 'm5', text: 'Complete first 5K', done: false },
    ],
    streak: 6,
    completed: false,
  },
  {
    id: 'mock-2',
    type: 'project',
    category: 'Career',
    title: 'Get Promoted',
    description: 'Achieve senior developer role by end of Q2',
    emoji: '💼',
    deadline: '2026-06-30',
    milestones: [
      { id: 'm1', text: 'Complete performance review', done: true },
      { id: 'm2', text: 'Lead a major project', done: true },
      { id: 'm3', text: 'Get mentor feedback', done: true },
      { id: 'm4', text: 'Submit promotion application', done: false },
      { id: 'm5', text: 'Final interview', done: false },
    ],
    streak: 0,
    completed: false,
  },
  {
    id: 'mock-3',
    type: 'numeric',
    category: 'Learning',
    title: 'Read 12 Books',
    description: 'One book per month this year',
    emoji: '📚',
    target: 12,
    current: 4,
    unit: 'books',
    deadline: '2026-12-31',
    milestones: [
      { id: 'm1', text: 'Read January book', done: true },
      { id: 'm2', text: 'Read February book', done: true },
      { id: 'm3', text: 'Read March book', done: false },
    ],
    streak: 3,
    completed: false,
  },
  {
    id: 'mock-4',
    type: 'numeric',
    category: 'Finance',
    title: 'Save £500',
    description: 'Emergency fund starter',
    emoji: '💰',
    target: 500,
    current: 320,
    unit: '£',
    deadline: '2026-05-31',
    milestones: [
      { id: 'm1', text: 'Save first £100', done: true },
      { id: 'm2', text: 'Reach £250', done: true },
      { id: 'm3', text: 'Reach £500', done: false },
    ],
    streak: 0,
    completed: false,
  },
];

const MOCK_CHALLENGES = [
  {
    id: 'mock-c1',
    title: '30-Day Meditation Challenge',
    emoji: '🧘',
    totalDays: 30,
    startDate: '2026-02-28',
    completions: Object.fromEntries(Array.from({ length: 14 }, (_, i) => [i, true])),
  },
];

const GOAL_TEMPLATES = [
  { title: 'Run a 5K', emoji: '🏃', category: 'Fitness', type: 'numeric', target: 5, unit: 'km' },
  { title: 'Read 12 Books', emoji: '📚', category: 'Learning', type: 'numeric', target: 12, unit: 'books' },
  { title: 'Lose 5kg', emoji: '⚖️', category: 'Fitness', type: 'numeric', target: 5, unit: 'kg' },
  { title: 'Meditate 30 Days', emoji: '🧘', category: 'Lifestyle', type: 'numeric', target: 30, unit: 'days' },
  { title: 'Save £1000', emoji: '💰', category: 'Finance', type: 'numeric', target: 1000, unit: '£' },
  { title: 'Learn a Skill', emoji: '🎯', category: 'Learning', type: 'project' },
  { title: 'No Junk Food 21 Days', emoji: '🥗', category: 'Health', type: 'numeric', target: 21, unit: 'days' },
  { title: 'Complete a Course', emoji: '🎓', category: 'Learning', type: 'project' },
];

const WEEKLY_MOCK = [45, 60, 80, 55, 70, 90, 65];
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysLeft(deadline) {
  if (!deadline) return null;
  return Math.round((new Date(deadline) - new Date()) / 86400000);
}

function goalPct(g) {
  if (g.type === 'numeric' && g.target > 0) return Math.round((g.current / g.target) * 100);
  if (g.milestones && g.milestones.length > 0)
    return Math.round(g.milestones.filter(m => m.done).length / g.milestones.length * 100);
  return g.completed ? 100 : 0;
}

function deadlineColor(days) {
  if (days === null) return 'rgba(255,255,255,0.45)';
  if (days <= 7) return '#FF3B30';
  if (days <= 14) return '#FF9F0A';
  return '#22C55E';
}

function catColor(cat) {
  return CAT_COLOR[cat] || '#6B7280';
}

function darkenHex(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * 0.55)}, ${Math.round(g * 0.55)}, ${Math.round(b * 0.55)})`;
}

// ─── SVG Progress Ring ────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 48 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={radius} fill="#1A1A1A" stroke="#1A1A1A" strokeWidth={0} />
      <circle
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke="#333333"
        strokeWidth={4}
      />
      <circle
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke="#FF8C42"
        strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
      <text
        x={cx} y={cy + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize={10}
        fontFamily="Inter, sans-serif"
        fontWeight="600"
      >
        {pct}%
      </text>
    </svg>
  );
}

// ─── Weekly Bar Chart ─────────────────────────────────────────────────────────

function WeeklyBarChart({ values }) {
  const chartH = 80;
  const chartW = 280;
  const barW = 28;
  const gap = (chartW - barW * 7) / 6;
  const maxVal = 100;

  return (
    <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 20}`} style={{ overflow: 'visible' }}>
      {/* Y-axis labels */}
      {[0, 50, 100].map(tick => {
        const y = chartH - (tick / maxVal) * chartH;
        return (
          <g key={tick}>
            <line x1={0} y1={y} x2={chartW} y2={y} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
            <text x={0} y={y - 3} fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="Inter, sans-serif">{tick}%</text>
          </g>
        );
      })}
      {values.map((val, i) => {
        const barH = Math.max(4, (val / maxVal) * chartH);
        const x = i * (barW + gap);
        const y = chartH - barH;
        return (
          <g key={i}>
            <rect
              x={x} y={y}
              width={barW} height={barH}
              rx={6} ry={6}
              fill="#00BCD4"
              opacity={0.9}
            />
            <text
              x={x + barW / 2} y={chartH + 14}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize={9}
              fontFamily="Inter, sans-serif"
            >
              {WEEK_LABELS[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

function GoalCard({ goal, onEditGoal, isMock }) {
  const [expanded, setExpanded] = useState(false);
  const pct = goalPct(goal);
  const dl = daysLeft(goal.deadline);
  const color = catColor(goal.category);
  const doneMilestones = (goal.milestones || []).filter(m => m.done).length;
  const totalMilestones = (goal.milestones || []).length;

  function handleAdjust(delta) {
    if (isMock) return;
    const newVal = Math.max(0, (goal.current || 0) + delta);
    onEditGoal(goal.id, { current: newVal });
  }

  return (
    <div style={{
      background: '#111111',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    }}>
      {/* Top row: category badge + streak */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          background: color + '22',
          color: color,
          fontSize: 11,
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: 20,
          letterSpacing: '0.3px',
        }}>
          {goal.category}
        </span>
        {goal.streak > 0 && (
          <span style={{
            background: '#FF8C4222',
            color: '#FF8C42',
            fontSize: 12,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 20,
          }}>
            🔥 {goal.streak}
          </span>
        )}
      </div>

      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Emoji box */}
        <div style={{
          width: 64, height: 64, borderRadius: 14,
          background: '#1A1A1A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, flexShrink: 0,
        }}>
          {goal.emoji || '🎯'}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {goal.title}
          </div>
          {goal.description && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 4, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {goal.description}
            </div>
          )}
          {totalMilestones > 0 && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
              {doneMilestones}/{totalMilestones} milestones
            </div>
          )}
        </div>

        {/* Progress ring */}
        <div style={{ flexShrink: 0 }}>
          <ProgressRing pct={Math.min(100, Math.max(0, pct))} size={48} />
        </div>
      </div>

      {/* Milestones expandable */}
      {totalMilestones > 0 && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#00BCD4', fontSize: 12, fontWeight: 600, padding: 0,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {expanded ? 'Hide milestones ▲' : 'Show milestones ▼'}
          </button>
          {expanded && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {goal.milestones.map(ms => (
                <div key={ms.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                    background: ms.done ? '#00BCD4' : 'transparent',
                    border: ms.done ? 'none' : '2px solid #333333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {ms.done && (
                      <svg width={10} height={10} viewBox="0 0 10 10">
                        <polyline points="1.5,5 4,7.5 8.5,2.5" fill="none" stroke="#000" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{
                    fontSize: 13,
                    color: ms.done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.85)',
                    textDecoration: ms.done ? 'line-through' : 'none',
                  }}>
                    {ms.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Deadline */}
          {dl !== null && (
            <span style={{ fontSize: 12, color: deadlineColor(dl), fontWeight: 500 }}>
              📅 {dl > 0 ? `${dl} days left` : dl === 0 ? 'Due today' : `${Math.abs(dl)}d overdue`}
            </span>
          )}

          {/* Numeric progress */}
          {goal.type === 'numeric' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                📊 {goal.current ?? 0}/{goal.target} {goal.unit}
              </span>
              {!isMock && (
                <>
                  <button
                    onClick={() => handleAdjust(-1)}
                    style={{
                      background: '#1A1A1A', border: 'none', borderRadius: 20,
                      color: '#00BCD4', fontSize: 16, lineHeight: 1,
                      width: 28, height: 28, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >−</button>
                  <button
                    onClick={() => handleAdjust(1)}
                    style={{
                      background: '#1A1A1A', border: 'none', borderRadius: 20,
                      color: '#00BCD4', fontSize: 16, lineHeight: 1,
                      width: 28, height: 28, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >+</button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 16, padding: '2px 4px' }}>📤</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 16, padding: '2px 4px' }}>•••</button>
        </div>
      </div>
    </div>
  );
}

// ─── OKR Section ──────────────────────────────────────────────────────────────

function OKRSection() {
  const krs = [
    { label: 'Complete 3 major projects', current: 2, target: 3, pct: 67 },
    { label: 'Receive positive peer feedback', current: 1, target: 1, pct: 100 },
    { label: 'Learn 2 new technologies', current: 1, target: 2, pct: 50 },
  ];
  const objPct = Math.round(krs.reduce((sum, kr) => sum + kr.pct, 0) / krs.length);

  return (
    <div style={{ padding: '0 16px' }}>
      <div style={{
        background: '#111111',
        borderRadius: 16,
        padding: 20,
        borderLeft: '4px solid #A855F7',
      }}>
        {/* Objective header */}
        <div style={{ fontSize: 13, color: '#A855F7', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Objective</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
          Become a Top Performer This Quarter
        </div>

        {/* Objective progress bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Overall progress</span>
            <span style={{ fontSize: 12, color: '#ffffff', fontWeight: 600 }}>{objPct}%</span>
          </div>
          <div style={{ background: '#1A1A1A', borderRadius: 4, height: 6, overflow: 'hidden' }}>
            <div style={{ background: '#A855F7', height: '100%', width: `${objPct}%`, borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Key Results */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Results</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {krs.map((kr, i) => (
            <div key={i} style={{ paddingLeft: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', flex: 1, marginRight: 8 }}>
                  KR{i + 1}: {kr.label}
                </span>
                <span style={{ fontSize: 12, color: '#00BCD4', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {kr.current}/{kr.target} ({kr.pct}%)
                </span>
              </div>
              <div style={{ background: '#1A1A1A', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                <div style={{ background: '#00BCD4', height: '100%', width: `${kr.pct}%`, borderRadius: 4, transition: 'width 0.4s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Challenge Card ───────────────────────────────────────────────────────────

function ChallengeCard({ challenge, onToggleChallenge }) {
  const isMock = challenge.id.startsWith('mock-');
  const completedCount = Object.values(challenge.completions || {}).filter(Boolean).length;
  const isStarted = completedCount > 0;

  return (
    <div style={{
      width: 260,
      minWidth: 260,
      background: '#111111',
      borderRadius: 16,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Gradient header */}
      <div style={{
        background: 'linear-gradient(135deg, #00BCD4, #A855F7)',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 10,
      }}>
        <span style={{ fontSize: 24 }}>{challenge.emoji || '⚡'}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{challenge.title}</span>
      </div>

      <div style={{ padding: 14 }}>
        {/* Day counter */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>
          Day {completedCount} of {challenge.totalDays}
        </div>

        {/* Dot grid: 5 cols × 6 rows */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5, marginBottom: 14 }}>
          {Array.from({ length: Math.min(30, challenge.totalDays) }, (_, idx) => {
            const done = !!(challenge.completions && challenge.completions[idx]);
            return (
              <button
                key={idx}
                onClick={() => !isMock && onToggleChallenge && onToggleChallenge(challenge.id, idx)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: done ? '#00BCD4' : 'transparent',
                  border: done ? 'none' : '2px solid #333333',
                  cursor: isMock ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: done ? '#000' : 'rgba(255,255,255,0.3)',
                  fontWeight: 600, fontFamily: 'Inter, sans-serif',
                  padding: 0,
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Status / Start button */}
        {isStarted ? (
          <div style={{
            background: '#00BCD422',
            color: '#00BCD4',
            fontSize: 12,
            fontWeight: 600,
            padding: '7px 14px',
            borderRadius: 20,
            textAlign: 'center',
          }}>
            Active ✓
          </div>
        ) : (
          <button style={{
            background: '#00BCD4',
            color: '#000000',
            fontSize: 13,
            fontWeight: 700,
            border: 'none',
            borderRadius: 20,
            padding: '8px 0',
            width: '100%',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
            Start Challenge
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ template, onPress }) {
  const color = catColor(template.category);
  const dark = darkenHex(color);

  return (
    <button
      onClick={onPress}
      style={{
        width: 140,
        height: 100,
        minWidth: 140,
        borderRadius: 14,
        background: `linear-gradient(135deg, ${color}, ${dark})`,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        flexShrink: 0,
        padding: 0,
      }}
    >
      <span style={{ fontSize: 28 }}>{template.emoji}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', textAlign: 'center', padding: '0 8px', lineHeight: 1.3 }}>
        {template.title}
      </span>
    </button>
  );
}

// ─── Add Goal Modal ───────────────────────────────────────────────────────────

function AddGoalModal({ onClose, onAdd, prefill }) {
  const [title, setTitle] = useState(prefill?.title || '');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(prefill?.type || 'numeric');
  const [category, setCategory] = useState(prefill?.category || 'Fitness');
  const [target, setTarget] = useState(String(prefill?.target || ''));
  const [unit, setUnit] = useState(prefill?.unit || '');
  const [deadline, setDeadline] = useState('');
  const [emoji, setEmoji] = useState(prefill?.emoji || '🎯');

  const TYPES = ['habit', 'numeric', 'project', 'okr'];
  const CATEGORIES = Object.keys(CAT_COLOR);

  function handleCreate() {
    if (!title.trim()) return;
    const data = {
      title: title.trim(),
      description,
      type,
      category,
      emoji,
      deadline,
      milestones: [],
      streak: 0,
      completed: false,
    };
    if (type === 'numeric') {
      data.target = parseFloat(target) || 0;
      data.current = 0;
      data.unit = unit;
    }
    onAdd(data);
    onClose();
  }

  const inputStyle = {
    background: '#1A1A1A',
    border: '1px solid #333',
    borderRadius: 10,
    color: '#ffffff',
    fontSize: 15,
    padding: '12px 14px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'flex-end',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#111111',
        borderRadius: '20px 20px 0 0',
        padding: '20px 16px 40px',
        width: '100%',
        boxSizing: 'border-box',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Modal handle */}
        <div style={{ width: 40, height: 4, background: '#333', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', margin: 0 }}>New Goal</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        {/* Emoji picker */}
        <div style={{ marginBottom: 16 }}>
          <span style={labelStyle}>Choose Emoji</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  background: emoji === e ? '#00BCD4' : '#1A1A1A',
                  border: 'none', borderRadius: 10, padding: '8px 10px',
                  fontSize: 20, cursor: 'pointer', lineHeight: 1,
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Run a 5K"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Description</label>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What does success look like?"
            style={inputStyle}
          />
        </div>

        {/* Type */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Type</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  background: type === t ? '#00BCD4' : '#1A1A1A',
                  color: type === t ? '#000' : 'rgba(255,255,255,0.7)',
                  border: 'none', borderRadius: 20,
                  padding: '7px 16px',
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  textTransform: 'capitalize',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Category</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  background: category === c ? catColor(c) : '#1A1A1A',
                  color: category === c ? '#000' : 'rgba(255,255,255,0.7)',
                  border: 'none', borderRadius: 20,
                  padding: '7px 14px',
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Numeric fields */}
        {type === 'numeric' && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Target</label>
              <input
                type="number"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="e.g. 5"
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Unit</label>
              <input
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. km"
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* Deadline */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>

        {/* Create button */}
        <button
          onClick={handleCreate}
          style={{
            background: '#00BCD4',
            color: '#000000',
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            borderRadius: 14,
            padding: '15px 0',
            width: '100%',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Create Goal
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GoalsView({
  goals,
  challenges,
  habits,
  completions,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onCompleteGoal,
  onAddChallenge,
  onEditChallenge,
  onDeleteChallenge,
  onToggleChallenge,
  onAddBonusXP,
}) {
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalPrefill, setModalPrefill] = useState(null);

  // Merge real + mock data
  const mergedGoals = useMemo(() => {
    const realIds = new Set((goals || []).map(g => g.id));
    const mocks = MOCK_GOALS.filter(m => !realIds.has(m.id));
    return [...(goals || []), ...mocks];
  }, [goals]);

  const mergedChallenges = useMemo(() => {
    const realIds = new Set((challenges || []).map(c => c.id));
    const mocks = MOCK_CHALLENGES.filter(m => !realIds.has(m.id));
    return [...(challenges || []), ...mocks];
  }, [challenges]);

  const filteredGoals = useMemo(() => {
    if (filter === 'active') return mergedGoals.filter(g => !g.completed);
    if (filter === 'completed') return mergedGoals.filter(g => g.completed);
    if (filter === 'okr') return [];
    return mergedGoals;
  }, [mergedGoals, filter]);

  const onTrackCount = useMemo(() => {
    return mergedGoals.filter(g => goalPct(g) >= 50).length;
  }, [mergedGoals]);

  function openTemplateModal(template) {
    setModalPrefill(template);
    setShowAddModal(true);
  }

  function handleAdd(data) {
    if (onAddGoal) onAddGoal(data);
  }

  const FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'okr', label: 'OKR' },
  ];

  return (
    <div style={{
      background: '#000000',
      minHeight: '100vh',
      fontFamily: 'Inter, -apple-system, sans-serif',
      padding: '0 0 100px',
      color: '#ffffff',
    }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 16px 0' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', margin: 0 }}>Goals</h1>
        <button
          onClick={() => { setModalPrefill(null); setShowAddModal(true); }}
          style={{
            background: '#00BCD4',
            color: '#000000',
            border: 'none',
            borderRadius: 20,
            padding: '9px 18px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          + New Goal
        </button>
      </div>

      {/* ── Weekly Progress Card ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ background: '#111111', borderRadius: 16, padding: '16px 16px 12px' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            This Week
          </div>
          <WeeklyBarChart values={WEEKLY_MOCK} />
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 10 }}>
            {onTrackCount} goal{onTrackCount !== 1 ? 's' : ''} on track
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div style={{ padding: '14px 16px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              background: filter === tab.key ? '#00BCD4' : '#111111',
              color: filter === tab.key ? '#000000' : 'rgba(255,255,255,0.45)',
              border: 'none',
              borderRadius: 20,
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontFamily: 'Inter, sans-serif',
              flexShrink: 0,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Goal Cards or OKR ── */}
      <div style={{ padding: '14px 16px 0' }}>
        {filter === 'okr' ? (
          <OKRSection />
        ) : filteredGoals.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, padding: '40px 0' }}>
            No goals here yet
          </div>
        ) : (
          filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEditGoal={onEditGoal || (() => {})}
              isMock={goal.id.startsWith('mock-')}
            />
          ))
        )}
      </div>

      {/* ── Challenges Section ── */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>Challenges</h2>
          <button style={{ background: 'none', border: 'none', color: '#00BCD4', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', padding: 0 }}>
            Browse
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: 12, padding: '0 16px', WebkitOverflowScrolling: 'touch' }}>
          {mergedChallenges.map(ch => (
            <ChallengeCard
              key={ch.id}
              challenge={ch}
              onToggleChallenge={onToggleChallenge}
            />
          ))}
        </div>
      </div>

      {/* ── Goal Templates ── */}
      <div style={{ marginTop: 24 }}>
        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', margin: 0 }}>Start from a template</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto', gap: 10, padding: '0 16px', WebkitOverflowScrolling: 'touch' }}>
          {GOAL_TEMPLATES.map((tmpl, i) => (
            <TemplateCard
              key={i}
              template={tmpl}
              onPress={() => openTemplateModal(tmpl)}
            />
          ))}
        </div>
      </div>

      {/* ── Add Goal Modal ── */}
      {showAddModal && (
        <AddGoalModal
          onClose={() => { setShowAddModal(false); setModalPrefill(null); }}
          onAdd={handleAdd}
          prefill={modalPrefill}
        />
      )}
    </div>
  );
}
