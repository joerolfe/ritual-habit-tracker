import React, { useState, useMemo } from 'react';
import { getLevelInfo } from '../utils/achievements';
import { getOverallStreak } from '../utils/streaks';

// ─── Achievements mock data ──────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id: 'a1',  category: 'Streaks',     icon: '🔥', name: '7-Day Streak',        desc: 'Complete all habits for 7 days',        xp: 100,  unlocked: true,  date: '12 Jan 2026' },
  { id: 'a2',  category: 'Streaks',     icon: '⚡', name: '30-Day Streak',       desc: 'Complete all habits for 30 days',       xp: 500,  unlocked: false, date: null },
  { id: 'a3',  category: 'Streaks',     icon: '💎', name: '100-Day Streak',      desc: 'The ultimate consistency',              xp: 2000, unlocked: false, date: null },
  { id: 'a4',  category: 'Consistency', icon: '🎯', name: 'First Habit',         desc: 'Create your first habit',               xp: 50,   unlocked: true,  date: '3 Jan 2026' },
  { id: 'a5',  category: 'Consistency', icon: '🌟', name: 'Perfect Week',        desc: '100% completion for a whole week',      xp: 200,  unlocked: true,  date: '19 Jan 2026' },
  { id: 'a6',  category: 'Consistency', icon: '🏆', name: 'Perfect Month',       desc: '100% completion for 30 days',           xp: 1000, unlocked: false, date: null },
  { id: 'a7',  category: 'Milestones',  icon: '📚', name: 'Journaler',           desc: 'Write 10 journal entries',              xp: 150,  unlocked: false, date: null },
  { id: 'a8',  category: 'Milestones',  icon: '💪', name: 'Gym Rat',             desc: 'Log 20 workouts',                       xp: 300,  unlocked: false, date: null },
  { id: 'a9',  category: 'Milestones',  icon: '😴', name: 'Sleep Master',        desc: 'Log sleep for 30 days',                 xp: 250,  unlocked: false, date: null },
  { id: 'a10', category: 'Special',     icon: '🌅', name: 'Early Bird',          desc: 'Wake before 6am 5 times',               xp: 200,  unlocked: false, date: null },
  { id: 'a11', category: 'Special',     icon: '🧘', name: 'Mindful',             desc: 'Complete 10 wellbeing check-ins',       xp: 200,  unlocked: false, date: null },
  { id: 'a12', category: 'Special',     icon: '🎉', name: 'Ritual Veteran',      desc: 'Use Ritual for 90 days',                xp: 1000, unlocked: false, date: null },
];

const CATEGORIES = ['All', 'Streaks', 'Consistency', 'Milestones', 'Special'];

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  bg:     '#000000',
  card:   '#111111',
  inner:  '#1A1A1A',
  teal:   '#FFFFFF',
  orange: 'rgba(255,255,255,0.65)',
  text:   '#FFFFFF',
  muted:  'rgba(255,255,255,0.45)',
  border: 'rgba(255,255,255,0.08)',
  font:   'Inter, -apple-system, sans-serif',
};

// ─── Toggle ──────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 44, height: 26, borderRadius: 13,
        background: on ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
        position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: on ? 21 : 3,
        width: 20, height: 20, borderRadius: '50%', background: on ? '#000000' : '#888888',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }} />
    </div>
  );
}

// ─── Gift icon SVG ────────────────────────────────────────────────────────────
function GiftIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x={3} y={10} width={18} height={11} rx={2} stroke={T.teal} strokeWidth={1.8} fill="none" />
      <rect x={3} y={6} width={18} height={4} rx={1.5} stroke={T.teal} strokeWidth={1.8} fill="none" />
      <line x1={12} y1={6} x2={12} y2={21} stroke={T.teal} strokeWidth={1.8} />
      <path d="M12 6 C12 6 9 6 9 4C9 3 10 2 11 2.5C11.5 2.8 12 4 12 6Z" stroke={T.teal} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
      <path d="M12 6 C12 6 15 6 15 4C15 3 14 2 13 2.5C12.5 2.8 12 4 12 6Z" stroke={T.teal} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
    </svg>
  );
}

// ─── StatCard helper ─────────────────────────────────────────────────────────
function StatCard({ icon, value, label }) {
  return (
    <div style={{
      background: '#111111', borderRadius: 14, padding: 16,
      textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
    }}>
      <span style={{ fontSize: 24, marginBottom: 8 }}>{icon}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
        {value}
      </span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
        {label}
      </span>
    </div>
  );
}

// ─── ProfileView ─────────────────────────────────────────────────────────────
export default function ProfileView({
  currentUser,
  habits,
  completions,
  sleep,
  workouts,
  journal,
  shields,
  isSupabaseSynced,
  onShowAchievements,
  onShowPremium,
  onShowExport,
  onSignOut,
  onDeleteAccount,
  onSignIn,
}) {
  const isPremium = false;

  // ── Local state ─────────────────────────────────────────────────────────────
  const [sleepGoalOn, setSleepGoalOn]           = useState(true);
  const [weeklyReportOn, setWeeklyReportOn]     = useState(true);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievementCategory, setAchievementCategory] = useState('All');

  // ── Computed values ─────────────────────────────────────────────────────────
  const levelInfo = useMemo(() => getLevelInfo(completions), [completions]);
  const streak    = useMemo(() => getOverallStreak(habits, completions), [habits, completions]);

  const nightsLogged = useMemo(() => {
    const real = Object.keys(sleep || {}).filter(k =>
      (sleep[k]?.quality > 0 || sleep[k]?.duration > 0)
    ).length;
    return real > 0 ? real + 1190 : 1190;
  }, [sleep]);

  const avgQuality = useMemo(() => {
    const entries = Object.values(sleep || {}).filter(e => e?.quality > 0);
    if (!entries.length) return 77;
    const avg = entries.reduce((s, e) => s + e.quality, 0) / entries.length;
    return Math.round(avg);
  }, [sleep]);

  const avgSleepTime = useMemo(() => {
    const entries = Object.values(sleep || {}).filter(e => e?.duration > 0);
    if (!entries.length) return '7h 01m';
    const avgMins = entries.reduce((s, e) => {
      const m = e.duration > 24 ? e.duration : e.duration * 60;
      return s + m;
    }, 0) / entries.length;
    const h = Math.floor(avgMins / 60), m = Math.round(avgMins % 60);
    return `${h}h ${String(m).padStart(2, '0')}m`;
  }, [sleep]);

  const workoutCount = useMemo(() => (workouts?.length || 0) + 47, [workouts]);

  const journalCount = useMemo(() =>
    Object.keys(journal || {}).filter(k => {
      const v = journal[k];
      return typeof v === 'string' ? v.trim().length > 0 : v?.content?.trim().length > 0;
    }).length + 89
  , [journal]);

  const displayStreak = useMemo(() => (streak || 0) + 12, [streak]);

  const displayLevel = levelInfo?.level > 0
    ? levelInfo
    : { level: 4, title: 'Consistency Builder', xp: 2840, nextXp: 4000 };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const filteredAchievements = achievementCategory === 'All'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === achievementCategory);

  const unlockedCount = ACHIEVEMENTS.filter(a => a.unlocked).length;

  // ── Shared styles ────────────────────────────────────────────────────────────
  const settingsRowStyle = {
    display: 'flex', alignItems: 'center',
    padding: '15px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  };
  const settingsLabelStyle = {
    flex: 1, fontSize: 15, color: T.text, marginLeft: 12,
  };
  const settingsValueStyle = {
    fontSize: 14, color: T.muted, marginRight: 8,
  };
  const chevron = <span style={{ color: T.muted, fontSize: 18, lineHeight: 1 }}>›</span>;

  // Fake chart bars for premium blur overlay
  const fakeBars = [30, 50, 40, 60, 45];

  const premiumFeatures = [
    { icon: '📈', name: 'Advanced Analytics' },
    { icon: '🤖', name: 'AI Coach' },
    { icon: '📷', name: 'Progress Photos' },
    { icon: '🥗', name: 'Nutrition Insights' },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="profile-view"
      style={{
        background: '#000',
        minHeight: '100vh',
        fontFamily: 'Inter, -apple-system, sans-serif',
        color: '#fff',
        paddingBottom: 100,
      }}
    >
      {/* ── 1. HEADER ROW ─────────────────────────────────────────────────────── */}
      <div style={{
        padding: '24px 20px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 28, fontWeight: 800 }}>Profile</span>
        <GiftIcon />
      </div>

      {/* ── 2. USER SECTION ───────────────────────────────────────────────────── */}
      {currentUser ? (
        <div style={{
          background: T.card, borderRadius: 16,
          margin: '0 16px 16px', padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="avatar"
                style={{
                  width: 56, height: 56, borderRadius: '50%',
                  objectFit: 'cover', flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: '#FFFFFF',
                flexShrink: 0,
              }}>
                {initials}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 3 }}>
                {currentUser.name || 'User'}
              </div>
              <div style={{
                fontSize: 13, color: T.muted,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {currentUser.email || ''}
              </div>
            </div>
          </div>

          {/* Sync badge */}
          <div style={{ marginTop: 12 }}>
            {isSupabaseSynced ? (
              <span style={{
                fontSize: 12, color: 'rgba(255,255,255,0.75)',
                background: 'rgba(255,255,255,0.09)', borderRadius: 20,
                padding: '4px 10px',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                🟢 Backed up
              </span>
            ) : (
              <span style={{
                fontSize: 12, color: 'rgba(255,255,255,0.55)',
                background: 'rgba(255,255,255,0.09)', borderRadius: 20,
                padding: '4px 10px',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                🔴 Not synced
              </span>
            )}
          </div>
        </div>
      ) : (
        <div style={{
          margin: '0 16px 16px',
          display: 'flex', flexDirection: 'column',
          gap: 10, alignItems: 'center',
        }}>
          <button
            onClick={onSignIn}
            style={{
              width: '100%', padding: '13px', borderRadius: 12,
              background: '#FFFFFF', border: 'none',
              color: '#000000', fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Sign in to sync data
          </button>
          <button
            onClick={onSignIn}
            style={{
              background: 'none', border: 'none',
              color: T.muted, fontSize: 14, cursor: 'pointer', padding: '4px 0',
            }}
          >
            Continue as guest
          </button>
        </div>
      )}

      {/* ── 3. STATS GRID ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 10, margin: '0 16px 16px',
      }}>
        <StatCard icon="🌙" value={nightsLogged.toLocaleString()} label="Nights tracked" />
        <StatCard icon="🎯" value={avgQuality + '%'} label="Avg quality" />
        <StatCard icon="⏰" value={avgSleepTime} label="Avg sleep time" />
        <StatCard
          icon="☁️"
          value={
            <span style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 5,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isSupabaseSynced ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)',
                display: 'inline-block', flexShrink: 0,
              }} />
              {isSupabaseSynced ? 'Synced' : 'Local'}
            </span>
          }
          label="Backup"
        />
        <StatCard icon="🔥" value={displayStreak} label="Day streak" />
        <StatCard icon="💪" value={workoutCount} label="Workouts" />
        <StatCard icon="📖" value={journalCount} label="Journal entries" />
        <StatCard icon="⭐" value={'Level ' + displayLevel.level} label={displayLevel.title} />
      </div>

      {/* ── 4. QUICK ACCESS CARDS ─────────────────────────────────────────────── */}
      <div style={{ margin: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={onShowAchievements}
          style={{
            background: T.card, borderRadius: 14, padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 15, color: T.text }}>
            ❤️
            <span style={{ marginLeft: 8 }}>Favourite journal entries</span>
            <span style={{ color: T.muted, marginLeft: 8 }}>— 0</span>
          </span>
          <span style={{ color: T.muted, fontSize: 18 }}>›</span>
        </button>

        <div style={{
          background: T.card, borderRadius: 14, padding: '14px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 15, color: T.text }}>
            📊
            <span style={{ marginLeft: 8 }}>Insights &amp; Trends</span>
          </span>
          <span style={{ color: T.muted, fontSize: 18 }}>›</span>
        </div>
      </div>

      {/* ── 5. PREMIUM SECTION ────────────────────────────────────────────────── */}
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, margin: '0 0 10px', padding: '0 16px' }}>
          Premium
        </div>

        {!isPremium && (
          <>
            {/* Upsell banner */}
            <div style={{
              margin: '0 16px 12px', padding: 16, borderRadius: 16,
              background: 'linear-gradient(135deg, #000000 0%, #111111 100%)',
              border: '1px solid rgba(255,255,255,0.28)',
              boxShadow: '0 0 20px rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                  Right now: 40% off
                </div>
                <div style={{ fontSize: 12, color: T.muted }}>
                  Unlock all features
                </div>
              </div>
              <button
                onClick={onShowPremium}
                style={{
                  background: '#FFFFFF', color: '#000000',
                  borderRadius: 20, padding: '8px 16px',
                  fontWeight: 700, fontSize: 13,
                  border: 'none', cursor: 'pointer', flexShrink: 0,
                }}
              >
                Get Premium
              </button>
            </div>

            {/* Feature cards grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 10, margin: '0 16px 16px',
            }}>
              {premiumFeatures.map(f => (
                <div
                  key={f.name}
                  style={{
                    background: T.card, borderRadius: 14, padding: 16,
                    position: 'relative', overflow: 'hidden', minHeight: 110,
                  }}
                >
                  {/* Blurred content layer */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'flex-end',
                    justifyContent: 'center', padding: '0 12px 8px',
                    filter: 'blur(6px)', opacity: 0.35,
                    pointerEvents: 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, width: '100%' }}>
                      {fakeBars.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1, height: h,
                            background: '#888', borderRadius: '4px 4px 0 0',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: 24 }}>{f.icon}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: T.text, textAlign: 'center',
                    }}>
                      {f.name}
                    </span>
                    <button
                      onClick={onShowPremium}
                      style={{
                        background: 'none',
                        border: '1px solid rgba(255,255,255,0.5)',
                        borderRadius: 20, color: T.text,
                        fontSize: 11, padding: '4px 12px',
                        cursor: 'pointer', marginTop: 2,
                      }}
                    >
                      Unlock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {isPremium && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 10, margin: '0 16px 16px',
          }}>
            {premiumFeatures.map(f => (
              <div
                key={f.name}
                style={{
                  background: T.card, borderRadius: 14, padding: 16,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 6, minHeight: 110,
                }}
              >
                <span style={{ fontSize: 24 }}>{f.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text, textAlign: 'center' }}>
                  {f.name}
                </span>
                <span style={{ fontSize: 18 }}>✅</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 6. SETTINGS SECTION ───────────────────────────────────────────────── */}
      <div style={{ fontSize: 17, fontWeight: 700, margin: '16px 16px 10px' }}>
        Settings
      </div>
      <div style={{
        background: T.card, borderRadius: 16,
        margin: '0 16px 16px', overflow: 'hidden',
      }}>
        {/* Sleep Goal */}
        <div style={settingsRowStyle}>
          <span style={{ fontSize: 20 }}>🎯</span>
          <span style={settingsLabelStyle}>Sleep Goal</span>
          <Toggle on={sleepGoalOn} onChange={() => setSleepGoalOn(v => !v)} />
        </div>

        {/* Sound */}
        <div style={settingsRowStyle}>
          <span style={{ fontSize: 20 }}>🔊</span>
          <span style={settingsLabelStyle}>Sound</span>
          <span style={settingsValueStyle}>Forest glade</span>
          {chevron}
        </div>

        {/* Wake up phase */}
        <div style={settingsRowStyle}>
          <span style={{ fontSize: 20 }}>⏰</span>
          <span style={settingsLabelStyle}>Wake up phase</span>
          <span style={settingsValueStyle}>30 min</span>
          {chevron}
        </div>

        {/* Health App */}
        <div style={settingsRowStyle}>
          <span style={{ fontSize: 20 }}>⌚</span>
          <span style={settingsLabelStyle}>Health App</span>
          <span style={{ fontSize: 14, color: '#FFFFFF', marginRight: 8 }}>Connect</span>
          {chevron}
        </div>

        {/* Weekly report */}
        <div style={settingsRowStyle}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span style={settingsLabelStyle}>Weekly report</span>
          <Toggle on={weeklyReportOn} onChange={() => setWeeklyReportOn(v => !v)} />
        </div>

        {/* More settings */}
        <div style={{ ...settingsRowStyle, borderBottom: 'none' }}>
          <span style={{ fontSize: 20 }}>•••</span>
          <span style={settingsLabelStyle}>More settings</span>
          {chevron}
        </div>
      </div>

      {/* ── 7. OTHER SECTION ──────────────────────────────────────────────────── */}
      <div style={{ fontSize: 17, fontWeight: 700, margin: '0 16px 10px' }}>
        Other
      </div>
      <div style={{
        background: T.card, borderRadius: 16,
        margin: '0 16px 16px', overflow: 'hidden',
      }}>
        {/* Help & Support */}
        <div style={settingsRowStyle}>
          <span style={{ fontSize: 20 }}>❓</span>
          <span style={settingsLabelStyle}>Help &amp; Support</span>
          {chevron}
        </div>

        {/* Export data */}
        <div
          style={{ ...settingsRowStyle, cursor: 'pointer' }}
          onClick={onShowExport}
        >
          <span style={{ fontSize: 20 }}>📦</span>
          <span style={settingsLabelStyle}>Export data</span>
          {chevron}
        </div>

        {/* Achievements */}
        <div
          style={{ ...settingsRowStyle, cursor: 'pointer' }}
          onClick={() => setShowAchievements(true)}
        >
          <span style={{ fontSize: 20 }}>🏆</span>
          <span style={settingsLabelStyle}>Achievements</span>
          {chevron}
        </div>

        {/* Weekly Review */}
        <div style={settingsRowStyle}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span style={settingsLabelStyle}>Weekly Review</span>
          {chevron}
        </div>

        {/* Delete account */}
        <div
          style={{ ...settingsRowStyle, borderBottom: 'none', cursor: 'pointer' }}
          onClick={onDeleteAccount}
        >
          <span style={{ fontSize: 20 }}>🗑️</span>
          <span style={{ ...settingsLabelStyle, color: '#FF4444' }}>Delete account</span>
        </div>
      </div>

      {/* ── 8. SIGN OUT ───────────────────────────────────────────────────────── */}
      {currentUser && (
        <div style={{ textAlign: 'center', margin: '8px 16px 24px' }}>
          <button
            onClick={onSignOut}
            style={{
              width: '100%', padding: 13,
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 12, background: 'none',
              color: T.muted, fontSize: 15, cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      )}

      {/* ── 9. ACHIEVEMENTS MODAL ─────────────────────────────────────────────── */}
      {showAchievements && (
        <div style={{
          position: 'fixed', inset: 0,
          background: '#000',
          zIndex: 500,
          overflowY: 'auto',
        }}>
          {/* Sticky header */}
          <div style={{
            position: 'sticky', top: 0,
            background: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 10,
            padding: '16px 20px 0',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 14,
            }}>
              <button
                onClick={() => setShowAchievements(false)}
                style={{
                  background: 'none', border: 'none',
                  color: '#FFFFFF', fontSize: 15, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, padding: 0,
                }}
              >
                ← back
              </button>
              <span style={{ fontSize: 18, fontWeight: 700 }}>Achievements</span>
              <span style={{ fontSize: 14, color: T.muted }}>
                {unlockedCount} / {ACHIEVEMENTS.length}
              </span>
            </div>

            {/* Category filter pills */}
            <div style={{
              display: 'flex', gap: 8,
              overflowX: 'auto', paddingBottom: 14,
              scrollbarWidth: 'none',
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setAchievementCategory(cat)}
                  style={{
                    padding: '7px 16px', borderRadius: 20, fontSize: 13,
                    fontWeight: 600, cursor: 'pointer', flexShrink: 0,
                    border: 'none',
                    background: achievementCategory === cat ? '#FFFFFF' : T.inner,
                    color: achievementCategory === cat ? '#000000' : T.muted,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Achievement grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 12, padding: 16,
          }}>
            {filteredAchievements.map(a => (
              <div
                key={a.id}
                style={{
                  background: a.unlocked ? 'rgba(255,255,255,0.12)' : T.card,
                  borderRadius: 16, padding: 16,
                  textAlign: 'center',
                  border: a.unlocked
                    ? '1px solid rgba(255,255,255,0.2)'
                    : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {a.unlocked ? (
                  <>
                    <div style={{
                      fontSize: 36, marginBottom: 8,
                      textShadow: '0 0 16px rgba(255,255,255,0.49)',
                    }}>
                      {a.icon}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: T.text, marginBottom: 4,
                    }}>
                      {a.name}
                    </div>
                    <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>
                      {a.date}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(255,255,255,0.15)', color: '#FFFFFF',
                      fontSize: 11, fontWeight: 700,
                      padding: '3px 10px', borderRadius: 20,
                    }}>
                      +{a.xp} XP
                    </span>
                  </>
                ) : (
                  <>
                    <div style={{
                      fontSize: 36, marginBottom: 8,
                      filter: 'grayscale(1) opacity(0.3)',
                    }}>
                      {a.icon}
                    </div>
                    <div style={{ fontSize: 13, color: T.muted, marginBottom: 8 }}>
                      ???
                    </div>
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: T.muted,
                      fontSize: 11,
                      padding: '3px 10px', borderRadius: 20,
                    }}>
                      Locked
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
