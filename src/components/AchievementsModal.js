import React from 'react';
import { getLevelInfo, STREAK_BADGES } from '../utils/achievements';

const GLOBAL_BADGES = [
  { id: 'first_step',    label: 'First Step',   icon: '🌱', xp: 50 },
  { id: 'perfect_week',  label: 'Perfect Week', icon: '⭐', xp: 100 },
  { id: 'perfect_month', label: 'Iron Month',   icon: '🔱', xp: 500 },
  { id: 'century',       label: 'Century Club', icon: '💯', xp: 200 },
  { id: 'legend',        label: 'Legend',       icon: '🏆', xp: 1000 },
];

export default function AchievementsModal({ habits, completions, achievements, onClose }) {
  const levelInfo = getLevelInfo(completions);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000000',
        zIndex: 1000,
        overflowY: 'auto',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px 12px',
          position: 'sticky',
          top: 0,
          background: '#000000',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 24,
            fontWeight: 700,
            color: '#ffffff',
          }}
        >
          Achievements
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: 20,
            cursor: 'pointer',
            padding: '4px 8px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '0 20px 40px' }}>

        {/* XP Progress Section */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            {/* Level badge */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00BCD4, #0097A7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>
                {levelInfo.level}
              </span>
            </div>

            {/* Level title + XP count */}
            <div style={{ flex: 1 }}>
              <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 600, marginBottom: 2 }}>
                {levelInfo.title}
              </div>
              <div style={{ color: '#888', fontSize: 13 }}>
                {levelInfo.xp} XP total
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: 6,
              background: '#1A1A1A',
              borderRadius: 3,
              overflow: 'hidden',
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: `${levelInfo.progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00BCD4, #0097A7)',
                borderRadius: 3,
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {/* XP to next level */}
          <div style={{ textAlign: 'right' }}>
            {levelInfo.nextXp ? (
              <span style={{ fontSize: 12, color: '#555' }}>
                {levelInfo.nextXp - levelInfo.xp} XP to {levelInfo.nextTitle}
              </span>
            ) : (
              <span style={{ fontSize: 12, color: '#00BCD4' }}>Max Level 🏆</span>
            )}
          </div>
        </div>

        {/* Global Badges grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 8,
          }}
        >
          {GLOBAL_BADGES.map(b => {
            const earned = !!achievements?.[b.id];
            return (
              <div
                key={b.id}
                style={{
                  background: '#111',
                  border: earned ? '1px solid rgba(0,188,212,0.3)' : '1px solid #333',
                  borderRadius: 16,
                  padding: 16,
                  minHeight: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textAlign: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 32,
                    filter: earned ? 'none' : 'grayscale(1) opacity(0.3)',
                    lineHeight: 1,
                  }}
                >
                  {b.icon}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: earned ? '#ffffff' : '#444',
                  }}
                >
                  {earned ? b.label : '???'}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: earned ? '#00BCD4' : '#333',
                  }}
                >
                  {earned ? `+${b.xp} XP` : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Habit Streaks */}
        {habits.length > 0 && (
          <>
            <div
              style={{
                marginTop: 24,
                marginBottom: 12,
                fontSize: 11,
                color: '#555',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              Habit Streaks
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {habits.map(habit => (
                <div
                  key={habit.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  {/* Icon + name */}
                  <span style={{ fontSize: 18, flexShrink: 0 }}>
                    {habit.icon || '⭐'}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: '#ccc',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {habit.name}
                  </span>

                  {/* Streak badge dots */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {STREAK_BADGES.map(b => {
                      const got = !!achievements?.[`${habit.id}_${b.id}`];
                      return (
                        <div
                          key={b.id}
                          title={got ? b.label : b.desc}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: got ? '#00BCD4' : '#2a2a2a',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
