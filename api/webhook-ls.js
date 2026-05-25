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

  // Also add to Brevo coaching list (list 4 — create this in Brevo)
  const brevoKey = process.env.BREVO_API_KEY
  if (brevoKey) {
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
  }

  return res.status(200).json({ ok: true, client })
}
