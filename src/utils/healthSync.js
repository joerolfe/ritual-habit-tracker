// ─────────────────────────────────────────────────────────────────────────────
// Health Platform Sync — Apple Health (HealthKit) & Google Fit
//
// Uses @capacitor-community/health plugin (install when available).
// Falls back gracefully in web/browser environments.
//
// SETUP FOR NATIVE:
//  iOS:  add NSHealthShareUsageDescription + NSHealthUpdateUsageDescription
//        to ios/App/App/Info.plist
//  Android: add permissions to android/app/src/main/AndroidManifest.xml
// ─────────────────────────────────────────────────────────────────────────────

import { Capacitor } from '@capacitor/core';

let _health = null;

async function getHealth() {
  if (_health) return _health;
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const mod = await import('@capacitor-community/health');
    _health = mod.Health;
    return _health;
  } catch {
    return null;
  }
}

export const isHealthAvailable = async () => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const h = await getHealth();
    if (!h) return false;
    const { available } = await h.isAvailable();
    return available;
  } catch {
    return false;
  }
};

export async function requestHealthPermissions() {
  const h = await getHealth();
  if (!h) return false;
  try {
    await h.requestAuthorization({
      read:  ['steps', 'calories', 'distance', 'activity', 'sleep', 'weight', 'heart_rate', 'water'],
      write: ['steps', 'calories', 'water', 'weight', 'activity'],
    });
    return true;
  } catch (e) {
    console.error('[Ritual] Health permission error:', e);
    return false;
  }
}

// ── Read ─────────────────────────────────────────────────────────────────────

export async function readSteps(startDate, endDate) {
  const h = await getHealth();
  if (!h) return null;
  try {
    const { value } = await h.queryAggregated({
      startDate, endDate, dataType: 'steps', bucket: 'day',
    });
    return value || [];
  } catch { return null; }
}

export async function readSleep(startDate, endDate) {
  const h = await getHealth();
  if (!h) return null;
  try {
    const { value } = await h.query({
      startDate, endDate, dataType: 'sleep',
    });
    return value || [];
  } catch { return null; }
}

export async function readWeight(startDate, endDate) {
  const h = await getHealth();
  if (!h) return null;
  try {
    const { value } = await h.query({
      startDate, endDate, dataType: 'weight',
    });
    return value || [];
  } catch { return null; }
}

export async function readHeartRate(startDate, endDate) {
  const h = await getHealth();
  if (!h) return null;
  try {
    const { value } = await h.query({
      startDate, endDate, dataType: 'heart_rate',
    });
    return value || [];
  } catch { return null; }
}

export async function readActiveCalories(startDate, endDate) {
  const h = await getHealth();
  if (!h) return null;
  try {
    const { value } = await h.queryAggregated({
      startDate, endDate, dataType: 'calories', bucket: 'day',
    });
    return value || [];
  } catch { return null; }
}

// ── Write ────────────────────────────────────────────────────────────────────

export async function writeWater(litres, date = new Date()) {
  const h = await getHealth();
  if (!h) return;
  try {
    await h.store({
      startDate: date,
      endDate:   date,
      dataType:  'water',
      value:     litres,
      unit:      'litre',
    });
  } catch (e) { console.error('[Ritual] Write water error:', e); }
}

export async function writeWeight(kg, date = new Date()) {
  const h = await getHealth();
  if (!h) return;
  try {
    await h.store({
      startDate: date,
      endDate:   date,
      dataType:  'weight',
      value:     kg,
      unit:      'kg',
    });
  } catch (e) { console.error('[Ritual] Write weight error:', e); }
}

export async function writeWorkout(workout) {
  const h = await getHealth();
  if (!h) return;
  try {
    await h.store({
      startDate: new Date(workout.startTime),
      endDate:   new Date(workout.endTime),
      dataType:  'activity',
      value:     workout.calories || 0,
      extraData: { activityType: workout.type || 'OTHER', title: workout.name },
    });
  } catch (e) { console.error('[Ritual] Write workout error:', e); }
}

// ── Sync helper (pull last 7 days) ────────────────────────────────────────────

export async function pullLastWeek() {
  const endDate   = new Date();
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [steps, sleep, calories] = await Promise.all([
    readSteps(startDate, endDate),
    readSleep(startDate, endDate),
    readActiveCalories(startDate, endDate),
  ]);
  return { steps, sleep, calories };
}
