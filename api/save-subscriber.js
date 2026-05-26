import { supabase } from './_supabase.js'
import { rateLimit, truncate } from './_security.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (rateLimit(req, 'subscribe', { max: 5, windowMs: 60 * 60 * 1000 }))
    return res.status(429).json({ error: 'Too many requests.' })

  const { email, name } = req.body || {}
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'email required' })
  if (email.length > 254) return res.status(400).json({ error: 'invalid email' })

  const db = supabase()

  const { data: existing } = await db
    .from('clients')
    .select('id, type')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (existing?.type === 'coaching') {
    return res.status(200).json({ ok: true, skipped: true })
  }

  const { error } = await db
    .from('clients')
    .upsert({
      email: truncate(email.toLowerCase().trim(), 'email'),
      name: truncate(name || email.split('@')[0], 'name'),
      type: 'subscriber',
      source: 'email_capture',
      active: false,
    }, { onConflict: 'email' })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
