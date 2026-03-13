import React, { useState, useEffect } from 'react';
import { isRCConfigured, getOfferings, purchasePackage, restorePurchases, checkPremiumStatus } from '../utils/revenuecat';

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
  'Habit templates library',
  'Goals & 30-day challenges',
  'Mood, sleep & gratitude tracking',
  'AI-powered weekly insights',
  'Priority support',
];

// Fallback static plans shown when RevenueCat is not configured
const STATIC_PLANS = [
  { id: 'annual',  label: 'Annual',  price: '$19.99', sub: '$1.67 / month · Save 44%', badge: 'Best Value', featured: true },
  { id: 'monthly', label: 'Monthly', price: '$2.99',  sub: 'Billed monthly',            badge: null,         featured: false },
];

export default function PremiumModal({ onClose, currentUser }) {
  const [selectedPlan,  setSelectedPlan]  = useState('annual');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');
  const [offerings,     setOfferings]     = useState(null);
  const [isPremium,     setIsPremium]     = useState(false);
  const [restoring,     setRestoring]     = useState(false);

  useEffect(() => {
    if (!isRCConfigured()) return;
    checkPremiumStatus().then(setIsPremium);
    getOfferings().then(o => { if (o) setOfferings(o); });
  }, []);

  const handlePurchase = async () => {
    if (!isRCConfigured()) {
      // No RC configured — open App Store / Play Store link or show info
      setError('Payments are configured in the native app. Download from the App Store or Google Play to subscribe.');
      return;
    }

    const pkg = offerings?.availablePackages?.find(p =>
      selectedPlan === 'annual'
        ? p.packageType === 'ANNUAL'
        : p.packageType === 'MONTHLY'
    );

    if (!pkg) { setError('Package not found. Please try again later.'); return; }

    setLoading(true);
    setError('');
    try {
      await purchasePackage(pkg);
      setSuccess('🎉 Welcome to Premium! All features are now unlocked.');
      setIsPremium(true);
    } catch (e) {
      if (!e.message?.includes('cancelled')) {
        setError(e.message || 'Purchase failed. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError('');
    const ok = await restorePurchases();
    setRestoring(false);
    if (ok) { setSuccess('Purchases restored successfully!'); setIsPremium(true); }
    else setError('No purchases found to restore.');
  };

  // Find RC prices if available
  const annualPkg  = offerings?.availablePackages?.find(p => p.packageType === 'ANNUAL');
  const monthlyPkg = offerings?.availablePackages?.find(p => p.packageType === 'MONTHLY');

  const plans = STATIC_PLANS.map(p => ({
    ...p,
    price: p.id === 'annual'  && annualPkg  ? annualPkg.product.priceString
         : p.id === 'monthly' && monthlyPkg ? monthlyPkg.product.priceString
         : p.price,
  }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="premium-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div className="premium-header">
          <span className="premium-crown">👑</span>
          <h2 className="premium-title">Ritual Premium</h2>
          <p className="premium-sub">Everything you need to build an unbreakable routine</p>
        </div>

        {isPremium ? (
          <div className="premium-active-banner">
            ✦ You're on Premium — all features unlocked
          </div>
        ) : (
          <>
            {/* Plan selector */}
            <div className="premium-plans">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  className={`premium-plan ${plan.featured ? 'featured' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.badge && <div className="plan-badge">{plan.badge}</div>}
                  <div className="plan-price">{plan.price}<span>/{plan.id === 'annual' ? 'yr' : 'mo'}</span></div>
                  <div className="plan-period">{plan.sub}</div>
                </button>
              ))}
            </div>

            {/* Feature comparison */}
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

            {error   && <div className="auth-error" style={{ margin: '12px 0 0' }}>{error}</div>}
            {success && <div className="auth-info"  style={{ margin: '12px 0 0' }}>{success}</div>}

            <button
              className={`premium-cta-btn ${loading ? 'loading' : ''}`}
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : 'Start 7-Day Free Trial →'}
            </button>

            <div className="premium-footer-row">
              <p className="premium-disclaimer">Cancel anytime. No payment required for trial.</p>
              <button className="premium-restore-btn" onClick={handleRestore} disabled={restoring}>
                {restoring ? 'Restoring…' : 'Restore purchases'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
