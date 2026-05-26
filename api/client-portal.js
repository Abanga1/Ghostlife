import { supabase } from './_supabase.js'
import { rateLimit, truncate, escHtml } from './_security.js'

const STAGES = {
  'Stage 1': 'You are still mostly present but something is slowly draining. The gap between your outer life and inner experience is growing.',
  'Stage 2': 'You have become skilled at performing your life. The gap between how you appear and how empty things feel has become your default.',
  'Stage 3': 'You are operating almost entirely on autopilot. Days blur. Relationships feel maintained rather than felt.',
  'Stage 4': 'Deep, prolonged disconnection. You have been running on empty so long you have forgotten what full felt like.',
  'Stage 5': 'Something has cracked open. The disconnection is no longer sustainable. You are beginning to feel again — and looking for a map forward.',
}

function stageDesc(stage) {
  if (!stage) return null
  const key = Object.keys(STAGES).find(k => stage.startsWith(k))
  return key ? STAGES[key] : null
}

export default async function handler(req, res) {
  const db = supabase()

  if (req.method === 'GET') {
    const { email } = req.query
    if (!email) return res.status(400).json({ error: 'email required' })

    const { data: client, error: cErr } = await db
      .from('clients')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('type', 'coaching')
      .single()

    if (cErr || !client) return res.status(404).json({ error: 'not_found' })

    const { data: sessions } = await db
      .from('coaching_sessions')
      .select('*')
      .eq('client_id', client.id)
      .eq('status', 'sent')
      .order('session_number', { ascending: true })

    const { data: pending } = await db
      .from('coaching_sessions')
      .select('id, created_at, client_words')
      .eq('client_id', client.id)
      .eq('status', 'client_submitted')
      .order('created_at', { ascending: false })
      .limit(1)

    return res.status(200).json({
      client,
      sessions: sessions || [],
      hasPending: (pending || []).length > 0,
      pendingWords: pending?.[0]?.client_words || null,
      stageDesc: stageDesc(client.stage),
    })
  }

  if (req.method === 'POST') {
    if (rateLimit(req, 'portal', { max: 10, windowMs: 60 * 60 * 1000 }))
      return res.status(429).json({ error: 'Too many requests.' })

    const { email, words } = req.body || {}
    if (!email || typeof email !== 'string') return res.status(400).json({ error: 'email and words required' })
    if (!words || typeof words !== 'string' || !words.trim()) return res.status(400).json({ error: 'email and words required' })
    if (email.length > 254) return res.status(400).json({ error: 'invalid email' })
    if (words.length > 5000) return res.status(400).json({ error: 'words too long' })

    const { data: client, error: cErr } = await db
      .from('clients')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('type', 'coaching')
      .single()

    if (cErr || !client) return res.status(404).json({ error: 'not_found' })

    // Don't allow duplicate pending check-ins
    const { data: existing } = await db
      .from('coaching_sessions')
      .select('id')
      .eq('client_id', client.id)
      .eq('status', 'client_submitted')
      .limit(1)

    if (existing?.length) return res.status(409).json({ error: 'already_pending' })

    const { count } = await db
      .from('coaching_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client.id)

    await db.from('coaching_sessions').insert({
      client_id: client.id,
      client_words: words.trim(),
      diagnosis: '',
      coaching: '',
      session_number: (count || 0) + 1,
      status: 'client_submitted',
    })

    const brevoKey = process.env.BREVO_API_KEY
    if (brevoKey) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'Ghost Life Portal', email: 'isaac@ghostlifesyndrome.com' },
          to: [{ email: 'isaac@ghostlifesyndrome.com', name: 'Isaac' }],
          subject: `Check-in from ${client.name} — Session ${(count || 0) + 1}`,
          htmlContent: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#141414;line-height:1.8">
            <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C8A96E;margin-bottom:24px">Ghost Life Coaching</p>
            <h2 style="font-size:24px;font-weight:700;margin-bottom:8px">${escHtml(client.name)} wrote in</h2>
            <p style="font-size:13px;color:#888;margin-bottom:32px">${escHtml(client.stage || 'Undiagnosed')} &nbsp;·&nbsp; Session ${(count || 0) + 1} &nbsp;·&nbsp; ${escHtml(client.email)}</p>
            <div style="background:#F5EFE0;padding:28px 32px;border-left:4px solid #7B1C1C;margin-bottom:32px">
              <p style="font-size:16px;line-height:1.85;white-space:pre-wrap;margin:0">${escHtml(words.trim())}</p>
            </div>
            <a href="https://ghostlifesyndrome.com/coach" style="display:inline-block;padding:14px 32px;background:#7B1C1C;color:#F5EFE0;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">Open Dashboard →</a>
          </div>`,
        }),
      }).catch(() => {})
    }

    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
