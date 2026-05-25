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
    // Find the existing COACH_PASSWORD env var ID so we can update it
    const listRes = await fetch(
      `https://api.vercel.com/v9/projects/${projectId}/env`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    )
    const listData = await listRes.json()
    const envVar = listData.envs?.find(e => e.key === 'COACH_PASSWORD')

    if (envVar) {
      // Patch the existing env var in place
      const patchRes = await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/env/${envVar.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ value: newPassword }),
        }
      )
      if (!patchRes.ok) {
        const err = await patchRes.json().catch(() => ({}))
        return res.status(500).json({ error: err.error?.message || 'Failed to update password' })
      }
    } else {
      // Create it fresh
      await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
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
    }

    // Get latest production deployment and redeploy it
    const depsRes = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${projectId}&target=production&limit=1`,
      { headers: { Authorization: `Bearer ${vercelToken}` } }
    )
    const depsData = await depsRes.json()
    const latestId = depsData.deployments?.[0]?.uid

    if (latestId) {
      await fetch(`https://api.vercel.com/v13/deployments?forceNew=1`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ deploymentId: latestId }),
      })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
