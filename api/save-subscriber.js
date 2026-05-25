import { supabase } from './_supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, name } = req.body || {}
  if (!email) return res.status(400).json({ error: 'email required' })

  const db = supabase()

  // Only insert if not already a client — don't downgrade a coaching client to subscriber
  const { data: existing } = await db
    .from('clients')
    .select('id, type')
    .eq('email', email)
    .single()

  if (existing?.type === 'coaching') {
    return res.status(200).json({ ok: true, skipped: true })
  }

  const { error } = await db
    .from('clients')
    .upsert({
      email,
      name: name || email.split('@')[0],
      type: 'subscriber',
      source: 'email_capture',
      active: false,
    }, { onConflict: 'email' })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
