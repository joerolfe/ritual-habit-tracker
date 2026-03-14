import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, Cell,
} from 'recharts';

// ── Mock data: 14 nights Feb 27 – Mar 12 2026 ────────────────────────────────
const MOCK_SLEEP = {
  '2026-2-27': { bedtime: '22:45', wake: '06:30', quality: 78, feel: 'Refreshed', notes: '' },
  '2026-2-28': { bedtime: '23:15', wake: '07:00', quality: 82, feel: 'OK', notes: '' },
  '2026-3-1':  { bedtime: '00:30', wake: '07:45', quality: 65, feel: 'Groggy', notes: '' },
  '2026-3-2':  { bedtime: '22:00', wake: '06:15', quality: 88, feel: 'Energised', notes: '' },
  '2026-3-3':  { bedtime: '23:50', wake: '07:30', quality: 71, feel: 'Tired', notes: '' },
  '2026-3-4':  { bedtime: '23:00', wake: '06:45', quality: 85, feel: 'Refreshed', notes: '' },
  '2026-3-5':  { bedtime: '01:00', wake: '08:30', quality: 68, feel: 'Groggy', notes: '' },
  '2026-3-6':  { bedtime: '22:30', wake: '06:00', quality: 90, feel: 'Energised', notes: '' },
  '2026-3-7':  { bedtime: '23:40', wake: '07:15', quality: 76, feel: 'OK', notes: '' },
  '2026-3-8':  { bedtime: '00:10', wake: '07:00', quality: 69, feel: 'Tired', notes: '' },
  '2026-3-9':  { bedtime: '22:50', wake: '06:30', quality: 83, feel: 'Refreshed', notes: '' },
  '2026-3-10': { bedtime: '23:30', wake: '07:30', quality: 75, feel: 'OK', notes: '' },
  '2026-3-11': { bedtime: '00:45', wake: '08:00', quality: 67, feel: 'Groggy', notes: '' },
  '2026-3-12': { bedtime: '22:20', wake: '06:50', quality: 92, feel: 'Energised', notes: '' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseMins(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function durationMins(bedtime, wake) {
  const b = parseMins(bedtime), w = parseMins(wake);
  if (b === null || w === null) return null;
  let d = w - b;
  if (d < 0) d += 1440;
  return d;
}

function fmtMins(mins) {
  if (!mins) return '—';
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getWeekDays() {
  const now = new Date();
  const dow = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i],
      key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      date: d,
    };
  });
}

// ── Stage chart data ──────────────────────────────────────────────────────────
const stageColors = {
  awake: '#FF8C42',
  core:  '#4A7FD4',
  REM:   '#7B5FF5',
  deep:  '#1E3A5F',
};

// 34 slots × 15 min = 510 min = 8h30m  (23:29 → 07:59 ≈ 08:00)
const RAW_STAGES = [
  // 23:29–23:44 (1 slot)  awake
  { stage: 'awake', slots: 1 },
  // 23:44–00:14 (2 slots) core
  { stage: 'core',  slots: 2 },
  // 00:14–01:14 (4 slots) deep
  { stage: 'deep',  slots: 4 },
  // 01:14–01:44 (2 slots) core
  { stage: 'core',  slots: 2 },
  // 01:44–02:44 (4 slots) REM
  { stage: 'REM',   slots: 4 },
  // 02:44–03:14 (2 slots) core
  { stage: 'core',  slots: 2 },
  // 03:14–04:14 (4 slots) deep
  { stage: 'deep',  slots: 4 },
  // 04:14–04:29 (1 slot)  awake
  { stage: 'awake', slots: 1 },
  // 04:29–05:14 (3 slots) core
  { stage: 'core',  slots: 3 },
  // 05:14–06:14 (4 slots) REM
  { stage: 'REM',   slots: 4 },
  // 06:14–07:14 (4 slots) core
  { stage: 'core',  slots: 4 },
  // 07:14–07:59 (3 slots) REM
  { stage: 'REM',   slots: 3 },
  // 08:00         awake
  { stage: 'awake', slots: 1 },
];

const stageHeights = { awake: 60, core: 40, REM: 45, deep: 20 };

function buildStageData() {
  const data = [];
  let slot = 0;
  // Start time 23:29 in minutes
  let timeMins = 23 * 60 + 29;
  for (const seg of RAW_STAGES) {
    for (let s = 0; s < seg.slots; s++) {
      const h = Math.floor(timeMins / 60) % 24;
      const m = timeMins % 60;
      const label = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      data.push({ time: label, stage: seg.stage, height: stageHeights[seg.stage] });
      timeMins += 15;
      slot++;
    }
  }
  return data;
}

const stageData = buildStageData();

// ── Small arc ring ────────────────────────────────────────────────────────────
function ArcRing({ pct, color }) {
  return (
    <svg width="40" height="40">
      <circle cx="20" cy="20" r="15" fill="none" stroke="#1A1A2E" strokeWidth="3" />
      <circle
        cx="20" cy="20" r="15"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={`${pct * 94.2} 94.2`}
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
      />
    </svg>
  );
}

// ── Log Modal ─────────────────────────────────────────────────────────────────
function LogModal({ existing, onSave, onClose }) {
  const [bedtime, setBedtime] = useState(existing?.bedtime || '23:00');
  const [wake, setWake] = useState(existing?.wake || '07:00');
  const [qualityIdx, setQualityIdx] = useState(() => {
    const q = existing?.quality;
    if (!q) return -1;
    if (q >= 88) return 4;
    if (q >= 78) return 3;
    if (q >= 68) return 2;
    if (q >= 58) return 1;
    return 0;
  });
  const [feel, setFeel] = useState(existing?.feel || '');
  const [notes, setNotes] = useState(existing?.notes || '');

  const qualityEmojis = [
    { emoji: '😴', label: 'Terrible', score: 30 },
    { emoji: '😑', label: 'Poor',     score: 50 },
    { emoji: '🙂', label: 'OK',       score: 65 },
    { emoji: '😄', label: 'Good',     score: 80 },
    { emoji: '🌟', label: 'Great',    score: 92 },
  ];
  const feelOptions = ['Refreshed', 'Groggy', 'Tired', 'Energised'];

  const handleSave = () => {
    const quality = qualityIdx >= 0 ? qualityEmojis[qualityIdx].score : 70;
    onSave({ bedtime, wake, quality, feel, notes });
    onClose();
  };

  const timeInputStyle = {
    background: '#12121F',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: '14px 16px',
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 700,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    colorScheme: 'dark',
    textAlign: 'center',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#0A0A14',
        borderRadius: '24px 24px 0 0',
        padding: 24,
        paddingBottom: 40,
        width: '100%',
        boxSizing: 'border-box',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Pull bar */}
        <div style={{ width: 40, height: 4, background: '#333', borderRadius: 2, margin: '0 auto 20px' }} />

        <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginBottom: 24, fontFamily: 'Playfair Display, serif' }}>
          Log Sleep
        </div>

        {/* Bedtime */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#8888AA', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bedtime</div>
          <div style={{ background: '#12121F', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px' }}>
            <input
              type="time"
              value={bedtime}
              onChange={e => setBedtime(e.target.value)}
              style={timeInputStyle}
            />
          </div>
        </div>

        {/* Wake time */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#8888AA', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Wake Time</div>
          <div style={{ background: '#12121F', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px' }}>
            <input
              type="time"
              value={wake}
              onChange={e => setWake(e.target.value)}
              style={timeInputStyle}
            />
          </div>
        </div>

        {/* Quality emojis */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#8888AA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sleep Quality</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {qualityEmojis.map((q, i) => (
              <button
                key={q.label}
                onClick={() => setQualityIdx(i)}
                style={{
                  flex: 1,
                  padding: '10px 4px',
                  borderRadius: 12,
                  border: 'none',
                  background: qualityIdx === i ? '#00BCD4' : '#12121F',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 22 }}>{q.emoji}</span>
                <span style={{ fontSize: 10, color: qualityIdx === i ? '#000000' : '#8888AA', fontWeight: 600 }}>{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Morning feel chips */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#8888AA', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Morning Feel</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {feelOptions.map(f => (
              <button
                key={f}
                onClick={() => setFeel(feel === f ? '' : f)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: feel === f ? '#00BCD4' : 'rgba(255,255,255,0.12)',
                  background: feel === f ? '#00BCD4' : 'transparent',
                  color: feel === f ? '#000000' : '#8888AA',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 24 }}>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="How did you sleep?"
            rows={3}
            style={{
              background: '#12121F',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 14,
              color: '#ffffff',
              fontSize: 14,
              width: '100%',
              boxSizing: 'border-box',
              outline: 'none',
              resize: 'none',
              colorScheme: 'dark',
            }}
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            height: 50,
            borderRadius: 25,
            border: 'none',
            background: '#00BCD4',
            color: '#000000',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Save Sleep
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SleepView({ sleep, onSetSleep }) {
  const today = todayKey();

  // Merge mock + real (real wins)
  const allSleep = useMemo(() => ({ ...MOCK_SLEEP, ...(sleep || {}) }), [sleep]);

  const [selectedDate, setSelectedDate] = useState(today);
  const [showLogModal, setShowLogModal] = useState(false);

  // Date nav state — "12 Mar 2026" display
  const [navDate] = useState(new Date(2026, 2, 12)); // Mar 12 2026 (matches mock data)

  const weekDays = useMemo(() => getWeekDays(), []);

  const CARD = {
    background: '#12121F',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    padding: 16,
    boxSizing: 'border-box',
    width: '100%',
  };

  const ELEVATED = {
    ...CARD,
    background: '#1A1A2E',
  };

  // ── Stats for strip ───────────────────────────────────────────────────────
  const allEntries = useMemo(() => Object.values(allSleep).filter(e => e.bedtime && e.wake), [allSleep]);

  const avgDurMins = useMemo(() => {
    if (!allEntries.length) return 0;
    const total = allEntries.reduce((s, e) => s + (durationMins(e.bedtime, e.wake) || 0), 0);
    return Math.round(total / allEntries.length);
  }, [allEntries]);

  const avgQualityPct = useMemo(() => {
    const qs = allEntries.filter(e => e.quality);
    if (!qs.length) return 0;
    return Math.round(qs.reduce((s, e) => s + e.quality, 0) / qs.length);
  }, [allEntries]);

  const sleepDebtMins = useMemo(() => {
    // Target 8h30m = 510 min, debt = target - avg
    return 510 - avgDurMins;
  }, [avgDurMins]);

  const daysLogged = allEntries.length;

  // Format nav date
  const navDateStr = navDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{
      background: '#0A0A14',
      minHeight: '100vh',
      color: '#FFFFFF',
      fontFamily: 'Inter, sans-serif',
      paddingBottom: 120,
    }}>

      {/* ── HEADER ROW ────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 20px 0' }}>
        {/* Title + date nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF' }}>Sleep</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ background: 'none', border: 'none', color: '#8888AA', fontSize: 16, cursor: 'pointer', padding: 4 }}>←</button>
            <span style={{ fontSize: 14, color: '#8888AA' }}>{navDateStr}</span>
            <button style={{ background: 'none', border: 'none', color: '#8888AA', fontSize: 16, cursor: 'pointer', padding: 4 }}>→</button>
          </div>
        </div>

        {/* Day selector row — 7 circles */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
          {weekDays.map(day => {
            const isToday = day.key === today;
            const isSelected = day.key === selectedDate;
            const hasSleep = !!allSleep[day.key];
            return (
              <button
                key={day.key}
                onClick={() => setSelectedDate(day.key)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: isToday ? '2px solid #00BCD4' : '1px solid #333333',
                  background: isSelected && !isToday ? 'rgba(0,188,212,0.12)' : 'transparent',
                  color: isToday || isSelected ? '#FFFFFF' : '#8888AA',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                {day.label}
                {hasSleep && (
                  <div style={{
                    position: 'absolute',
                    bottom: -7,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#00BCD4',
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SLEEP STAGES STEP CHART ───────────────────────────────────────── */}
      <div style={{ ...CARD, margin: 16 }}>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={stageData}
            barCategoryGap="0%"
            barGap={0}
            margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
          >
            <Bar dataKey="height" radius={0} isAnimationActive={false}>
              {stageData.map((entry, i) => (
                <Cell key={i} fill={stageColors[entry.stage]} />
              ))}
            </Bar>
            <XAxis
              dataKey="time"
              tick={{ fill: '#8888AA', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={7}
            />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 12, color: '#8888AA', marginTop: 8, textAlign: 'center' }}>
          🌙 Duration: 08h 31m ☀️
        </div>
      </div>

      {/* ── SLEEP STAGE BREAKDOWN ─────────────────────────────────────────── */}
      <div style={{ padding: '0 16px 0', boxSizing: 'border-box' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 12,
        }}>
          {[
            { label: 'Awake',  value: '45m',    pct: 0.10, color: '#FF8C42', textColor: '#FF8C42', pctLabel: '10%' },
            { label: 'REM',    value: '1h 39m', pct: 0.21, color: '#7B5FF5', textColor: '#7B5FF5', pctLabel: '21%' },
            { label: 'Core',   value: '4h 28m', pct: 0.57, color: '#4A7FD4', textColor: '#4A7FD4', pctLabel: '57%' },
            { label: 'Deep',   value: '56m',    pct: 0.15, color: '#1E3A5F', textColor: '#8888AA', pctLabel: '15%' },
          ].map(s => (
            <div key={s.label} style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 12 }}>
              <ArcRing pct={s.pct} color={s.color} />
              <div>
                <div style={{ fontSize: 11, color: '#8888AA', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.textColor, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: s.textColor, marginTop: 2 }}>{s.pctLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SLEEP NEEDED WIDGET ───────────────────────────────────────────── */}
      <div style={{ padding: '0 16px', marginBottom: 12, boxSizing: 'border-box' }}>
        <div style={{ ...ELEVATED, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF', lineHeight: 1 }}>8h 30m</div>
            <div style={{ fontSize: 13, color: '#8888AA', marginTop: 6 }}>Sleep Needed</div>
          </div>
          {/* Semicircle dial */}
          <svg width="60" height="60" viewBox="0 0 60 60">
            {/* Track arc (semicircle top half) */}
            <path
              d="M 5 55 A 25 25 0 0 1 55 55"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Progress arc at ~70% */}
            <path
              d="M 5 55 A 25 25 0 0 1 55 55"
              fill="none"
              stroke="#00BCD4"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="70 100"
            />
            {/* Marker dot at 70% position on arc */}
            <circle cx="47" cy="28" r="4" fill="#00BCD4" />
          </svg>
        </div>
      </div>

      {/* ── TIME TO FALL ASLEEP ───────────────────────────────────────────── */}
      <div style={{ padding: '0 16px', marginBottom: 12, boxSizing: 'border-box' }}>
        <div style={CARD}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>Time To Fall Asleep</div>
          <div style={{ fontSize: 13, color: '#00BCD4', textAlign: 'center', marginBottom: 12 }}>15 minutes</div>
          {/* Progress bar (div, not input) */}
          <div style={{
            width: '100%',
            height: 6,
            background: '#1A1A2E',
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: 6,
          }}>
            <div style={{ width: '30%', height: '100%', background: '#00BCD4', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#8888AA' }}>Fast</span>
            <span style={{ fontSize: 11, color: '#8888AA' }}>Normal</span>
          </div>
        </div>
      </div>

      {/* ── LOG SLEEP BUTTON ──────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px', marginBottom: 12, boxSizing: 'border-box' }}>
        <button
          onClick={() => setShowLogModal(true)}
          style={{
            width: '100%',
            height: 50,
            borderRadius: 25,
            border: 'none',
            background: '#00BCD4',
            color: '#000000',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          + Log Sleep
        </button>
      </div>

      {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px', marginBottom: 12, boxSizing: 'border-box' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          {[
            { label: 'Avg Duration', value: avgDurMins ? fmtMins(avgDurMins) : '7h 48m' },
            { label: 'Avg Quality',  value: avgQualityPct ? `${avgQualityPct}%` : '79%' },
            {
              label: 'Sleep Debt',
              value: sleepDebtMins > 0
                ? `+${fmtMins(sleepDebtMins)}`
                : sleepDebtMins < 0
                ? `-${fmtMins(Math.abs(sleepDebtMins))}`
                : '0h',
            },
            { label: 'Days Logged', value: daysLogged ? String(daysLogged) : '14' },
          ].map(s => (
            <div key={s.label} style={{
              ...CARD,
              textAlign: 'center',
              padding: 14,
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#8888AA' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RECOVERY SECTION ─────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px', boxSizing: 'border-box' }}>
        {/* Section header */}
        <div style={{
          fontSize: 17,
          fontWeight: 700,
          color: '#FFFFFF',
          borderLeft: '3px solid #00BCD4',
          paddingLeft: 12,
          marginBottom: 12,
        }}>
          Recovery
        </div>

        {/* Recovery hero card */}
        <div style={{
          height: 200,
          borderRadius: 16,
          overflow: 'hidden',
          position: 'relative',
          marginBottom: 12,
        }}>
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
            alt="Recovery"
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Dark overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,20,0.3), rgba(10,10,20,0.8))',
          }} />

          {/* Top-left label */}
          <div style={{
            position: 'absolute',
            top: 16, left: 16,
            fontSize: 15,
            fontWeight: 700,
            color: '#FFFFFF',
          }}>
            Recovery
          </div>

          {/* Top-right date */}
          <div style={{
            position: 'absolute',
            top: 16, right: 16,
            fontSize: 12,
            color: '#8888AA',
          }}>
            {navDateStr}
          </div>

          {/* Centered ring */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
              />
              <circle
                cx="60" cy="60" r="50"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="8"
                strokeDasharray="219.9 314.2"
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="55" textAnchor="middle" fontSize="28" fontWeight="700" fill="#FFFFFF">70%</text>
              <text x="60" y="72" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.7)">recovered</text>
            </svg>
          </div>
        </div>

        {/* Recovery stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ ...CARD, padding: 16 }}>
            <div style={{ fontSize: 13, color: '#8888AA', marginBottom: 6 }}>🔬 Resting HRV</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', lineHeight: 1, marginBottom: 4 }}>52 ms</div>
            <div style={{ fontSize: 12, color: '#4A7FD4' }}>▲ Above normal</div>
          </div>
          <div style={{ ...CARD, padding: 16 }}>
            <div style={{ fontSize: 13, color: '#8888AA', marginBottom: 6 }}>❤️ Resting HR</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', lineHeight: 1, marginBottom: 4 }}>61 bpm</div>
            <div style={{ fontSize: 12, color: '#FF8C42' }}>▼ Below normal</div>
          </div>
        </div>

        {/* Recovery insight card */}
        <div style={{
          ...ELEVATED,
          borderLeft: '3px solid #00BCD4',
          borderRadius: 16,
          padding: 16,
          marginBottom: 4,
          position: 'relative',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginBottom: 6 }}>Solid recovery today 🌱</div>
          <div style={{ fontSize: 13, color: '#8888AA', lineHeight: 1.5, paddingRight: 24 }}>
            Your HRV is elevated and resting HR is low — you're primed for a strong day.
          </div>
          <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 20, color: '#8888AA' }}>↗</div>
        </div>

        {/* View recovery insights link */}
        <div style={{ padding: 16, cursor: 'pointer' }}>
          <span style={{ fontSize: 14, color: '#00BCD4' }}>✦ View Recovery insights →</span>
        </div>
      </div>

      {/* ── LOG MODAL ────────────────────────────────────────────────────── */}
      {showLogModal && (
        <LogModal
          existing={allSleep[selectedDate] || null}
          onSave={(entry) => {
            if (onSetSleep) onSetSleep(selectedDate, entry);
          }}
          onClose={() => setShowLogModal(false)}
        />
      )}
    </div>
  );
}
