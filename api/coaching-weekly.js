// Weekly coaching digest — runs every Monday at 9am via Vercel cron
// Emails Isaac a list of every active client, categorised by urgency.

import { supabase } from './_supabase.js'

function daysSince(iso) {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  const brevoKey = process.env.BREVO_API_KEY
  if (!brevoKey) return res.status(500).json({ error: 'no brevo key' })

  const db = supabase()

  const { data: clients, error } = await db
    .from('clients')
    .select(`*, coaching_sessions(id, status, created_at, session_number)`)
    .eq('type', 'coaching')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  if (!clients.length) return res.status(200).json({ ok: true, message: 'No active clients' })

  const needsResponse = []  // client submitted, waiting on Isaac
  const reachOut = []       // no recent activity, Isaac should initiate
  const onTrack = []        // recently active

  for (const client of clients) {
    const sessions = client.coaching_sessions || []
    const pending = sessions.find(s => s.status === 'client_submitted')
    const sentSessions = sessions.filter(s => s.status === 'sent').sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const lastSent = sentSessions[0]?.created_at
    const days = daysSince(lastSent)

    const row = { name: client.name, stage: client.stage || 'undiagnosed', sessions: sentSessions.length, days, pending }

    if (pending) {
      needsResponse.push({ ...row, pendingDays: daysSince(pending.created_at) })
    } else if (days === null || days > 10) {
      reachOut.push(row)
    } else {
      onTrack.push(row)
    }
  }

  function clientLine(r) {
    const sessionBadge = r.sessions === 0 ? 'no sessions yet' : `${r.sessions} session${r.sessions !== 1 ? 's' : ''} sent`
    const lastLine = r.days === null ? 'never contacted' : r.days === 0 ? 'last session today' : `last session ${r.days} day${r.days !== 1 ? 's' : ''} ago`
    const pendingLine = r.pending ? ` · <strong>submitted ${r.pendingDays}d ago</strong>` : ''
    return `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:15px;font-weight:600;font-family:Georgia,serif">${r.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:13px;color:#888">${r.stage}</td>
      <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:13px;color:#555">${sessionBadge} · ${lastLine}${pendingLine}</td>
    </tr>`
  }

  function section(title, color, items, emptyMsg) {
    if (!items.length) return `<p style="font-size:13px;color:#aaa;margin-bottom:32px">${emptyMsg}</p>`
    return `<table style="width:100%;border-collapse:collapse;margin-bottom:32px">
      <tr><td colspan="3" style="padding-bottom:8px">
        <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:${color};font-weight:700;margin:0">${title}</p>
      </td></tr>
      ${items.map(clientLine).join('')}
    </table>`
  }

  const weekStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const totalClients = clients.length

  const html = `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#141414;line-height:1.8">
    <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C8A96E;margin-bottom:32px">Ghost Life Coaching</p>
    <h2 style="font-size:26px;font-weight:700;margin-bottom:4px">Weekly coaching check.</h2>
    <p style="font-size:13px;color:#888;margin-bottom:40px">${weekStr} · ${totalClients} active client${totalClients !== 1 ? 's' : ''}</p>

    ${section('Needs your response', '#C0392B', needsResponse, 'No pending responses.')}
    ${section('Reach out — gone quiet', '#C8A96E', reachOut, 'No one has gone quiet.')}
    ${section('On track', '#4A3728', onTrack, 'No active sessions yet.')}

    <a href="https://ghostlifesyndrome.com/coach" style="display:inline-block;padding:14px 32px;background:#7B1C1C;color:#F5EFE0;text-decoration:none;font-family:Inter,system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-top:8px">Open Dashboard →</a>

    <p style="font-size:13px;color:#aaa;margin-top:40px;padding-top:24px;border-top:1px solid #eee">
      Ghost Life Syndrome · Sent every Monday at 9am
    </p>
  </div>`

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': brevoKey, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Ghost Life Portal', email: 'isaac@ghostlifesyndrome.com' },
      to: [{ email: 'isaac@ghostlifesyndrome.com', name: 'Isaac' }],
      subject: `Coaching check — ${weekStr}`,
      htmlContent: html,
    }),
  })

  return res.status(200).json({ ok: true, needsResponse: needsResponse.length, reachOut: reachOut.length, onTrack: onTrack.length })
}
