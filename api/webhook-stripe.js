import crypto from 'crypto'
import { supabase } from './_supabase.js'
import { escHtml } from './_security.js'

function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')))
  const timestamp = parts['t']
  const signature = parts['v1']
  if (!timestamp || !signature) return false
  const age = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (age > 300) return false // reject webhooks older than 5 minutes
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => (data += chunk))
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const rawBody = await getRawBody(req)
  const sigHeader = req.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (secret) {
    if (!sigHeader || !verifyStripeSignature(rawBody, sigHeader, secret)) {
      return res.status(401).json({ error: 'Invalid signature' })
    }
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ ok: true, skipped: true })
  }

  const session = event.data?.object
  const email = session?.customer_details?.email
  const name = session?.customer_details?.name || ''
  const productType = session?.metadata?.product_type || 'unknown'

  if (!email) return res.status(400).json({ error: 'No email in session' })

  const db = supabase()
  const brevoKey = process.env.BREVO_API_KEY
  const firstName = name.split(' ')[0] || ''

  if (productType === 'mentorship') {
    // Coaching/mentorship purchase — upsert as coaching client
    const { data: client, error } = await db
      .from('clients')
      .upsert({
        email,
        name: name || email.split('@')[0],
        type: 'coaching',
        source: 'stripe',
        active: true,
        notes: 'Purchased: Written Mentorship Programme',
      }, { onConflict: 'email' })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })

    if (brevoKey) {
      // Add to Brevo coaching list
      await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          email,
          attributes: { FIRSTNAME: firstName, TYPE: 'coaching' },
          listIds: [4],
          updateEnabled: true,
        }),
      }).catch(() => {})

      // Onboarding email to client
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'Isaac', email: 'isaac@ghostlifesyndrome.com' },
          to: [{ email, name: name || '' }],
          subject: `You're in.`,
          htmlContent: `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#141414;line-height:1.85">
            <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C8A96E;margin-bottom:32px">Ghost Life Syndrome</p>
            <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:700;line-height:1.2;margin-bottom:24px">Your programme has started${firstName ? ', ' + escHtml(firstName) : ''}.</h1>
            <p style="font-size:16px;line-height:1.85;margin-bottom:16px">I have your details. Here is exactly what happens next.</p>
            <p style="font-size:16px;line-height:1.85;margin-bottom:16px">You have a private portal where your written mentorship happens. Go there now, enter your email address, and write to me — what is going on for you right now, in your own words, without filtering it.</p>
            <p style="font-size:16px;line-height:1.85;margin-bottom:32px">I will read everything you write. Within 48 hours you will receive a detailed written response — what I am seeing, what the pattern is, and what moves next. No calls. No video. Entirely in writing, at your pace.</p>
            <a href="https://ghostlifesyndrome.com/portal" style="display:inline-block;padding:16px 40px;background:#7B1C1C;color:#F5EFE0;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:32px">Go to your portal →</a>
            <p style="font-size:14px;color:#888;margin-top:40px;padding-top:24px;border-top:1px solid #eee">Ghost Life Syndrome &nbsp;·&nbsp; <a href="https://ghostlifesyndrome.com" style="color:#888">ghostlifesyndrome.com</a></p>
          </div>`,
        }),
      }).catch(() => {})

      // Notify Isaac
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'Ghost Life Portal', email: 'isaac@ghostlifesyndrome.com' },
          to: [{ email: 'isaac@ghostlifesyndrome.com', name: 'Isaac' }],
          subject: `New mentorship client — ${escHtml(name || email)}`,
          htmlContent: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#141414;line-height:1.8">
            <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C8A96E;margin-bottom:24px">Ghost Life Coaching</p>
            <h2 style="font-size:26px;font-weight:700;margin-bottom:32px">New client just purchased.</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:32px">
              <tr style="border-bottom:1px solid #eee">
                <td style="padding:12px 0;font-size:13px;color:#888;width:120px">Name</td>
                <td style="padding:12px 0;font-size:15px;font-weight:600">${escHtml(name || '—')}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;font-size:13px;color:#888">Email</td>
                <td style="padding:12px 0;font-size:15px">${escHtml(email)}</td>
              </tr>
            </table>
            <a href="https://ghostlifesyndrome.com/coach" style="display:inline-block;padding:14px 32px;background:#7B1C1C;color:#F5EFE0;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase">Open Dashboard →</a>
          </div>`,
        }),
      }).catch(() => {})
    }

    return res.status(200).json({ ok: true, client })
  }

  if (productType === 'analysis') {
    // Written analysis purchase — upsert as subscriber, notify Isaac
    await db.from('clients').upsert({
      email,
      name: name || email.split('@')[0],
      type: 'subscriber',
      source: 'stripe_analysis',
      active: false,
      notes: 'Purchased: Written Personal Analysis',
    }, { onConflict: 'email' })

    if (brevoKey) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'Isaac', email: 'isaac@ghostlifesyndrome.com' },
          to: [{ email: 'isaac@ghostlifesyndrome.com', name: 'Isaac' }],
          subject: `Written analysis request — ${escHtml(name || email)}`,
          htmlContent: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#141414">
            <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C8A96E;margin-bottom:24px">Ghost Life</p>
            <h2 style="font-size:24px;font-weight:700;margin-bottom:8px">Written analysis purchased.</h2>
            <p style="margin-bottom:8px"><strong>Name:</strong> ${escHtml(name || '—')}</p>
            <p><strong>Email:</strong> ${escHtml(email)}</p>
          </div>`,
        }),
      }).catch(() => {})
    }

    return res.status(200).json({ ok: true })
  }

  if (productType === 'book') {
    // Book purchase — upsert as subscriber
    await db.from('clients').upsert({
      email,
      name: name || email.split('@')[0],
      type: 'subscriber',
      source: 'stripe_book',
      active: false,
    }, { onConflict: 'email' })

    if (brevoKey) {
      // Add to Brevo book-buyers list (list 3)
      await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          email,
          attributes: { FIRSTNAME: firstName },
          listIds: [3],
          updateEnabled: true,
        }),
      }).catch(() => {})
    }

    return res.status(200).json({ ok: true })
  }

  return res.status(200).json({ ok: true, skipped: true })
}
