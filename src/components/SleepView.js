import React, { useState, useMemo } from 'react';

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
      label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
      date: d,
    };
  });
}

// Build a realistic sleep waveform path
function buildWaveformPath(W, H, totalMins) {
  const pts = [];
  const count = 80;
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const x = t * W;
    // Simulate: fall asleep → deep → REM cycles → lighter toward morning
    let y;
    if (t < 0.05) {
      // falling asleep
      y = H * 0.15 - t * 20 * H * 0.15;
    } else if (t < 0.25) {
      // first deep sleep
      const lt = (t - 0.05) / 0.2;
      y = H * 0.8 + Math.sin(lt * Math.PI * 3) * H * 0.12;
    } else if (t < 0.45) {
      // first REM
      const lt = (t - 0.25) / 0.2;
      y = H * 0.45 + Math.sin(lt * Math.PI * 5) * H * 0.25;
    } else if (t < 0.65) {
      // second deep
      const lt = (t - 0.45) / 0.2;
      y = H * 0.7 + Math.sin(lt * Math.PI * 4) * H * 0.15;
    } else if (t < 0.85) {
      // second REM / lighter
      const lt = (t - 0.65) / 0.2;
      y = H * 0.35 + Math.sin(lt * Math.PI * 6) * H * 0.2;
    } else {
      // waking up
      const lt = (t - 0.85) / 0.15;
      y = H * 0.35 - lt * H * 0.3;
    }
    pts.push({ x, y: Math.max(4, Math.min(H - 4, y)) });
  }

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i];
    const cx = (p.x + c.x) / 2;
    d += ` C ${cx.toFixed(1)} ${p.y.toFixed(1)}, ${cx.toFixed(1)} ${c.y.toFixed(1)}, ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
  }
  // Close path to bottom
  d += ` L ${W} ${H} L 0 ${H} Z`;
  return d;
}

function addMinsToTime(t, m) {
  const base = parseMins(t);
  if (base === null) return '00:00';
  let total = (base + m) % 1440;
  if (total < 0) total += 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// ── Quality Ring Component ────────────────────────────────────────────────────
function QualityRing({ quality, bedtime, wake }) {
  const totalM = durationMins(bedtime, wake);
  const asleepM = totalM ? Math.max(0, totalM - 15) : null;
  const r = 60, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const offset = circ - (quality / 100) * circ;

  return (
    <div style={{ background: '#111111', borderRadius: 16, padding: 20, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* SVG Ring */}
        <div style={{ flexShrink: 0 }}>
          <svg width={140} height={140} viewBox="0 0 140 140">
            <defs>
              <linearGradient id="sleepQualGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF8C42" />
                <stop offset="100%" stopColor="#FFA726" />
              </linearGradient>
            </defs>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
            <circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke="url(#sleepQualGrad)"
              strokeWidth={10}
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: 'stroke-dashoffset 1.2s ease' }}
            />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize={28} fontWeight="700" fill="#ffffff">{quality}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize={11} fill="#FF8C42">%</text>
            <text x={cx} y={cy + 26} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.4)">Quality</text>
          </svg>
        </div>
        {/* Duration column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
              {totalM ? fmtMins(totalM) : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>In bed</div>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
              {asleepM ? fmtMins(asleepM) : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Asleep</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Waveform Card ─────────────────────────────────────────────────────────────
function WaveformCard({ bedtime, wake }) {
  const totalM = durationMins(bedtime, wake);
  if (!bedtime || !wake || !totalM) return null;

  const W = 340, H = 120;
  const path = buildWaveformPath(W, H, totalM);

  // X-axis time labels
  const t1 = addMinsToTime(bedtime, Math.round(totalM * 0.33));
  const t2 = addMinsToTime(bedtime, Math.round(totalM * 0.66));

  const deepM = Math.round(totalM * 0.22);
  const lightM = Math.round(totalM * 0.35);
  const remM = Math.round(totalM * 0.25);
  const awakeM = Math.max(0, totalM - deepM - lightM - remM);

  return (
    <div style={{ background: '#111111', borderRadius: 16, padding: '16px 12px', marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Sleep Stages
      </div>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 8 }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: 'block', height: 120 }}>
          <defs>
            <linearGradient id="waveGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00BCD4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7B2FF7" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <path d={path} fill="url(#waveGrad)" opacity="0.85" />
        </svg>
        {/* X-axis labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 2px 0', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{bedtime}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{t1}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{t2}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{wake}</span>
        </div>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { dot: 'rgba(255,255,255,0.5)', label: 'Awake', dur: fmtMins(awakeM) },
          { dot: '#00BCD4', label: 'Light', dur: fmtMins(lightM) },
          { dot: '#7B2FF7', label: 'Dream', dur: fmtMins(remM) },
          { dot: '#4CAF50', label: 'Deep', dur: fmtMins(deepM) },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{item.label}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{item.dur}</span>
          </div>
        ))}
      </div>
    </div>
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
    { emoji: '😫', label: 'Terrible', score: 30 },
    { emoji: '😕', label: 'Poor', score: 50 },
    { emoji: '😐', label: 'OK', score: 65 },
    { emoji: '🙂', label: 'Good', score: 80 },
    { emoji: '😊', label: 'Great', score: 92 },
  ];
  const feelOptions = ['Refreshed', 'Groggy', 'Tired', 'Energised', 'OK'];

  const handleSave = () => {
    const quality = qualityIdx >= 0 ? qualityEmojis[qualityIdx].score : 70;
    onSave({ bedtime, wake, quality, feel, notes });
    onClose();
  };

  const inputStyle = {
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: '14px 16px',
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 700,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    colorScheme: 'dark',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#111111',
        borderRadius: '20px 20px 0 0',
        padding: '24px 20px 40px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 20 }}>
          {existing ? 'Edit Entry' : 'Log Sleep'}
        </div>

        {/* Bedtime */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bedtime</div>
          <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} style={inputStyle} />
        </div>

        {/* Wake */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Wake Up</div>
          <input type="time" value={wake} onChange={e => setWake(e.target.value)} style={inputStyle} />
        </div>

        {/* Quality rating */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sleep Quality</div>
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
                  background: qualityIdx === i ? '#00BCD4' : '#1a1a1a',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'background 0.2s',
                }}
              >
                <span style={{ fontSize: 22 }}>{q.emoji}</span>
                <span style={{ fontSize: 10, color: qualityIdx === i ? '#000' : 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Morning feel chips */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Morning Feel</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {feelOptions.map(f => (
              <button
                key={f}
                onClick={() => setFeel(feel === f ? '' : f)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: feel === f ? '#00BCD4' : 'rgba(255,255,255,0.15)',
                  background: feel === f ? 'rgba(0,188,212,0.2)' : 'transparent',
                  color: feel === f ? '#00BCD4' : 'rgba(255,255,255,0.6)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
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
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
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
            padding: 16,
            borderRadius: 14,
            border: 'none',
            background: '#00BCD4',
            color: '#000000',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Save
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
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogModal, setShowLogModal] = useState(false);

  // Alarm state
  const [alarmHour, setAlarmHour] = useState(7);
  const [alarmMin, setAlarmMin] = useState(0);

  const weekDays = useMemo(() => getWeekDays(), []);
  const selectedEntry = allSleep[selectedDate] || null;

  // Last 7 days for stats (ending today)
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return { key: k, label: labels[d.getDay()], entry: allSleep[k] || null };
    });
  }, [allSleep]);

  const avgQuality = useMemo(() => {
    const entries = last7.filter(d => d.entry?.quality);
    if (!entries.length) return 0;
    return Math.round(entries.reduce((s, d) => s + d.entry.quality, 0) / entries.length);
  }, [last7]);

  const avgDurMins = useMemo(() => {
    const entries = last7.filter(d => d.entry?.bedtime && d.entry?.wake);
    if (!entries.length) return 0;
    const total = entries.reduce((s, d) => s + (durationMins(d.entry.bedtime, d.entry.wake) || 0), 0);
    return Math.round(total / entries.length);
  }, [last7]);

  const alarmTimeStr = `${String(alarmHour).padStart(2, '0')}:${String(alarmMin).padStart(2, '0')}`;
  const alarmEarlyStr = `${String(alarmHour).padStart(2, '0')}:${String(Math.max(0, alarmMin - 30)).padStart(2, '0')}`;

  // ── Shared styles ──────────────────────────────────────────────────────────
  const cardStyle = {
    background: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  };

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#000000', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, sans-serif', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ padding: '24px 20px 8px' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' }}>Sleep</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Track rest & recovery</div>
      </div>

      {/* Tab pill row */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', overflowX: 'auto' }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'stats', label: 'Stats' },
          { key: 'alarm', label: 'Alarm' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 20px',
              borderRadius: 20,
              border: 'none',
              background: activeTab === t.key ? '#00BCD4' : '#111111',
              color: activeTab === t.key ? '#000000' : 'rgba(255,255,255,0.55)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ padding: '16px 20px 0' }}>

          {/* Day selector */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
            {weekDays.map(day => {
              const isSelected = selectedDate === day.key;
              const hasData = !!allSleep[day.key];
              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDate(day.key)}
                  style={{
                    flexShrink: 0,
                    width: 44,
                    height: 56,
                    borderRadius: 22,
                    border: '2px solid',
                    borderColor: isSelected ? '#FF8C42' : 'rgba(255,255,255,0.08)',
                    background: isSelected ? 'rgba(255,140,66,0.12)' : '#111111',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    padding: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 10, color: isSelected ? '#FF8C42' : 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {day.label}
                  </span>
                  {hasData && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00BCD4' }} />
                  )}
                </button>
              );
            })}
          </div>

          {selectedEntry ? (
            <>
              {/* Quality Ring */}
              <QualityRing
                quality={selectedEntry.quality}
                bedtime={selectedEntry.bedtime}
                wake={selectedEntry.wake}
              />

              {/* Waveform */}
              <WaveformCard bedtime={selectedEntry.bedtime} wake={selectedEntry.wake} />

              {/* Stats card */}
              <div style={cardStyle}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Sleep Details
                </div>
                {[
                  { icon: '🌙', label: 'Went to bed', value: fmtTime(selectedEntry.bedtime) },
                  { icon: '☀️', label: 'Woke up', value: fmtTime(selectedEntry.wake) },
                  {
                    icon: '⏱', label: 'Duration',
                    value: fmtMins(durationMins(selectedEntry.bedtime, selectedEntry.wake)),
                  },
                  { icon: '✨', label: 'Quality score', value: `${selectedEntry.quality}%` },
                  ...(selectedEntry.feel ? [{ icon: '💭', label: 'Morning feel', value: selectedEntry.feel }] : []),
                ].map((row, i) => (
                  <div key={row.label} style={{ ...rowStyle, ...(i === (selectedEntry.feel ? 4 : 3) ? { borderBottom: 'none' } : {}) }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{row.icon}</span>
                      <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>{row.label}</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>😴</div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)' }}>No sleep data for this day</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>Tap "Log Sleep" to add an entry</div>
            </div>
          )}

          {/* Log / Edit button */}
          <button
            onClick={() => setShowLogModal(true)}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 14,
              border: 'none',
              background: '#00BCD4',
              color: '#000000',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            {selectedEntry ? 'Edit Entry' : 'Log Sleep'}
          </button>
        </div>
      )}

      {/* ── TAB 2: STATS ────────────────────────────────────────────────────── */}
      {activeTab === 'stats' && (
        <div style={{ padding: '16px 20px 0' }}>

          {/* Header */}
          <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>Last 7 Days</div>

          {/* Quality bar chart */}
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Sleep Quality
            </div>
            <div style={{ position: 'relative' }}>
              <svg width="100%" viewBox="0 0 320 100" style={{ display: 'block', overflow: 'visible' }}>
                {/* Y-axis lines */}
                {[0, 25, 50, 75, 100].map(v => (
                  <g key={v}>
                    <line x1={28} y1={80 - v * 0.72} x2={310} y2={80 - v * 0.72} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                    <text x={22} y={80 - v * 0.72 + 3} fontSize={8} fill="rgba(255,255,255,0.3)" textAnchor="end">{v}</text>
                  </g>
                ))}
                {/* Avg dashed line */}
                {avgQuality > 0 && (
                  <line
                    x1={28} y1={80 - avgQuality * 0.72}
                    x2={310} y2={80 - avgQuality * 0.72}
                    stroke="#FFA726" strokeWidth={1} strokeDasharray="4,3"
                  />
                )}
                {/* Bars */}
                {last7.map((d, i) => {
                  const q = d.entry?.quality || 0;
                  const barH = q * 0.72;
                  const x = 32 + i * 40;
                  return (
                    <g key={d.key}>
                      <rect x={x} y={80 - barH} width={24} height={barH} fill="#FF8C42" rx={4} opacity={q ? 1 : 0.15} />
                      <text x={x + 12} y={94} fontSize={9} fill="rgba(255,255,255,0.4)" textAnchor="middle">{d.label}</text>
                      {q > 0 && <text x={x + 12} y={80 - barH - 4} fontSize={8} fill="rgba(255,255,255,0.5)" textAnchor="middle">{q}</text>}
                    </g>
                  );
                })}
              </svg>
              {avgQuality > 0 && (
                <div style={{ fontSize: 11, color: '#FFA726', marginTop: 4 }}>
                  — Avg: {avgQuality}%
                </div>
              )}
            </div>
          </div>

          {/* Average Duration */}
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
              {avgDurMins ? fmtMins(avgDurMins) : '—'}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Your average sleep</div>
          </div>

          {/* Days of week breakdown */}
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Days of Week
            </div>
            {last7.map(d => {
              const q = d.entry?.quality || 0;
              return (
                <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, fontSize: 12, color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>{d.label}</div>
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${q}%`, height: '100%', background: '#FF8C42', borderRadius: 4, transition: 'width 0.8s ease' }} />
                  </div>
                  <div style={{ width: 32, fontSize: 12, color: 'rgba(255,255,255,0.55)', textAlign: 'right' }}>
                    {q ? `${q}%` : '—'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* What affected your sleep */}
          <div style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 14 }}>
              What affected your sleep
            </div>
            {[
              { sign: '+', pct: 6, label: 'Early bedtime', positive: true },
              { sign: '+', pct: 4, label: 'Exercise', positive: true },
              { sign: '-', pct: 8, label: 'Late screen time', positive: false },
              { sign: '-', pct: 5, label: 'Stress', positive: false },
              { sign: '-', pct: 3, label: 'Caffeine after 4pm', positive: false },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 8,
                borderLeft: `3px solid ${item.positive ? '#4CAF50' : '#FF8C42'}`,
                background: item.positive ? 'rgba(76,175,80,0.06)' : 'rgba(255,140,66,0.06)',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: item.positive ? '#4CAF50' : '#FF8C42', minWidth: 36 }}>
                  {item.sign}{item.pct}%
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Premium blurred section */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Advanced Insights
            </div>
            {[
              'Sleep Consistency Score',
              'Circadian Rhythm Analysis',
              'Recovery Efficiency',
            ].map(label => (
              <div key={label} style={{ position: 'relative', marginBottom: 10, borderRadius: 16, overflow: 'hidden' }}>
                {/* Blurred chart behind */}
                <div style={{ filter: 'blur(8px)', pointerEvents: 'none' }}>
                  <div style={{ background: '#111111', borderRadius: 16, padding: 20, height: 90 }}>
                    <svg width="100%" height={50} viewBox="0 0 280 50">
                      {[0, 1, 2, 3, 4, 5, 6].map(i => (
                        <rect key={i} x={10 + i * 38} y={50 - 15 - Math.random() * 30} width={22} height={15 + Math.random() * 30} fill="#FF8C42" rx={4} />
                      ))}
                    </svg>
                  </div>
                </div>
                {/* Overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.55)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 8,
                }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Available to Premium members.</div>
                  <button style={{
                    padding: '6px 18px',
                    borderRadius: 20,
                    border: '1.5px solid #00BCD4',
                    background: 'transparent',
                    color: '#00BCD4',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}>
                    Unlock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: ALARM ────────────────────────────────────────────────────── */}
      {activeTab === 'alarm' && (
        <div style={{ padding: '16px 20px 0', minHeight: '70vh', position: 'relative' }}>
          {/* Starfield background */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.6) 0%, transparent 100%),
              radial-gradient(1px 1px at 35% 42%, rgba(255,255,255,0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 58% 8%, rgba(255,255,255,0.7) 0%, transparent 100%),
              radial-gradient(1px 1px at 78% 31%, rgba(255,255,255,0.4) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 22% 65%, rgba(255,255,255,0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 90% 55%, rgba(255,255,255,0.6) 0%, transparent 100%),
              radial-gradient(1px 1px at 48% 77%, rgba(255,255,255,0.4) 0%, transparent 100%),
              radial-gradient(1px 1px at 68% 88%, rgba(255,255,255,0.5) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 8% 88%, rgba(255,255,255,0.35) 0%, transparent 100%),
              radial-gradient(1px 1px at 95% 12%, rgba(255,255,255,0.5) 0%, transparent 100%),
              #000000
            `,
            borderRadius: 0,
            zIndex: 0,
          }} />

          {/* Content over starfield */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Sleep Aid pill */}
            <button style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              borderRadius: 20,
              border: '1.5px solid rgba(255,255,255,0.2)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 48,
            }}>
              <span>♪</span>
              <span>Sleep Aid</span>
            </button>

            {/* Large time display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              {/* Hour controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <button
                  onClick={() => setAlarmHour(h => (h + 1) % 24)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer' }}
                >+</button>
                <button
                  onClick={() => setAlarmHour(h => (h - 1 + 24) % 24)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer' }}
                >−</button>
              </div>

              {/* Time text */}
              <div style={{ fontSize: 56, fontWeight: 700, color: '#ffffff', letterSpacing: -2, minWidth: 180, textAlign: 'center' }}>
                {alarmTimeStr}
              </div>

              {/* Minute controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
                <button
                  onClick={() => setAlarmMin(m => (m + 5) % 60)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer' }}
                >+</button>
                <button
                  onClick={() => setAlarmMin(m => (m - 5 + 60) % 60)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, color: '#fff', fontSize: 18, cursor: 'pointer' }}
                >−</button>
              </div>
            </div>

            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 48, textAlign: 'center' }}>
              Wake up easy between {alarmEarlyStr} – {alarmTimeStr}
            </div>

            {/* Start button */}
            <button style={{
              width: 260,
              padding: 18,
              borderRadius: 16,
              border: 'none',
              background: '#00BCD4',
              color: '#000000',
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}>
              Start
            </button>
          </div>
        </div>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <LogModal
          existing={selectedEntry}
          onSave={(entry) => {
            if (onSetSleep) onSetSleep(selectedDate, entry);
          }}
          onClose={() => setShowLogModal(false)}
        />
      )}
    </div>
  );
}
