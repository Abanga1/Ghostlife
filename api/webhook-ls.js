import crypto from 'crypto'
import { supabase } from './_supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  // Verify Lemon Squeezy signature
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  if (secret) {
    const sig = req.headers['x-signature']
    const raw = JSON.stringify(req.body)
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
    if (sig !== expected) return res.status(401).json({ error: 'Invalid signature' })
  }

  const event = req.headers['x-event-name']
  if (event !== 'order_created') return res.status(200).json({ ok: true, skipped: true })

  const data = req.body?.data
  const attrs = data?.attributes
  if (!attrs) return res.status(400).json({ error: 'No attributes' })

  const email = attrs.user_email || attrs.customer_email
  const name = attrs.user_name || attrs.customer_name || ''
  const productName = attrs.first_order_item?.product_name || ''

  if (!email) return res.status(400).json({ error: 'No email in payload' })

  const db = supabase()

  // Upsert — if they were a subscriber, upgrade to coaching client
  const { data: client, error } = await db
    .from('clients')
    .upsert({
      email,
      name: name || email.split('@')[0],
      type: 'coaching',
      source: 'lemon_squeezy',
      active: true,
      notes: productName ? `Purchased: ${productName}` : '',
    }, { onConflict: 'email' })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  const brevoKey = process.env.BREVO_API_KEY
  if (brevoKey) {
    // Add to Brevo coaching list
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': brevoKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: name.split(' ')[0] || '', TYPE: 'coaching' },
        listIds: [4],
        updateEnabled: true,
      }),
    }).catch(() => {})

    // Onboarding email to the client
    const firstName = name.split(' ')[0] || ''
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': brevoKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Isaac', email: 'isaac@ghostlifesyndrome.com' },
        to: [{ email, name: name || '' }],
        subject: `You're in.`,
        htmlContent: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#141414;line-height:1.85">
          <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C8A96E;margin-bottom:32px">Ghost Life Syndrome</p>
          <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:700;line-height:1.2;margin-bottom:24px">Your coaching has started${firstName ? ', ' + firstName : ''}.</h1>
          <p style="font-size:16px;line-height:1.85;margin-bottom:16px">
            I have your details. Here is exactly what happens next.
          </p>
          <p style="font-size:16px;line-height:1.85;margin-bottom:16px">
            You have a private portal where your coaching happens. Go there now, enter your email address, and write to me — what is going on for you right now, in your own words, without filtering it.
          </p>
          <p style="font-size:16px;line-height:1.85;margin-bottom:32px">
            I will read everything you write. Within 48 hours you will receive a detailed written response — what I am seeing, what the pattern is, and what moves next. No calls. No video. Entirely in writing, at your pace.
          </p>
          <a href="https://ghostlifesyndrome.com/portal" style="display:inline-block;padding:16px 40px;background:#7B1C1C;color:#F5EFE0;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:32px">Go to your portal →</a>
          <p style="font-size:14px;line-height:1.75;color:#555;margin-bottom:12px">
            Your portal is private. Only you and I can see what is written there. If you have any questions before your first response arrives, reply to this email.
          </p>
          <p style="font-size:14px;color:#888;margin-top:40px;padding-top:24px;border-top:1px solid #eee">
            Ghost Life Syndrome &nbsp;·&nbsp; <a href="https://ghostlifesyndrome.com" style="color:#888">ghostlifesyndrome.com</a>
          </p>
        </div>`,
      }),
    }).catch(() => {})

    // Notify Isaac immediately
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': brevoKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Ghost Life Portal', email: 'isaac@ghostlifesyndrome.com' },
        to: [{ email: 'isaac@ghostlifesyndrome.com', name: 'Isaac' }],
        subject: `New coaching client — ${name || email}`,
        htmlContent: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#141414;line-height:1.8">
          <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C8A96E;margin-bottom:24px">Ghost Life Coaching</p>
          <h2 style="font-size:26px;font-weight:700;margin-bottom:8px">New client just purchased.</h2>
          <p style="font-size:13px;color:#888;margin-bottom:32px">${productName || 'Coaching'}</p>
          <table style="width:100%;border-collapse:collapse;margin-bottom:32px">
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:12px 0;font-size:13px;color:#888;width:120px">Name</td>
              <td style="padding:12px 0;font-size:15px;font-weight:600">${name || '—'}</td>
            </tr>
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:12px 0;font-size:13px;color:#888">Email</td>
              <td style="padding:12px 0;font-size:15px">${email}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;font-size:13px;color:#888">Product</td>
              <td style="padding:12px 0;font-size:15px">${productName || '—'}</td>
            </tr>
          </table>
          <p style="font-size:14px;color:#555;margin-bottom:32px">Their 7-day trial has started. Reach out within 24 hours to make the first impression count.</p>
          <a href="https://ghostlifesyndrome.com/coach" style="display:inline-block;padding:14px 32px;background:#7B1C1C;color:#F5EFE0;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">Open Dashboard →</a>
        </div>`,
      }),
    }).catch(() => {})
  }

  return res.status(200).json({ ok: true, client })
}
