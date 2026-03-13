// ─────────────────────────────────────────────────────────────────────────────
// Supabase — Real Auth + Cloud Sync
//
// SETUP (3 steps):
//  1. Create a free project at https://supabase.com
//  2. Create a .env file in the project root:
//       REACT_APP_SUPABASE_URL=https://xxxx.supabase.co
//       REACT_APP_SUPABASE_ANON_KEY=eyJhbGc...
//  3. Run this SQL in the Supabase SQL editor:
//
//  create table if not exists user_data (
//    user_id uuid primary key references auth.users on delete cascade,
//    habits jsonb not null default '[]',
//    completions jsonb not null default '{}',
//    notes jsonb not null default '{}',
//    moods jsonb not null default '{}',
//    water jsonb not null default '{}',
//    sleep_data jsonb not null default '{}',
//    gratitude jsonb not null default '{}',
//    goals jsonb not null default '[]',
//    challenges jsonb not null default '[]',
//    archived_habits jsonb not null default '[]',
//    shields integer not null default 0,
//    milestones jsonb not null default '[]',
//    achievements jsonb not null default '{}',
//    weekly_reviews jsonb not null default '{}',
//    intentions jsonb not null default '{}',
//    updated_at timestamptz not null default now()
//  );
//  alter table user_data enable row level security;
//  create policy "own data only" on user_data for all using (auth.uid() = user_id);
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isConfigured = () => !!(SUPABASE_URL && SUPABASE_KEY);

let _client = null;
export function getClient() {
  if (_client) return _client;
  if (!isConfigured()) return null;
  _client = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _client;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function supabaseSignUp(email, password, name) {
  const sb = getClient();
  if (!sb) throw new Error('Supabase not configured');
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return normaliseUser(data.user);
}

export async function supabaseSignIn(email, password) {
  const sb = getClient();
  if (!sb) throw new Error('Supabase not configured');
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return normaliseUser(data.user);
}

export async function supabaseSignOut() {
  const sb = getClient();
  if (!sb) return;
  await sb.auth.signOut();
}

export async function getSupabaseSession() {
  const sb = getClient();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session ? normaliseUser(data.session.user) : null;
}

export function normaliseUser(user) {
  if (!user) return null;
  return {
    id:    user.id,
    email: user.email,
    name:  user.user_metadata?.name || user.email.split('@')[0],
  };
}

// ── Sync ─────────────────────────────────────────────────────────────────────

export async function syncUp(userId, payload) {
  const sb = getClient();
  if (!sb || !userId) return;
  try {
    const { error } = await sb.from('user_data').upsert(
      { user_id: userId, ...payload, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
    if (error) console.error('[Ritual] syncUp error:', error.message);
  } catch (e) {
    console.error('[Ritual] syncUp exception:', e);
  }
}

export async function syncDown(userId) {
  const sb = getClient();
  if (!sb || !userId) return null;
  try {
    const { data, error } = await sb
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') {
      console.error('[Ritual] syncDown error:', error.message);
      return null;
    }
    return data || null;
  } catch (e) {
    console.error('[Ritual] syncDown exception:', e);
    return null;
  }
}

// ── Real-time subscriptions ───────────────────────────────────────────────────

export function subscribeToSync(userId, onUpdate) {
  const sb = getClient();
  if (!sb || !userId) return null;
  const channel = sb
    .channel(`user_data_${userId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'user_data', filter: `user_id=eq.${userId}` },
      (payload) => { if (payload.new) onUpdate(payload.new); }
    )
    .subscribe();
  return channel;
}

export function unsubscribeFromSync(channel) {
  const sb = getClient();
  if (!sb || !channel) return;
  sb.removeChannel(channel);
}
