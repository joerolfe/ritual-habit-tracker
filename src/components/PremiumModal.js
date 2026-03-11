import React from 'react';

const FREE_FEATURES = [
  'Up to 5 habits',
  'Today, Month & Year views',
  'Basic streak tracking',
  'Daily intention',
  'Local storage (this device)',
];

const PREMIUM_FEATURES = [
  'Unlimited habits',
  'Cloud sync across all devices',
  'Full analytics & 52-week heatmap',
  'Habit scheduling (custom days)',
  'Per-habit reminders & notifications',
  'Streak shields',
  'Achievements & level system',
  'Habit notes & journal',
  'Habit library (templates)',
  'Priority support',
];

export default function PremiumModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="premium-modal" onClick={e => e.stopPropagation()}>
        <div className="premium-header">
          <span className="premium-crown">👑</span>
          <h2 className="premium-title">Ritual Premium</h2>
          <p className="premium-sub">Everything you need to build an unbreakable routine</p>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="premium-plans">
          <div className="premium-plan featured">
            <div className="plan-badge">Best Value</div>
            <div className="plan-price">$19.99<span>/year</span></div>
            <div className="plan-period">$1.67 / month</div>
          </div>
          <div className="premium-plan">
            <div className="plan-price">$2.99<span>/month</span></div>
            <div className="plan-period">Billed monthly</div>
          </div>
        </div>

        <div className="premium-compare">
          <div className="compare-col">
            <div className="compare-header">Free</div>
            {FREE_FEATURES.map(f => (
              <div key={f} className="compare-row free">
                <span className="compare-check">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="compare-col premium-col">
            <div className="compare-header premium-header-label">Premium ✦</div>
            {PREMIUM_FEATURES.map(f => (
              <div key={f} className="compare-row prem">
                <span className="compare-check gold">✦</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="premium-cta-btn">
          Start 7-Day Free Trial →
        </button>
        <p className="premium-disclaimer">Cancel anytime. No payment required for trial.</p>
      </div>
    </div>
  );
}
