import { supabase } from './_supabase.js'

function auth(req) {
  return req.headers['x-coach-password'] === process.env.COACH_PASSWORD
}

const SENDER = { name: 'Isaac', email: 'isaac@ghostlifesyndrome.com' }

export default async function handler(req, res) {
  if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' })

  const db = supabase()

  if (req.method === 'GET') {
    const { client_id } = req.query

    // Client history — all sent sessions for a specific client
    if (client_id) {
      const { data, error } = await db
        .from('coaching_sessions')
        .select('*')
        .eq('client_id', client_id)
        .eq('status', 'sent')
        .order('session_number', { ascending: true })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json(data)
    }

    // Default: draft sessions for approval queue
    const { data, error } = await db
      .from('coaching_sessions')
      .select(`*, clients(name, email, stage)`)
      .eq('status', 'draft')
      .order('created_at', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  // Save a new session after generating
  if (req.method === 'POST') {
    const { client_id, client_words, diagnosis, coaching } = req.body || {}
    if (!client_id || !coaching) return res.status(400).json({ error: 'client_id and coaching required' })

    // Get session count for this client
    const { count } = await db
      .from('coaching_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', client_id)

    const { data, error } = await db
      .from('coaching_sessions')
      .insert({
        client_id,
        client_words,
        diagnosis,
        coaching,
        session_number: (count || 0) + 1,
        status: 'draft',
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  // Approve and send a session
  if (req.method === 'PATCH') {
    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id required' })

    const { data: session, error: fetchErr } = await db
      .from('coaching_sessions')
      .select(`*, clients(name, email, stage)`)
      .eq('id', id)
      .single()

    if (fetchErr) return res.status(500).json({ error: fetchErr.message })

    // Send email via Brevo
    const brevoKey = process.env.BREVO_API_KEY
    if (brevoKey) {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': brevoKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: SENDER,
          to: [{ email: session.clients.email, name: session.clients.name }],
          subject: `Your Ghost Life Coaching — Session ${session.session_number}`,
          htmlContent: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#141414;line-height:1.8;">
            ${session.coaching.split('\n').filter(l => l.trim()).map(p => `<p>${p}</p>`).join('')}
            <hr style="border:none;border-top:1px solid #ddd;margin:40px 0;">
            <p style="font-size:13px;color:#888;">Ghost Life Syndrome · <a href="https://ghostlifesyndrome.com">ghostlifesyndrome.com</a></p>
          </div>`,
        }),
      })
    }

    // Mark as sent and update next session due date
    const { data, error } = await db
      .from('coaching_sessions')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    // Set next session due in 7 days
    await db
      .from('clients')
      .update({ next_session_due: new Date(Date.now() + 7 * 86400000).toISOString() })
      .eq('id', session.client_id)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  return res.status(405).end()
}
