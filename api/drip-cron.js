// Drip cron — runs daily via Vercel Cron
// Sends the right email template to each contact based on days since quiz signup.
// Schedule: Day 0 → template 1, Day 2 → template 2, ... Day 12 → template 7

const DRIP_SCHEDULE = [
  { day: 0, templateId: 1 },
  { day: 2, templateId: 2 },
  { day: 4, templateId: 3 },
  { day: 6, templateId: 4 },
  { day: 8, templateId: 5 },
  { day: 10, templateId: 6 },
  { day: 12, templateId: 7 },
]

const LIST_ID = 3
const SENDER = { name: 'Isaac', email: 'isaac@ghostlifesyndrome.com' }

function targetsForDays(daysSinceJoin) {
  // How many emails should have been sent by now
  return DRIP_SCHEDULE.filter(s => s.day <= daysSinceJoin).length
}

async function getAllContactsInList(apiKey) {
  const contacts = []
  let offset = 0
  const limit = 500
  while (true) {
    const res = await fetch(
      `https://api.brevo.com/v3/contacts?limit=${limit}&offset=${offset}&listId=${LIST_ID}`,
      { headers: { 'api-key': apiKey, accept: 'application/json' } }
    )
    if (!res.ok) break
    const data = await res.json()
    if (!data.contacts?.length) break
    contacts.push(...data.contacts)
    if (contacts.length >= data.count) break
    offset += limit
  }
  return contacts
}

async function sendTransactional(apiKey, email, name, templateId) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email, name: name || '' }],
      templateId,
    }),
  })
  return res.ok
}

async function updateDripCount(apiKey, email, count) {
  await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ attributes: { DRIP_SENT_COUNT: count } }),
  })
}

export default async function handler(req, res) {
  // Allow GET (Vercel cron) and POST (manual trigger)
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'no api key' })

  const now = Date.now()
  const results = { processed: 0, sent: 0, skipped: 0, errors: 0 }

  try {
    const contacts = await getAllContactsInList(apiKey)

    for (const contact of contacts) {
      const attrs = contact.attributes || {}
      const joinedAt = attrs.DRIP_JOINED_AT
      if (!joinedAt) { results.skipped++; continue }

      const daysSinceJoin = (now - new Date(joinedAt).getTime()) / 86400000
      const shouldHaveSent = targetsForDays(daysSinceJoin)
      const alreadySent = Number(attrs.DRIP_SENT_COUNT) || 0

      if (alreadySent >= shouldHaveSent) { results.skipped++; continue }

      // Send each missing email in order
      let newCount = alreadySent
      for (let i = alreadySent; i < shouldHaveSent && i < DRIP_SCHEDULE.length; i++) {
        const ok = await sendTransactional(apiKey, contact.email, attrs.FIRSTNAME || '', DRIP_SCHEDULE[i].templateId)
        if (ok) { newCount++; results.sent++ }
        else { results.errors++ }
      }

      if (newCount > alreadySent) {
        await updateDripCount(apiKey, contact.email, newCount)
      }
      results.processed++
    }

    return res.status(200).json({ ok: true, ...results, contactsTotal: contacts.length })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
