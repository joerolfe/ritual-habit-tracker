// ─────────────────────────────────────────────────────────────────────────────
// RevenueCat — Subscription Management
//
// SETUP:
//  1. Create a free account at https://app.revenuecat.com
//  2. Create a project → add your iOS / Android app
//  3. Set up products in App Store Connect / Google Play Console
//  4. Add to your .env:
//       REACT_APP_REVENUECAT_API_KEY=your_web_billing_key
//  5. Create an Entitlement called "premium" in RevenueCat dashboard
//  6. Attach your Monthly and Annual products to an Offering called "default"
//
// NOTE: Web billing (Stripe-powered) works for PWA/browser.
// For native iOS/Android, replace with @revenuecat/purchases-capacitor.
// ─────────────────────────────────────────────────────────────────────────────

// We use dynamic import so the app works fine if the env var isn't set
let _purchases = null;

async function getSDK() {
  const apiKey = process.env.REACT_APP_REVENUECAT_API_KEY;
  if (!apiKey) return null;
  try {
    const { Purchases } = await import('@revenuecat/purchases-js');
    if (!_purchases) {
      _purchases = Purchases.configure(apiKey);
    }
    return _purchases;
  } catch (e) {
    console.warn('[Ritual] RevenueCat SDK not available:', e.message);
    return null;
  }
}

export const isRCConfigured = () => !!process.env.REACT_APP_REVENUECAT_API_KEY;

export async function getOfferings() {
  const sdk = await getSDK();
  if (!sdk) return null;
  try {
    const offerings = await sdk.getOfferings();
    return offerings?.current || null;
  } catch (e) {
    console.error('[Ritual] getOfferings error:', e);
    return null;
  }
}

export async function purchasePackage(pkg) {
  const sdk = await getSDK();
  if (!sdk) throw new Error('RevenueCat not configured');
  const { customerInfo } = await sdk.purchase({ rcPackage: pkg });
  return customerInfo;
}

export async function checkPremiumStatus() {
  const sdk = await getSDK();
  if (!sdk) return false;
  try {
    const info = await sdk.getCustomerInfo();
    return !!info.entitlements.active['premium'];
  } catch {
    return false;
  }
}

export async function restorePurchases() {
  const sdk = await getSDK();
  if (!sdk) return false;
  try {
    const info = await sdk.restorePurchases();
    return !!info.entitlements.active['premium'];
  } catch (e) {
    console.error('[Ritual] restore error:', e);
    return false;
  }
}
