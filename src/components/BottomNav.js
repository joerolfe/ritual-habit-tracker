import React from 'react';

export default function BottomNav({ view, onSetView, onHabits, onProfile, habitsActive, profileActive }) {
  const items = [
    { id: 'today',    label: 'Today',    icon: <TodayIcon /> },
    { id: 'goals',    label: 'Goals',    icon: <GoalsIcon /> },
    { id: 'insights', label: 'Insights', icon: <InsightsIcon /> },
    { id: 'habits',   label: 'Habits',   icon: <HabitsIcon /> },
    { id: 'profile',  label: 'Profile',  icon: <ProfileIcon /> },
  ];

  const active = (id) => {
    if (id === 'habits')  return habitsActive;
    if (id === 'profile') return profileActive;
    return view === id && !habitsActive && !profileActive;
  };

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button
          key={item.id}
          className={`bottom-nav-btn ${active(item.id) ? 'bnav-active' : ''}`}
          onClick={() => {
            if (item.id === 'habits')  { onHabits?.();  return; }
            if (item.id === 'profile') { onProfile?.(); return; }
            onSetView(item.id);
          }}
        >
          <span className="bnav-icon">{item.icon}</span>
          <span className="bnav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function TodayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function GoalsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.7"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  );
}
function InsightsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2"  y="14" width="4" height="7" rx="1" fill="currentColor" opacity=".45"/>
      <rect x="10" y="9"  width="4" height="12" rx="1" fill="currentColor" opacity=".7"/>
      <rect x="18" y="3"  width="4" height="18" rx="1" fill="currentColor"/>
    </svg>
  );
}
function HabitsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}
