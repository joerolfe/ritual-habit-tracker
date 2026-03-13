import React, { useMemo } from 'react';
import { getLevelInfo } from '../utils/achievements';
import { getOverallStreak } from '../utils/streaks';

export default function ProfileView({
  currentUser,
  habits,
  completions,
  sleep,
  workouts,
  journal,
  shields,
  onShowAchievements,
  onShowPremium,
  onShowExport,
  onSignOut,
  onDeleteAccount,
  onSignIn,
  isSupabaseSynced,
}) {
  const initials = currentUser
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const levelInfo   = useMemo(() => getLevelInfo(completions), [completions]);
  const streak      = useMemo(() => getOverallStreak(habits, completions), [habits, completions]);
  const nightsLogged = useMemo(() => Object.keys(sleep || {}).filter(k => sleep[k]?.duration).length, [sleep]);
  const avgQuality  = useMemo(() => {
    const entries = Object.values(sleep || {}).filter(e => e?.quality > 0);
    if (!entries.length) return '—';
    const avg = entries.reduce((s, e) => s + e.quality, 0) / entries.length;
    return avg.toFixed(1);
  }, [sleep]);
  const avgSleepTime = useMemo(() => {
    const entries = Object.values(sleep || {}).filter(e => e?.duration > 0);
    if (!entries.length) return '—';
    const avg = entries.reduce((s, e) => s + e.duration, 0) / entries.length;
    const h = Math.floor(avg), m = Math.round((avg - h) * 60);
    return `${h}h${m > 0 ? ` ${m}m` : ''}`;
  }, [sleep]);
  const workoutCount  = useMemo(() => (workouts || []).length, [workouts]);
  const journalCount  = useMemo(() => Object.keys(journal || {}).length, [journal]);

  const stats = [
    { icon: '🌙', value: nightsLogged, label: 'Nights tracked' },
    { icon: '🎯', value: avgQuality,   label: 'Avg quality' },
    { icon: '⏰', value: avgSleepTime, label: 'Avg sleep' },
    { icon: '🔥', value: streak || 0,  label: 'Day streak' },
    { icon: '💪', value: workoutCount, label: 'Workouts' },
    { icon: '📖', value: journalCount, label: 'Journal entries' },
    { icon: '⭐', value: `Lv ${levelInfo.level}`, label: levelInfo.title },
    { icon: '🛡️', value: shields || 0, label: 'Shields' },
  ];

  return (
    <div className="profile-view">
      {/* Top: avatar + name */}
      <div className="profile-top">
        <div className="profile-avatar-circle">{initials}</div>
        {currentUser ? (
          <>
            <span className="profile-view-name">{currentUser.name}</span>
            <span className="profile-view-email">{currentUser.email}</span>
          </>
        ) : (
          <span className="profile-view-name">Guest</span>
        )}
        <span className="profile-sync-badge">
          {isSupabaseSynced ? '🟢 Synced' : '⚫ Local only'}
        </span>
      </div>

      {/* Stats grid */}
      <div>
        <div className="profile-settings-label">Stats</div>
        <div className="profile-stats-grid">
          {stats.map(s => (
            <div key={s.label} className="profile-stat-card">
              <span className="profile-stat-icon">{s.icon}</span>
              <span className="profile-stat-value">{s.value}</span>
              <span className="profile-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings list */}
      <div className="profile-settings-section">
        <div className="profile-settings-label">Settings</div>
        <div className="profile-settings-list">
          <button className="profile-settings-row" onClick={onShowAchievements}>
            <span className="profile-row-icon">🏆</span>
            <span className="profile-row-label">Achievements</span>
            <span className="profile-row-chevron">›</span>
          </button>
          <button className="profile-settings-row" onClick={onShowPremium}>
            <span className="profile-row-icon">👑</span>
            <span className="profile-row-label">Go Premium</span>
            <span className="profile-row-chevron">›</span>
          </button>
          <button className="profile-settings-row" onClick={onShowExport}>
            <span className="profile-row-icon">📦</span>
            <span className="profile-row-label">Export Data</span>
            <span className="profile-row-chevron">›</span>
          </button>
          {currentUser ? (
            <>
              <button className="profile-settings-row danger" onClick={onSignOut}>
                <span className="profile-row-icon">🚪</span>
                <span className="profile-row-label">Sign Out</span>
              </button>
              <button className="profile-settings-row danger" onClick={onDeleteAccount}>
                <span className="profile-row-icon">🗑️</span>
                <span className="profile-row-label">Delete All Data</span>
              </button>
            </>
          ) : (
            <button className="profile-settings-row" onClick={onSignIn}>
              <span className="profile-row-icon">🔑</span>
              <span className="profile-row-label">Sign In</span>
              <span className="profile-row-chevron">›</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
