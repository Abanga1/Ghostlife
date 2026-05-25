import { supabase } from './_supabase.js'

const SYSTEM_PROMPT = `You are a coaching assistant for Ghost Life Syndrome — a framework created by Isaac for people who are living but not feeling alive.

THE FRAMEWORK — Five stages of emotional disconnection:
Stage 1 — The Fade: Growing gap between outer life and inner experience. Things feel slightly muted.
Stage 2 — The Mask: Skilled at performing their life. The gap between appearance and emptiness has become the default.
Stage 3 — The Shell: Operating almost entirely on autopilot. Genuine emotional response is rare.
Stage 4 — The Hollow: Deep prolonged disconnection. Forgotten what full feels like. Quiet dread.
Stage 5 — The Return: Something has cracked open. Beginning to feel again, looking for a map forward.

COACHING PHILOSOPHY:
- Do not offer generic advice
- The path back is specific to the stage
- Small, honest re-entries beat dramatic overhauls
- Naming what is happening precisely is itself movement
- Warm but direct, no fluff, no cheerleading

YOUR ROLE:
Write a follow-up coaching email for a client Isaac is working with. This is session {SESSION_NUMBER}.

You will be given:
- The client's diagnosed stage
- A summary of their previous sessions
- Any recent words or notes from the client

The email should:
- Open by referencing something specific from the previous session
- Deepen the work — don't repeat what was already said
- Offer one new observation or reframe appropriate to their stage and progress
- Give one small, specific action for this week
- End with a question that invites them to reflect and respond
- Length: 350-500 words
- Written as if from Isaac directly to the client`

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end()

  const db = supabase()
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'no anthropic key' })

  const now = new Date().toISOString()

  // Find active clients whose next session is due
  const { data: clients, error } = await db
    .from('clients')
    .select(`*, coaching_sessions(id, session_number, coaching, diagnosis, client_words, status, created_at)`)
    .eq('active', true)
    .lte('next_session_due', now)

  if (error) return res.status(500).json({ error: error.message })

  const results = { generated: 0, skipped: 0, errors: 0 }

  for (const client of clients) {
    // Skip if there's already an unsent draft
    const hasDraft = client.coaching_sessions?.some(s => s.status === 'draft')
    if (hasDraft) { results.skipped++; continue }

    const sessions = (client.coaching_sessions || [])
      .filter(s => s.status === 'sent')
      .sort((a, b) => a.session_number - b.session_number)

    const sessionNumber = sessions.length + 1
    const lastSession = sessions[sessions.length - 1]

    const previousSummary = sessions.map(s =>
      `Session ${s.session_number}: ${s.coaching.slice(0, 300)}...`
    ).join('\n\n')

    const prompt = `Client name: ${client.name}
Diagnosed stage: ${client.stage || 'Unknown'}
Total sessions so far: ${sessions.length}

Previous sessions summary:
${previousSummary || 'This is the first follow-up.'}

Last session coaching excerpt:
${lastSession?.coaching?.slice(0, 500) || 'No previous session.'}

Additional notes: ${client.notes || 'none'}`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-7',
          max_tokens: 1024,
          system: SYSTEM_PROMPT.replace('{SESSION_NUMBER}', sessionNumber),
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      const data = await response.json()
      const coaching = data.content?.[0]?.text || ''
      if (!coaching) { results.errors++; continue }

      await db.from('coaching_sessions').insert({
        client_id: client.id,
        coaching,
        session_number: sessionNumber,
        status: 'draft',
      })

      results.generated++
    } catch {
      results.errors++
    }
  }

  return res.status(200).json({ ok: true, ...results, clientsChecked: clients.length })
}
