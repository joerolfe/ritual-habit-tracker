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

export function formatTime(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}
