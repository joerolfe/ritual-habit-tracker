import { getLongestStreak, getOverallStreak } from './streaks';

// ─── Per-habit streak badges ───────────────────────────────────────────────
export const STREAK_BADGES = [
  { id: '7day',   label: '7-Day Streak',  icon: '🥉', desc: 'Keep a habit going 7 days in a row',   req: 7 },
  { id: '30day',  label: '30-Day Streak', icon: '🥈', desc: 'Keep a habit going 30 days in a row',  req: 30 },
  { id: '100day', label: 'Century',       icon: '🥇', desc: 'Keep a habit going 100 days in a row', req: 100 },
  { id: '365day', label: 'Year Legend',   icon: '👑', desc: 'Keep a habit going 365 days in a row', req: 365 },
];

// ─── Global badges ──────────────────────────────────────────────────────────
export const GLOBAL_BADGES = [
  { id: 'first_step',    label: 'First Step',    icon: '🌱', desc: 'Complete your first habit' },
  { id: 'perfect_week',  label: 'Perfect Week',  icon: '⭐', desc: 'Complete all habits 7 days in a row' },
  { id: 'perfect_month', label: 'Iron Month',    icon: '🔱', desc: 'Complete all habits 30 days in a row' },
  { id: 'century',       label: 'Century Club',  icon: '💯', desc: '100 total habit completions' },
  { id: 'legend',        label: 'Legend',        icon: '🏆', desc: '1000 total habit completions' },
];

// ─── Level table ────────────────────────────────────────────────────────────
const LEVELS = [
  { level: 1,  xp: 0,    title: 'Novice' },
  { level: 2,  xp: 10,   title: 'Apprentice' },
  { level: 3,  xp: 25,   title: 'Consistent' },
  { level: 4,  xp: 50,   title: 'Committed' },
  { level: 5,  xp: 100,  title: 'Dedicated' },
  { level: 6,  xp: 200,  title: 'Disciplined' },
  { level: 7,  xp: 350,  title: 'Focused' },
  { level: 8,  xp: 500,  title: 'Elite' },
  { level: 9,  xp: 750,  title: 'Master' },
  { level: 10, xp: 1000, title: 'Legend' },
];

export function getTotalXP(completions) {
  return Object.values(completions).filter(Boolean).length;
}

export function getLevelInfo(completions) {
  const xp = getTotalXP(completions);
  let cur = LEVELS[0], nxt = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      cur = LEVELS[i];
      nxt = LEVELS[i + 1] || null;
      break;
    }
  }
  const progress = nxt
    ? Math.min(100, Math.round(((xp - cur.xp) / (nxt.xp - cur.xp)) * 100))
    : 100;
  return {
    level: cur.level,
    title: cur.title,
    xp,
    curXp: cur.xp,
    nextXp: nxt?.xp ?? null,
    nextTitle: nxt?.title ?? null,
    progress,
  };
}

export function computeAchievements(habits, completions) {
  const result = {};
  const xp = getTotalXP(completions);

  if (xp >= 1)    result['first_step']    = true;
  if (xp >= 100)  result['century']       = true;
  if (xp >= 1000) result['legend']        = true;

  const overall = getOverallStreak(habits, completions);
  if (overall >= 7)  result['perfect_week']  = true;
  if (overall >= 30) result['perfect_month'] = true;

  habits.forEach(h => {
    const longest = getLongestStreak(h.id, completions);
    STREAK_BADGES.forEach(b => {
      if (longest >= b.req) result[`${h.id}_${b.id}`] = true;
    });
  });

  return result;
}

export function getHabitBadges(habitId, achievements) {
  return STREAK_BADGES.filter(b => achievements?.[`${habitId}_${b.id}`]);
}

export function getGlobalBadges(achievements) {
  return GLOBAL_BADGES.filter(b => achievements?.[b.id]);
}
