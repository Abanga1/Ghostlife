export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const currentPw = req.headers['x-coach-password']
  if (currentPw !== process.env.COACH_PASSWORD) {
    return res.status(401).json({ error: 'Current password is incorrect' })
  }

  const { newPassword } = req.body || {}
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' })
  }

  const vercelToken = process.env.VERCEL_PERSONAL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!vercelToken || !projectId) {
    return res.status(500).json({ error: 'Vercel credentials not configured' })
  }

  try {
    // Remove existing COACH_PASSWORD for production
    await fetch(
      `https://api.vercel.com/v10/projects/${projectId}/env?target=production&key=COACH_PASSWORD`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${vercelToken}` },
      }
    )

    // Add new password
    const addRes = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        key: 'COACH_PASSWORD',
        value: newPassword,
        type: 'encrypted',
        target: ['production'],
      }),
    })

    if (!addRes.ok) {
      const err = await addRes.json().catch(() => ({}))
      return res.status(500).json({ error: err.error?.message || 'Failed to update password' })
    }

    // Trigger redeploy
    await fetch(`https://api.vercel.com/v13/deployments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'ghostlife',
        target: 'production',
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
      }),
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
