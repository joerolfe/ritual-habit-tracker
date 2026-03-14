import React from 'react';

const TABS = [
  { id: 'today',   label: 'Home',    icon: <HomeIcon /> },
  { id: 'tracker', label: 'Tracker', icon: <TrackerIcon /> },
  { id: 'health',  label: 'Health',  icon: <HealthIcon /> },
  { id: 'journal', label: 'Journal', icon: <JournalIcon /> },
  { id: 'profile', label: 'Profile', icon: <ProfileIcon /> },
];

export default function BottomNav({ view, onSetView }) {
  return (
    <nav className="bnav-pill">
      {TABS.map(tab => {
        const active = view === tab.id;
        return (
          <button
            key={tab.id}
            className={`bnav-pill-btn ${active ? 'active' : ''}`}
            onClick={() => onSetView(tab.id)}
            aria-label={tab.label}
            style={active ? {
              color: '#00BCD4',
              background: 'rgba(0,188,212,0.12)',
              boxShadow: '0 0 12px rgba(0,188,212,0.25)',
            } : { color: '#555555' }}
          >
            <span className="bnav-pill-icon">{tab.icon}</span>
            {active && <span className="bnav-pill-label">{tab.label}</span>}
          </button>
        );
      })}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function TrackerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M8 4v5M16 4v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M7 13h2v2H7zM11 13h2v2h-2zM15 13h2v2h-2zM7 17h2v2H7zM11 17h2v2h-2z" fill="currentColor" opacity="0.6"/>
    </svg>
  );
}
function HealthIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function JournalIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M8 7h8M8 11h8M8 15h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
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
