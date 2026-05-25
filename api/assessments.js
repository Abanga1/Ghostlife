import { supabase } from './_supabase.js'

export default async function handler(req, res) {
  const password = req.headers['x-coach-password']
  if (password !== process.env.COACH_PASSWORD) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const db = supabase()
    const { data, error } = await db
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'PATCH') {
    // Mark assessment as reviewed
    const { id } = req.query
    const { status } = req.body || {}
    if (!id) return res.status(400).json({ error: 'id required' })
    const db = supabase()
    const { error } = await db
      .from('assessments')
      .update({ status: status || 'reviewed' })
      .eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
