import React from 'react';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 14l2.5 2.5L16 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Daily Tracking',
    desc: 'Log your habits every day with a single tap. Visual progress at a glance.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Streak Building',
    desc: 'Stay consistent and watch your streaks grow day by day.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 17l4-8 4 5 3-3 4 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Deep Analytics',
    desc: 'Monthly heatmaps and yearly overviews reveal patterns in your progress.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Daily Intentions',
    desc: 'Set your focus for the day and finish with a sense of accomplishment.',
  },
];

export default function LandingPage({ onLogin, onSignup }) {
  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">Ritual</div>
        <div className="landing-nav-actions">
          <button className="landing-nav-link" onClick={onLogin}>Sign in</button>
          <button className="landing-nav-cta" onClick={onSignup}>Get started</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-badge">Daily habit tracking, elevated</div>
          <h1 className="landing-h1">
            Build the life<br />
            <span className="landing-h1-accent">you want.</span>
          </h1>
          <p className="landing-sub">
            Ritual helps you track habits, build unbreakable streaks,<br className="landing-br" />
            and stay locked in on your goals — every single day.
          </p>
          <div className="landing-cta-row">
            <button className="landing-btn-primary" onClick={onSignup}>
              Start for free
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 8 }}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="landing-btn-ghost" onClick={onLogin}>Sign in</button>
          </div>
          <p className="landing-note">No account required — try as guest</p>
        </div>

        {/* Mockup card */}
        <div className="landing-mockup">
          <div className="mockup-card">
            <div className="mockup-header">
              <div className="mockup-brand">Ritual</div>
              <div className="mockup-tabs">
                <span className="mockup-tab active">Today</span>
                <span className="mockup-tab">Month</span>
                <span className="mockup-tab">Year</span>
              </div>
            </div>
            <div className="mockup-body">
              <div className="mockup-progress-ring">
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6"/>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#30d158" strokeWidth="6"
                    strokeDasharray="175.9" strokeDashoffset="44"
                    strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                </svg>
                <span className="mockup-ring-label">75%</span>
              </div>
              <div className="mockup-habits">
                {[
                  { name: 'Morning Meditation', done: true,  color: '#6bcb77' },
                  { name: 'Exercise',           done: true,  color: '#ff9f43' },
                  { name: 'Read',               done: true,  color: '#4d96ff' },
                  { name: 'Journaling',         done: false, color: '#c77dff' },
                ].map(h => (
                  <div key={h.name} className={`mockup-habit ${h.done ? 'done' : ''}`}>
                    <span className="mockup-habit-check" style={{ borderColor: h.color, backgroundColor: h.done ? h.color : 'transparent' }}>
                      {h.done && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </span>
                    <span className="mockup-habit-name">{h.name}</span>
                    {h.done && <span className="mockup-streak">🔥3</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow */}
          <div className="mockup-glow" />
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="landing-features-inner">
          <p className="landing-section-eyebrow">Everything you need</p>
          <h2 className="landing-section-h2">Built for consistency</h2>
          <div className="landing-feature-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="landing-feature-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="landing-banner">
        <div className="landing-banner-inner">
          <h2 className="landing-banner-h2">Ready to build better habits?</h2>
          <p className="landing-banner-sub">Join thousands of people who use Ritual to stay consistent.</p>
          <button className="landing-btn-primary" onClick={onSignup}>
            Create your free account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span className="landing-footer-brand">Ritual</span>
        <span className="landing-footer-copy">© {new Date().getFullYear()} Ritual. All rights reserved.</span>
        <div className="landing-footer-links">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </footer>
    </div>
  );
}
