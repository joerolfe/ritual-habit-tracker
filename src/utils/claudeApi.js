// ─────────────────────────────────────────────────────────────────────────────
// Claude AI Coach — uses Anthropic API directly
//
// SETUP:
//  1. Get an API key at https://console.anthropic.com
//  2. Add to .env:  REACT_APP_CLAUDE_API_KEY=sk-ant-...
//
// NOTE: For production apps, proxy API calls through your own backend
//       to keep the API key secret. Direct browser calls are fine for
//       development and personal use.
// ─────────────────────────────────────────────────────────────────────────────

const API_KEY = process.env.REACT_APP_CLAUDE_API_KEY;

export const isAIConfigured = () => !!API_KEY;

export function buildSystemPrompt(userData) {
  const { habits, completions, moods, sleep, water, goals } = userData;

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Calculate some quick stats for context
  const habitNames = habits?.map(h => h.name).join(', ') || 'none';

  // Last 7 days completion rate
  let weekDone = 0, weekTotal = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const sched = habits?.filter(h => !h.days || h.days.includes(d.getDay())) || [];
    weekTotal += sched.length;
    weekDone  += sched.filter(h => completions?.[`${h.id}|${d.getFullYear()}|${d.getMonth()}|${d.getDate()}`]).length;
  }
  const weekPct = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;

  // Recent mood
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const moodScore = moods?.[todayKey]?.score;
  const moodMap   = { 1: 'rough', 2: 'meh', 3: 'okay', 4: 'good', 5: 'great' };

  // Recent sleep
  const recentSleep = sleep?.[todayKey];
  const sleepStr = recentSleep?.duration ? `${recentSleep.duration}h last night` : 'not logged';

  // Goals summary
  const activeGoals = goals?.filter(g => !g.completedAt).map(g => g.title).join(', ') || 'none set';

  return `You are an expert AI wellness coach built into the Ritual habit tracking app. You have access to the user's real data and provide personalised, evidence-based advice.

TODAY: ${dateStr}

USER'S DATA SUMMARY:
- Active habits: ${habitNames || 'none'}
- Last 7 days habit completion: ${weekPct}%
- Today's mood: ${moodScore ? moodMap[moodScore] : 'not logged'}
- Sleep last night: ${sleepStr}
- Active goals: ${activeGoals}
- Water today: ${water?.[todayKey] || 0}/8 glasses

YOUR ROLE:
- Give specific, actionable advice based on their actual data
- Be encouraging but honest — don't sugarcoat poor performance
- Reference their specific habits and goals by name
- Keep responses concise (2-3 paragraphs max unless asked for detail)
- Use a warm, coach-like tone — not robotic or overly formal
- Suggest specific adjustments when you see patterns
- Celebrate wins and milestones
- Never diagnose medical conditions; recommend professional help when appropriate

When asked about sleep, nutrition, exercise or wellbeing, give evidence-based guidance tailored to their logged data.`;
}

export async function sendMessage(messages, systemPrompt) {
  if (!API_KEY) {
    throw new Error('REACT_APP_CLAUDE_API_KEY not set in .env file');
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':        'application/json',
      'x-api-key':           API_KEY,
      'anthropic-version':   '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-6',
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   messages.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content[0]?.text || '';
}

export const QUICK_PROMPTS = [
  "How am I doing this week?",
  "What should I focus on today?",
  "How can I improve my sleep?",
  "Give me a workout recommendation",
  "What nutrition changes should I make?",
  "Help me stay motivated",
  "Analyse my habit patterns",
  "What's my biggest weakness right now?",
];
