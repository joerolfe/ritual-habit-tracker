// ─── Browser notification / reminder helpers ────────────────────────────────

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied')  return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

export function getPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

// In-memory map: habitId → timeoutId
const _timers = {};

export function scheduleAllReminders(habits) {
  Object.values(_timers).forEach(id => clearTimeout(id));
  Object.keys(_timers).forEach(k => delete _timers[k]);
  if (getPermission() !== 'granted') return;
  habits.forEach(h => { if (h.reminderTime) _scheduleNext(h); });
}

function _scheduleNext(habit) {
  const [h, m] = habit.reminderTime.split(':').map(Number);
  const now  = new Date();
  const fire = new Date();
  fire.setHours(h, m, 0, 0);
  if (fire <= now) fire.setDate(fire.getDate() + 1);
  const ms = fire - now;

  _timers[habit.id] = setTimeout(() => {
    try {
      const body = habit.currentStreak > 1
        ? `You're on a ${habit.currentStreak}-day streak — don't break it! 🔥`
        : 'Time to build your habit! 💪';
      new Notification(`${habit.icon || '⏰'} ${habit.name}`, {
        body,
        icon: '/logo192.png',
        tag:  `ritual_${habit.id}`,
        renotify: true,
      });
    } catch {}
    _scheduleNext(habit);
  }, ms);
}

export function cancelReminder(habitId) {
  if (_timers[habitId]) {
    clearTimeout(_timers[habitId]);
    delete _timers[habitId];
  }
}

// In-memory timers for streak rescue and morning brief
const _streakTimer = { id: null };
const _briefTimer  = { id: null };

export function scheduleStreakRescue(habits, completions) {
  if (_streakTimer.id) { clearTimeout(_streakTimer.id); _streakTimer.id = null; }
  if (getPermission() !== 'granted') return;

  const now  = new Date();
  const fire = new Date();
  fire.setHours(21, 0, 0, 0);
  if (fire <= now) fire.setDate(fire.getDate() + 1);
  const ms = fire - now;

  _streakTimer.id = setTimeout(() => {
    const today = new Date();
    const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
    const atRisk = habits.filter(h => {
      // Has completions on some previous days (streak > 0) but not today
      const todayKey = `${h.id}|${y}|${m}|${d}`;
      if (completions[todayKey]) return false;
      // Check if had yesterday
      const yesterday = new Date(today);
      yesterday.setDate(d - 1);
      const yy = yesterday.getFullYear(), ym = yesterday.getMonth(), yd = yesterday.getDate();
      return !!completions[`${h.id}|${yy}|${ym}|${yd}`];
    });
    if (atRisk.length > 0) {
      try {
        new Notification('🔥 Don\'t break your streak!', {
          body: `${atRisk.length} habit${atRisk.length !== 1 ? 's' : ''} still need to be done today.`,
          icon: '/logo192.png',
          tag: 'ritual_streak_rescue',
          renotify: true,
        });
      } catch {}
    }
    scheduleStreakRescue(habits, completions);
  }, ms);
}

export function scheduleMorningBrief(habits, briefTime) {
  if (_briefTimer.id) { clearTimeout(_briefTimer.id); _briefTimer.id = null; }
  if (getPermission() !== 'granted') return;

  const time = briefTime || '08:00';
  const [h, min] = time.split(':').map(Number);
  const now  = new Date();
  const fire = new Date();
  fire.setHours(h, min, 0, 0);
  if (fire <= now) fire.setDate(fire.getDate() + 1);
  const ms = fire - now;

  _briefTimer.id = setTimeout(() => {
    const today = new Date();
    const todayHabits = habits.filter(hab => !hab.days || hab.days.length === 7 || hab.days.includes(today.getDay()));
    if (todayHabits.length > 0) {
      try {
        new Notification('☀️ Morning Brief', {
          body: `Today: ${todayHabits.map(h => `${h.icon} ${h.name}`).join(', ')}`,
          icon: '/logo192.png',
          tag: 'ritual_morning_brief',
          renotify: true,
        });
      } catch {}
    }
    scheduleMorningBrief(habits, briefTime);
  }, ms);
}

export function formatTime(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}
