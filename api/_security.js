import { supabase } from './_supabase.js'

// ── In-memory fallback (used when DB is unavailable) ──────────────────────────
const stores = new Map()

function inMemoryRateLimit(storeKey, max, windowMs) {
  const now = Date.now()
  const entry = stores.get(storeKey) || { count: 0, windowStart: now }
  if (now - entry.windowStart > windowMs) {
    stores.set(storeKey, { count: 1, windowStart: now })
    return false
  }
  entry.count++
  stores.set(storeKey, entry)
  return entry.count > max
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Persistent across serverless instances via Supabase; falls back to in-memory.
// Run SUPABASE_SETUP SQL below once before deploying.
export async function rateLimit(req, key, { max = 10, windowMs = 60 * 60 * 1000 } = {}) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown'
  const storeKey = `${key}:${ip}`
  try {
    const db = supabase()
    const { data, error } = await db.rpc('check_rate_limit', {
      p_key: storeKey,
      p_max: max,
      p_window_secs: Math.floor(windowMs / 1000),
    })
    if (error) throw error
    return data // true = blocked
  } catch {
    return inMemoryRateLimit(storeKey, max, windowMs)
  }
}

// ── Input length validation ───────────────────────────────────────────────────
const LIMITS = {
  email: 254,
  name: 200,
  short: 500,
  medium: 2000,
  long: 5000,
}

export function truncate(val, type = 'long') {
  if (typeof val !== 'string') return val
  return val.slice(0, LIMITS[type])
}

export function validateLengths(fields) {
  for (const [val, type] of fields) {
    if (typeof val === 'string' && val.length > LIMITS[type]) return false
  }
  return true
}

// ── HTML escaping (for user content embedded in email HTML strings) ───────────
export function escHtml(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/*
SUPABASE_SETUP — run once in the Supabase SQL editor:

CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION check_rate_limit(p_key text, p_max int, p_window_secs int)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO rate_limits (key, count, window_start)
  VALUES (p_key, 1, now())
  ON CONFLICT (key) DO UPDATE SET
    count = CASE
      WHEN rate_limits.window_start + (p_window_secs || ' seconds')::interval < now()
      THEN 1
      ELSE rate_limits.count + 1
    END,
    window_start = CASE
      WHEN rate_limits.window_start + (p_window_secs || ' seconds')::interval < now()
      THEN now()
      ELSE rate_limits.window_start
    END
  RETURNING rate_limits.count INTO v_count;
  RETURN v_count > p_max;
END;
$$;
*/
