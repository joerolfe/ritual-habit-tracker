import React from 'react';
import { getLevelInfo, STREAK_BADGES } from '../utils/achievements';

export default function AchievementsModal({ habits, completions, achievements, onClose }) {
  const levelInfo = getLevelInfo(completions);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="achievements-modal" onClick={e => e.stopPropagation()}>
        <div className="achievements-header">
          <h2 className="achievements-title">Achievements</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Level card */}
        <div className="level-card">
          <div className="level-card-top">
            <div className="level-badge">
              <span className="level-num">{levelInfo.level}</span>
            </div>
            <div className="level-info">
              <span className="level-title">{levelInfo.title}</span>
              <span className="level-xp">{levelInfo.xp} XP total</span>
            </div>
            <div className="level-next">
              {levelInfo.nextXp
                ? <span className="level-next-label">{levelInfo.nextXp - levelInfo.xp} XP to {levelInfo.nextTitle}</span>
                : <span className="level-next-label level-maxed">Max Level 🏆</span>
              }
            </div>
          </div>
          <div className="level-bar-track">
            <div
              className="level-bar-fill"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>

        {/* Global badges */}
        <div className="achieve-section">
          <div className="achieve-section-label">Global Badges</div>
          <div className="badges-grid">
            {[
              { id: 'first_step',    label: 'First Step',    icon: '🌱', desc: 'Complete your first habit' },
              { id: 'perfect_week',  label: 'Perfect Week',  icon: '⭐', desc: '7-day all-habit streak' },
              { id: 'perfect_month', label: 'Iron Month',    icon: '🔱', desc: '30-day all-habit streak' },
              { id: 'century',       label: 'Century Club',  icon: '💯', desc: '100 total completions' },
              { id: 'legend',        label: 'Legend',        icon: '🏆', desc: '1000 total completions' },
            ].map(b => {
              const earned = !!achievements?.[b.id];
              return (
                <div key={b.id} className={`badge-card ${earned ? 'earned' : 'locked'}`}>
                  <span className="badge-icon">{earned ? b.icon : '🔒'}</span>
                  <span className="badge-label">{b.label}</span>
                  <span className="badge-desc">{b.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-habit badges */}
        {habits.length > 0 && (
          <div className="achieve-section">
            <div className="achieve-section-label">Habit Streaks</div>
            <div className="habit-badges-list">
              {habits.map(habit => {
                return (
                  <div key={habit.id} className="habit-badge-row">
                    <span className="hb-icon">{habit.icon || '⭐'}</span>
                    <span className="hb-name">{habit.name}</span>
                    <div className="hb-badges">
                      {STREAK_BADGES.map(b => {
                        const got = !!achievements?.[`${habit.id}_${b.id}`];
                        return (
                          <span
                            key={b.id}
                            className={`hb-badge ${got ? 'earned' : 'locked'}`}
                            title={b.desc}
                          >
                            {got ? b.icon : '·'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
