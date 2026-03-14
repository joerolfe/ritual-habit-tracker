import React, { useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, ReferenceLine, ReferenceArea,
  Tooltip, Legend,
} from 'recharts';

const strainData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  strain: 40 + Math.sin(i * 0.4) * 15 + (i > 20 ? 10 : 0) + (i === 25 ? 15 : 0),
  secondary: 35 + Math.cos(i * 0.3) * 10,
}));

const CARD_STYLE = {
  boxSizing: 'border-box',
  background: '#111111',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.08)',
  padding: 16,
  marginBottom: 8,
};

const FILTERS = [
  { id: 'strain',    label: 'Strain score' },
  { id: 'duration',  label: 'Exercise Duration' },
  { id: 'hr',        label: 'Daytime HR' },
];

const METRIC_CARDS = [
  {
    icon: '❤️',
    label: 'Daytime HR',
    value: '45 bpm',
    badge: { text: '🔵 Below normal', bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' },
    sparkData: [{ v: 52 }, { v: 48 }, { v: 46 }, { v: 45 }, { v: 47 }, { v: 45 }, { v: 44 }],
    sparkColor: '#FFFFFF',
  },
  {
    icon: '⚡',
    label: 'Total Energy',
    value: '654 kCal',
    badge: { text: '✅ Normal', bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' },
    sparkData: [{ v: 600 }, { v: 620 }, { v: 640 }, { v: 654 }, { v: 630 }, { v: 650 }, { v: 654 }],
    sparkColor: '#FFFFFF',
  },
  {
    icon: '👣',
    label: 'Step Count',
    value: '3,898',
    badge: { text: '🟠 Below normal', bg: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' },
    sparkData: [{ v: 6000 }, { v: 5200 }, { v: 4800 }, { v: 4200 }, { v: 4500 }, { v: 4100 }, { v: 3898 }],
    sparkColor: '#FFFFFF',
  },
];

export default function StrainView() {
  const [activeFilter, setActiveFilter] = useState('strain');

  return (
    <div style={{ boxSizing: 'border-box', padding: 16, paddingBottom: 120, background: '#000000', minHeight: '100%' }}>

      {/* ── Strain Score Card ── */}
      <div style={CARD_STYLE}>

        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
            Strain Score
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter, sans-serif' }}>
            Normal range ≡ 34–67%
          </span>
        </div>

        {/* Main value */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#FFFFFF', lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>
            65%
          </div>
          <div style={{ fontSize: 13, color: '#888888', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
            Feb 19, 2025
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                boxSizing: 'border-box',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
                background: activeFilter === f.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeFilter === f.id ? 'rgba(255,255,255,0.75)' : '#888888',
                border: activeFilter === f.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Strain chart */}
        <div style={{ position: 'relative', boxSizing: 'border-box' }}>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={strainData} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="strainArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <ReferenceArea y1={34} y2={67} fill="rgba(255,255,255,0.04)" />
              <ReferenceLine
                y={66}
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="4 4"
                label={{ value: 'Avg 66%', position: 'insideTopRight', fill: '#FFFFFF', fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="strain"
                stroke="#FFFFFF"
                strokeWidth={2}
                dot={{ fill: '#FFFFFF', r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="secondary"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth={2}
                dot={{ fill: 'rgba(255,255,255,0.45)', r: 2 }}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: '#888888', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={6}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 33, 67, 100]}
                tick={{ fill: '#888888', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      {METRIC_CARDS.map((card) => (
        <div key={card.label} style={CARD_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Icon + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 20 }}>{card.icon}</span>
                <span style={{ fontSize: 12, color: '#888888', fontFamily: 'Inter, sans-serif' }}>
                  {card.label}
                </span>
              </div>
              {/* Value */}
              <div style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF', fontFamily: 'Inter, sans-serif', lineHeight: 1.1 }}>
                {card.value}
              </div>
              {/* Badge */}
              <div style={{
                display: 'inline-block',
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 12,
                background: card.badge.bg,
                color: card.badge.color,
                fontFamily: 'Inter, sans-serif',
                width: 'fit-content',
              }}>
                {card.badge.text}
              </div>
            </div>

            {/* Right — sparkline */}
            <LineChart width={80} height={40} data={card.sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={card.sparkColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>

          </div>
        </div>
      ))}

    </div>
  );
}
