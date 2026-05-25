import { supabase } from './_supabase.js'

function auth(req) {
  return req.headers['x-coach-password'] === process.env.COACH_PASSWORD
}

export default async function handler(req, res) {
  if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' })

  const db = supabase()

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('clients')
      .select(`*, coaching_sessions(id, status, created_at, session_number)`)
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'POST') {
    const { name, email, stage, notes, source } = req.body || {}
    if (!name || !email) return res.status(400).json({ error: 'name and email required' })
    const { data, error } = await db
      .from('clients')
      .insert({ name, email, stage, notes, source: source || 'manual' })
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json(data)
  }

  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id required' })
    const { data, error } = await db
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  return res.status(405).end()
}
