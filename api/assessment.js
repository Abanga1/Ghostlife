import { supabase } from './_supabase.js'
import { rateLimit, truncate, escHtml } from './_security.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  if (rateLimit(req, 'assessment', { max: 5, windowMs: 60 * 60 * 1000 }))
    return res.status(429).json({ error: 'Too many requests.' })

  const { email, name, situation, not_working, tried, wants } = req.body || {}
  if (!email || typeof email !== 'string') return res.status(400).json({ error: 'email required' })
  if (!situation || typeof situation !== 'string') return res.status(400).json({ error: 'situation required' })
  if (email.length > 254) return res.status(400).json({ error: 'invalid email' })
  if (situation.length > 5000) return res.status(400).json({ error: 'situation too long' })

  const db = supabase()

  // Save the assessment
  const { data: assessment, error: aErr } = await db
    .from('assessments')
    .insert({
      email: truncate(email.toLowerCase().trim(), 'email'),
      name: truncate(name || '', 'name'),
      situation: truncate(situation, 'long'),
      not_working: truncate(not_working || '', 'medium'),
      tried: truncate(tried || '', 'medium'),
      wants: truncate(wants || '', 'medium'),
      status: 'new',
    })
    .select()
    .single()

  if (aErr) return res.status(500).json({ error: aErr.message })

  // Also upsert into clients as subscriber (won't downgrade a coaching client)
  const { data: existing } = await db
    .from('clients')
    .select('id, type')
    .eq('email', email)
    .single()

  if (!existing || existing.type !== 'coaching') {
    await db.from('clients').upsert({
      email,
      name: name || email.split('@')[0],
      type: 'subscriber',
      source: 'assessment',
      active: false,
    }, { onConflict: 'email' })
  }

  // Send confirmation email via Brevo if key is set
  const brevoKey = process.env.BREVO_API_KEY
  if (brevoKey && email) {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': brevoKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Ghost Life Syndrome', email: 'isaac@ghostlifesyndrome.com' },
        to: [{ email, name: name || '' }],
        subject: 'Your assessment is with me.',
        htmlContent: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#141414;padding:32px 24px">
<p style="font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:#C8A96E;margin-bottom:24px">Ghost Life Syndrome</p>
<h1 style="font-family:Georgia,serif;font-size:28px;font-weight:700;margin-bottom:20px;line-height:1.2">Your intake is in.</h1>
<p style="font-size:16px;line-height:1.7;margin-bottom:16px">
  I've received your assessment${name ? ', ' + escHtml(name.split(' ')[0]) : ''}.
</p>
<p style="font-size:16px;line-height:1.7;margin-bottom:16px">
  I will read everything you wrote. Within 48 hours you will receive a detailed written response —
  your stage, the specific pattern underneath it, and a clear path forward.
</p>
<p style="font-size:16px;line-height:1.7;margin-bottom:32px">
  No advice you've already heard. No generic framework. Just a clear read of what's actually going on for you.
</p>
<p style="font-size:14px;color:#888">If you have anything to add before I respond, just reply to this email.</p>
</div>`,
      }),
    }).catch(() => {})
  }

  return res.status(200).json({ ok: true, id: assessment.id })
}
