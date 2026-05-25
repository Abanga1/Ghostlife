import React, { useState } from 'react'

const STAGES = [
  { value: 'Stage 1 — The Fade', label: 'Stage 1 — The Fade' },
  { value: 'Stage 2 — The Mask', label: 'Stage 2 — The Mask' },
  { value: 'Stage 3 — The Shell', label: 'Stage 3 — The Shell' },
  { value: 'Stage 4 — The Hollow', label: 'Stage 4 — The Hollow' },
  { value: 'Stage 5 — The Return', label: 'Stage 5 — The Return' },
]

export default function CoachPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')

  const [clientName, setClientName] = useState('')
  const [stage, setStage] = useState('')
  const [situation, setSituation] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function handleAuth(e) {
    e.preventDefault()
    if (password.trim()) {
      setAuthed(true)
      setAuthError('')
      sessionStorage.setItem('coach_pw', password.trim())
    } else {
      setAuthError('Enter the password.')
    }
  }

  async function handleGenerate(e) {
    e.preventDefault()
    if (!stage || !situation.trim()) return
    setLoading(true)
    setResult('')
    setError('')
    setCopied(false)

    const storedPw = sessionStorage.getItem('coach_pw') || password

    try {
      const res = await fetch('/api/coaching', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-coach-password': storedPw,
        },
        body: JSON.stringify({ clientName, stage, situation, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data.coaching)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setClientName('')
    setStage('')
    setSituation('')
    setNotes('')
    setResult('')
    setError('')
  }

  if (!authed) {
    return (
      <div style={styles.gate}>
        <div style={styles.gateBox}>
          <p style={styles.gateLabel}>GHOST LIFE COACHING</p>
          <h1 style={styles.gateTitle}>Coach Dashboard</h1>
          <form onSubmit={handleAuth} style={styles.gateForm}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              autoFocus
            />
            {authError && <p style={styles.errorText}>{authError}</p>}
            <button type="submit" style={styles.btnPrimary}>Enter</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <p style={styles.label}>GHOST LIFE COACHING</p>
          <h1 style={styles.title}>Generate Coaching</h1>
        </div>

        <div style={styles.layout}>
          <form onSubmit={handleGenerate} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Client Name (optional)</label>
              <input
                type="text"
                placeholder="e.g. Sarah"
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.fieldLabel}>Stage *</label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value)}
                style={styles.input}
                required
              >
                <option value="">Select a stage…</option>
                {STAGES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.fieldLabel}>What they are experiencing *</label>
              <textarea
                placeholder="Describe what the client is going through — their words, their situation, the patterns you've noticed…"
                value={situation}
                onChange={e => setSituation(e.target.value)}
                style={{ ...styles.input, ...styles.textarea }}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.fieldLabel}>Additional notes</label>
              <textarea
                placeholder="Any context, history, or specific things to address or avoid…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ ...styles.input, ...styles.textarea, minHeight: 80 }}
              />
            </div>

            <div style={styles.formActions}>
              <button type="submit" style={styles.btnPrimary} disabled={loading}>
                {loading ? 'Generating…' : 'Generate Coaching'}
              </button>
              {result && (
                <button type="button" onClick={handleReset} style={styles.btnOutline}>
                  New Client
                </button>
              )}
            </div>

            {error && <p style={styles.errorText}>{error}</p>}
          </form>

          <div style={styles.output}>
            {loading && (
              <div style={styles.outputPlaceholder}>
                <p style={styles.outputMuted}>Writing coaching…</p>
              </div>
            )}
            {!loading && !result && (
              <div style={styles.outputPlaceholder}>
                <p style={styles.outputMuted}>The coaching will appear here.</p>
              </div>
            )}
            {result && (
              <div style={styles.resultBox}>
                <div style={styles.resultHeader}>
                  <span style={styles.resultLabel}>
                    {clientName ? `Coaching for ${clientName}` : 'Generated Coaching'}
                  </span>
                  <button onClick={handleCopy} style={styles.copyBtn}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div style={styles.resultBody}>
                  {result.split('\n').map((line, i) =>
                    line.trim() ? <p key={i} style={styles.resultPara}>{line}</p> : <br key={i} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  gate: {
    minHeight: '100vh',
    background: '#141414',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  gateBox: {
    background: '#1e1e1e',
    padding: '52px 48px',
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
  },
  gateLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.25em',
    color: '#C8A96E',
    marginBottom: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  gateTitle: {
    fontFamily: 'Playfair Display, Georgia, serif',
    fontSize: 32,
    color: '#F5EFE0',
    marginBottom: 32,
    fontWeight: 700,
  },
  gateForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  page: {
    minHeight: '100vh',
    background: '#F5EFE0',
    padding: '48px 24px',
  },
  container: {
    maxWidth: 1100,
    margin: '0 auto',
  },
  header: {
    marginBottom: 40,
  },
  label: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.25em',
    color: '#C8A96E',
    marginBottom: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  title: {
    fontFamily: 'Playfair Display, Georgia, serif',
    fontSize: 42,
    fontWeight: 700,
    color: '#141414',
    letterSpacing: '-0.02em',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 32,
    alignItems: 'start',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#4A3728',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  input: {
    padding: '12px 16px',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 15,
    border: '1.5px solid rgba(26,26,26,0.2)',
    borderRadius: 2,
    background: '#fff',
    color: '#141414',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  textarea: {
    minHeight: 140,
    resize: 'vertical',
    lineHeight: 1.6,
  },
  formActions: {
    display: 'flex',
    gap: 12,
  },
  btnPrimary: {
    padding: '14px 32px',
    background: '#7B1C1C',
    color: '#F5EFE0',
    border: 'none',
    borderRadius: 2,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  btnOutline: {
    padding: '14px 32px',
    background: 'transparent',
    color: '#7B1C1C',
    border: '1.5px solid #7B1C1C',
    borderRadius: 2,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: 13,
    color: '#7B1C1C',
    fontWeight: 500,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  output: {
    position: 'sticky',
    top: 24,
  },
  outputPlaceholder: {
    background: '#EDE8DA',
    padding: '48px 32px',
    minHeight: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outputMuted: {
    fontSize: 14,
    color: '#4A3728',
    opacity: 0.5,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  resultBox: {
    background: '#fff',
    border: '1.5px solid rgba(26,26,26,0.12)',
  },
  resultHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid rgba(26,26,26,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#4A3728',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  copyBtn: {
    padding: '6px 16px',
    background: '#7B1C1C',
    color: '#F5EFE0',
    border: 'none',
    borderRadius: 2,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    letterSpacing: '0.06em',
  },
  resultBody: {
    padding: '28px 24px',
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  resultPara: {
    fontSize: 15,
    lineHeight: 1.75,
    color: '#141414',
    marginBottom: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
}
