// ─────────────────────────────────────────────────────────────────────────────
// Supabase Cloud Sync  (optional — app works 100% offline without it)
//
// SETUP:
//  1. Create a free project at https://supabase.com
//  2. Add to a .env file in the project root:
//       REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
//       REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
//  3. npm install @supabase/supabase-js
//  4. Run this SQL in the Supabase SQL editor:
//
//  CREATE TABLE habits (
//    id text, user_id text, name text, color text, icon text,
//    days int[], reminder_time text, category text, created_at bigint,
//    PRIMARY KEY (user_id, id)
//  );
//  CREATE TABLE completions (
//    user_id text, habit_id text, year int, month int, day int, note text,
//    PRIMARY KEY (user_id, habit_id, year, month, day)
//  );
//  ALTER TABLE habits      ENABLE ROW LEVEL SECURITY;
//  ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
// ─────────────────────────────────────────────────────────────────────────────

let _client = null;

function getClient() {
  if (_client) return _client;
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const { createClient } = require('@supabase/supabase-js');
    _client = createClient(url, key);
  } catch {
    return null;
  }
  return _client;
}

export const isConfigured = () =>
  !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY);

export async function syncUp(userId, habits, completions, notes) {
  const c = getClient();
  if (!c || !userId) return;
  try {
    await c.from('habits').upsert(
      habits.map(h => ({ ...h, user_id: userId, days: h.days || [0,1,2,3,4,5,6] })),
      { onConflict: 'user_id,id' }
    );
    const rows = Object.entries(completions)
      .filter(([, v]) => v)
      .map(([key]) => {
        const [habit_id, year, month, day] = key.split('|');
        return {
          user_id: userId,
          habit_id,
          year: +year, month: +month, day: +day,
          note: notes?.[key] || null,
        };
      });
    if (rows.length) {
      await c.from('completions').upsert(rows, {
        onConflict: 'user_id,habit_id,year,month,day',
      });
    }
  } catch (e) {
    console.error('[Ritual] Sync error:', e);
  }
}

export async function syncDown(userId) {
  const c = getClient();
  if (!c || !userId) return null;
  try {
    const [{ data: habitsData }, { data: completionsData }] = await Promise.all([
      c.from('habits').select('*').eq('user_id', userId),
      c.from('completions').select('*').eq('user_id', userId),
    ]);
    const completions = {}, notes = {};
    completionsData?.forEach(row => {
      const key = `${row.habit_id}|${row.year}|${row.month}|${row.day}`;
      completions[key] = true;
      if (row.note) notes[key] = row.note;
    });
    return { habits: habitsData || [], completions, notes };
  } catch (e) {
    console.error('[Ritual] Sync error:', e);
    return null;
  }
}
