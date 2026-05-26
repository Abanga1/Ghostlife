// Shared security utilities for all API routes

// ── Rate limiting ─────────────────────────────────────────────────────────────
const stores = new Map()

export function rateLimit(req, key, { max = 10, windowMs = 60 * 60 * 1000 } = {}) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown'
  const storeKey = `${key}:${ip}`
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
