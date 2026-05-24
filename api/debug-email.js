export default async function handler(req, res) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'no api key' })

  if (req.method === 'POST' && req.query.action === 'verify-domain') {
    const verifyRes = await fetch('https://api.brevo.com/v3/senders/domains/ghostlifesyndrome.com/authenticate', {
      method: 'PUT',
      headers: { 'api-key': apiKey, accept: 'application/json' },
    })
    const verifyData = await verifyRes.json().catch(() => ({}))
    return res.status(200).json({ status: verifyRes.status, data: verifyData })
  }

  if (req.method === 'GET' && req.query.action === 'domain-records') {
    const domainRes = await fetch('https://api.brevo.com/v3/senders/domains', {
      headers: { 'api-key': apiKey, accept: 'application/json' },
    })
    const domainData = await domainRes.json().catch(() => ({}))
    return res.status(200).json(domainData)
  }

  if (req.method === 'POST' && req.query.action === 'add-sender') {
    const senderRes = await fetch('https://api.brevo.com/v3/senders', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ name: 'Isaac', email: 'isaac@ghostlifesyndrome.com' }),
    })
    const senderData = await senderRes.json().catch(() => ({}))
    return res.status(200).json({ status: senderRes.status, data: senderData })
  }

  if (req.method === 'POST' && req.query.action === 'update-template') {
    const updateRes = await fetch('https://api.brevo.com/v3/smtp/templates/1', {
      method: 'PUT',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: { name: 'Isaac', email: 'isaac@ghostlifesyndrome.com' },
        htmlContent: `<p>Hey {{contact.FIRSTNAME|default:"there"}},</p><p>You just finished the Ghost Life Syndrome quiz. Before I show you what your stage means, here's something that will make it land differently.</p><p><strong>Chapter One — free:</strong><br><a href="https://ghostlifesyndrome.com/chapter-1.pdf">Download it here →</a></p><p>Most people read it and say: <em>I thought I was the only one.</em></p><p>You're not.</p><p>— Isaac</p>`,
      }),
    })
    const updateData = await updateRes.json().catch(() => ({}))
    return res.status(200).json({ status: updateRes.status, data: updateData })
  }

  if (req.query.action === 'template') {
    const id = req.query.id || '1'
    const tplRes = await fetch(`https://api.brevo.com/v3/smtp/templates/${id}`, {
      headers: { 'api-key': apiKey, accept: 'application/json' },
    })
    const tpl = await tplRes.json().catch(() => ({}))
    return res.status(200).json({ subject: tpl.subject, sender: tpl.sender, htmlContent: (tpl.htmlContent || '').slice(0, 2000) })
  }

  if (req.method === 'POST' && req.query.action === 'create-attributes') {
    const results = []
    for (const attr of [
      { name: 'DRIP_JOINED_AT', type: 'date' },
      { name: 'DRIP_SENT_COUNT', type: 'float' },
      { name: 'STAGE', type: 'text' },
      { name: 'SCORE', type: 'float' },
    ]) {
      const r = await fetch(`https://api.brevo.com/v3/contacts/attributes/normal/${attr.name}`, {
        method: 'POST',
        headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ type: attr.type }),
      })
      results.push({ name: attr.name, status: r.status })
    }
    return res.status(200).json(results)
  }

  if (req.method === 'POST' && req.query.action === 'fix-senders') {
    const results = []
    for (let id = 2; id <= 7; id++) {
      const r = await fetch(`https://api.brevo.com/v3/smtp/templates/${id}`, {
        method: 'PUT',
        headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender: { name: 'Isaac', email: 'isaac@ghostlifesyndrome.com' } }),
      })
      results.push({ id, status: r.status })
    }
    return res.status(200).json(results)
  }

  if (req.query.action === 'attributes') {
    const r = await fetch('https://api.brevo.com/v3/contacts/attributes', {
      headers: { 'api-key': apiKey, accept: 'application/json' },
    })
    return res.status(200).json(await r.json().catch(() => ({})))
  }

  if (req.query.action === 'all-templates') {
    const id = req.query.id
    if (id) {
      const r = await fetch(`https://api.brevo.com/v3/smtp/templates/${id}`, {
        headers: { 'api-key': apiKey, accept: 'application/json' },
      })
      const t = await r.json().catch(() => ({}))
      return res.status(200).json({ id, subject: t.subject, sender: t.sender?.email, htmlContent: t.htmlContent || '' })
    }
    const results = []
    for (let i = 1; i <= 7; i++) {
      const r = await fetch(`https://api.brevo.com/v3/smtp/templates/${i}`, {
        headers: { 'api-key': apiKey, accept: 'application/json' },
      })
      const t = await r.json().catch(() => ({}))
      results.push({ id: i, subject: t.subject, sender: t.sender?.email, htmlContent: t.htmlContent || '' })
    }
    return res.status(200).json(results)
  }

  const email = req.query.email || 'isaacabanga0394@gmail.com'
  const eventsRes = await fetch(
    `https://api.brevo.com/v3/smtp/statistics/events?email=${encodeURIComponent(email)}&limit=5`,
    { headers: { 'api-key': apiKey, accept: 'application/json' } }
  )
  const events = await eventsRes.json().catch(() => ({}))
  return res.status(200).json(events)
}
