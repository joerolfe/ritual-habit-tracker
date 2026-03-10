/** Returns the current consecutive-day streak for a single habit. */
export function getCurrentStreak(habitId, completions) {
  const today = new Date();
  let streak = 0;
  const d = new Date(today);
  while (true) {
    const key = `${habitId}|${d.getFullYear()}|${d.getMonth()}|${d.getDate()}`;
    if (completions[key]) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

/** Returns the longest ever streak for a single habit. */
export function getLongestStreak(habitId, completions) {
  const dates = new Set();
  Object.keys(completions).forEach(key => {
    if (completions[key] && key.startsWith(`${habitId}|`)) {
      const [, y, mo, day] = key.split('|');
      dates.add(new Date(+y, +mo, +day).getTime());
    }
  });
  if (!dates.size) return 0;
  const sorted = [...dates].sort((a, b) => a - b);
  let longest = 1, current = 1;
  for (let i = 1; i < sorted.length; i++) {
    if ((sorted[i] - sorted[i - 1]) / 86400000 === 1) { current++; longest = Math.max(longest, current); }
    else current = 1;
  }
  return longest;
}

/** Returns the current streak of days where ALL habits were completed. */
export function getOverallStreak(habits, completions) {
  if (!habits.length) return 0;
  const today = new Date();
  let streak = 0;
  const d = new Date(today);
  while (true) {
    const allDone = habits.every(h =>
      !!completions[`${h.id}|${d.getFullYear()}|${d.getMonth()}|${d.getDate()}`]
    );
    if (allDone) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}
