export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, name, stage, score } = req.body || {}
  if (!email) return res.status(400).json({ error: 'email required' })

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'no api key' })

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: name || '',
          STAGE: stage || '',
          SCORE: score || 0,
          DRIP_JOINED_AT: new Date().toISOString(),
          DRIP_SENT_COUNT: 0,
        },
        listIds: [3],
        updateEnabled: true,
      }),
    })

    const data = await response.json().catch(() => ({}))

    // Send welcome email (template 1) immediately and mark 1 sent
    const emailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Isaac', email: 'isaac@ghostlifesyndrome.com' },
        to: [{ email, name: name || '' }],
        templateId: 1,
      }),
    })
    const emailData = await emailRes.json().catch(() => ({}))

    await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'PUT',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ attributes: { DRIP_SENT_COUNT: 1 } }),
    })

    return res.status(200).json({ ok: true, emailStatus: emailRes.status, emailData, contactStatus: response.status })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
