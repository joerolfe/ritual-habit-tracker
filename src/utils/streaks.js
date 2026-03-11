// ─── Helpers ─────────────────────────────────────────────────────────────────

function isScheduled(habit, date) {
  if (!habit?.days || habit.days.length === 7) return true;
  return habit.days.includes(date.getDay());
}

// ─── Current streak (consecutive scheduled days ending today) ────────────────
export function getCurrentStreak(habitId, completions, habit = null) {
  let streak = 0;
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = 0; i < 730; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);

    // Skip non-scheduled days (don't break streak, just skip)
    if (!isScheduled(habit, d)) continue;

    const key = `${habitId}|${d.getFullYear()}|${d.getMonth()}|${d.getDate()}`;
    if (completions[key]) {
      streak++;
    } else {
      // If today isn't done yet, don't count but keep checking yesterday
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

// ─── Longest ever streak ─────────────────────────────────────────────────────
export function getLongestStreak(habitId, completions, habit = null) {
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
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);

    // Advance prev by 1 day, skipping non-scheduled days
    let expected = new Date(prev);
    expected.setDate(expected.getDate() + 1);
    while (!isScheduled(habit, expected) && expected < curr) {
      expected.setDate(expected.getDate() + 1);
    }

    if (curr.getTime() === expected.getTime()) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

// ─── Overall streak (all habits complete every scheduled day) ─────────────────
export function getOverallStreak(habits, completions) {
  if (!habits.length) return 0;
  let streak = 0;
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = 0; i < 730; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const y = d.getFullYear(), mo = d.getMonth(), day = d.getDate();

    const scheduled = habits.filter(h => isScheduled(h, d));
    if (!scheduled.length) continue;

    const allDone = scheduled.every(h => !!completions[`${h.id}|${y}|${mo}|${day}`]);
    if (allDone) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// ─── Streak at risk (had a streak yesterday, not done today) ─────────────────
export function isStreakAtRisk(habitId, completions, habit = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If not scheduled today, not at risk
  if (!isScheduled(habit, today)) return false;

  const todayKey = `${habitId}|${today.getFullYear()}|${today.getMonth()}|${today.getDate()}`;
  if (completions[todayKey]) return false; // already done

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yKey = `${habitId}|${yesterday.getFullYear()}|${yesterday.getMonth()}|${yesterday.getDate()}`;
  return !!completions[yKey];
}
