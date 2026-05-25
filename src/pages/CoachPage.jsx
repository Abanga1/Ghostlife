import React, { useState, useEffect, useCallback } from 'react'

// ── helpers ──────────────────────────────────────────────────────────────────
function authHeaders(pw) {
  return { 'content-type': 'application/json', 'x-coach-password': pw }
}

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Gate ─────────────────────────────────────────────────────────────────────
function Gate({ onAuth }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  function submit(e) {
    e.preventDefault()
    if (!pw.trim()) return setErr('Enter your password.')
    sessionStorage.setItem('coach_pw', pw.trim())
    onAuth(pw.trim())
  }
  return (
    <div style={s.gate}>
      <div style={s.gateBox}>
        <p style={s.eyebrow}>GHOST LIFE COACHING</p>
        <h1 style={s.gateTitle}>Coach Dashboard</h1>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="password" placeholder="Password" value={pw}
            onChange={e => setPw(e.target.value)} style={s.input} autoFocus />
          {err && <p style={s.err}>{err}</p>}
          <button type="submit" style={s.btnPrimary}>Enter</button>
        </form>
      </div>
    </div>
  )
}

// ── Generate tab ─────────────────────────────────────────────────────────────
function GenerateTab({ pw, clients, onSessionSaved, prefill, onPrefillConsumed }) {
  const [clientId, setClientId] = useState('')
  const [newName, setNewName] = useState(() => prefill?.name || '')
  const [newEmail, setNewEmail] = useState(() => prefill?.email || '')
  const [clientWords, setClientWords] = useState(() => prefill?.words || '')
  const [notes, setNotes] = useState('')

  // Apply prefill if it arrives after mount (tab switch)
  React.useEffect(() => {
    if (prefill) {
      setIsNew(true)
      setNewName(prefill.name || '')
      setNewEmail(prefill.email || '')
      setClientWords(prefill.words || '')
      onPrefillConsumed?.()
    }
  }, [prefill]) // eslint-disable-line
  const [loading, setLoading] = useState(false)
  const [diagnosis, setDiagnosis] = useState('')
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isNew, setIsNew] = useState(true)

  async function generate(e) {
    e.preventDefault()
    if (!clientWords.trim()) return
    setLoading(true); setResult(''); setDiagnosis(''); setError(''); setCopied(false); setSaved(false)
    try {
      const res = await fetch('/api/coaching', {
        method: 'POST',
        headers: authHeaders(pw),
        body: JSON.stringify({ clientName: isNew ? newName : clients.find(c => c.id === clientId)?.name, clientWords, notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const full = data.coaching || ''
      const diagMatch = full.match(/---DIAGNOSIS---([\s\S]*?)---COACHING---/)
      const coachMatch = full.match(/---COACHING---([\s\S]*)$/)
      setDiagnosis(diagMatch ? diagMatch[1].trim() : '')
      setResult(coachMatch ? coachMatch[1].trim() : full)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function saveSession() {
    setSaving(true)
    try {
      let cid = clientId
      // Create new client if needed
      if (isNew) {
        if (!newName || !newEmail) return setError('Name and email required to save client.')
        const stageMatch = diagnosis.match(/Stage \d[^—\n]*/)
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: authHeaders(pw),
          body: JSON.stringify({ name: newName, email: newEmail, stage: stageMatch?.[0] || '', notes }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        cid = data.id
      }
      await fetch('/api/sessions', {
        method: 'POST',
        headers: authHeaders(pw),
        body: JSON.stringify({ client_id: cid, client_words: clientWords, diagnosis, coaching: result }),
      })
      setSaved(true)
      onSessionSaved()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={s.layout}>
      <form onSubmit={generate} style={s.form}>
        <div style={s.field}>
          <label style={s.label}>Client</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button type="button" onClick={() => setIsNew(true)}
              style={{ ...s.tabBtn, ...(isNew ? s.tabBtnActive : {}) }}>New client</button>
            <button type="button" onClick={() => setIsNew(false)}
              style={{ ...s.tabBtn, ...(!isNew ? s.tabBtnActive : {}) }}>Existing client</button>
          </div>
          {isNew ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} style={s.input} />
              <input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={s.input} />
            </div>
          ) : (
            <select value={clientId} onChange={e => setClientId(e.target.value)} style={s.input}>
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.stage || 'undiagnosed'}</option>)}
            </select>
          )}
        </div>

        <div style={s.field}>
          <label style={s.label}>Client's exact words *</label>
          <textarea placeholder="Paste exactly what the client wrote or said — unedited. The system diagnoses their stage from this."
            value={clientWords} onChange={e => setClientWords(e.target.value)}
            style={{ ...s.input, ...s.textarea, minHeight: 180 }} required />
        </div>

        <div style={s.field}>
          <label style={s.label}>Your notes (optional)</label>
          <textarea placeholder="Context, history, things to address or avoid…"
            value={notes} onChange={e => setNotes(e.target.value)}
            style={{ ...s.input, ...s.textarea, minHeight: 80 }} />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" style={s.btnPrimary} disabled={loading}>
            {loading ? 'Generating…' : 'Generate Coaching'}
          </button>
          {result && !saved && (
            <button type="button" onClick={saveSession} style={s.btnOutline} disabled={saving}>
              {saving ? 'Saving…' : 'Save to Client'}
            </button>
          )}
        </div>
        {error && <p style={s.err}>{error}</p>}
        {saved && <p style={{ color: '#C8A96E', fontSize: 13 }}>Saved to approval queue.</p>}
      </form>

      <div style={s.outputCol}>
        {!loading && !result && (
          <div style={s.placeholder}><p style={s.muted}>Coaching will appear here.</p></div>
        )}
        {loading && <div style={s.placeholder}><p style={s.muted}>Generating…</p></div>}
        {(diagnosis || result) && (
          <div>
            {diagnosis && (
              <div style={s.diagBox}>
                <p style={s.eyebrow}>Stage Diagnosis</p>
                {diagnosis.split('\n').filter(l => l.trim()).map((l, i) =>
                  <p key={i} style={{ fontSize: 14, lineHeight: 1.7, color: '#F5EFE0', marginBottom: 8, fontFamily: 'Inter,system-ui,sans-serif' }}>{l}</p>
                )}
              </div>
            )}
            {result && (
              <div style={s.resultBox}>
                <div style={s.resultHeader}>
                  <span style={s.label}>Generated Coaching</span>
                  <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    style={s.copyBtn}>{copied ? 'Copied!' : 'Copy'}</button>
                </div>
                <div style={s.resultBody}>
                  {result.split('\n').map((l, i) =>
                    l.trim() ? <p key={i} style={s.para}>{l}</p> : <br key={i} />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function ClientRow({ c, isSubscriber }) {
  const sessions = c.coaching_sessions || []
  const sent = sessions.filter(s => s.status === 'sent').length
  const draft = sessions.filter(s => s.status === 'draft').length
  return (
    <div style={s.clientRow}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <p style={{ fontWeight: 700, fontSize: 16, fontFamily: 'Playfair Display,Georgia,serif' }}>{c.name}</p>
          {isSubscriber && <span style={s.badge}>Potential</span>}
        </div>
        <p style={{ fontSize: 13, color: '#4A3728', marginBottom: 2 }}>{c.email}</p>
        <p style={{ fontSize: 12, color: '#C8A96E', fontWeight: 600 }}>{c.stage || (isSubscriber ? 'Not yet diagnosed' : 'Undiagnosed')}</p>
      </div>
      <div style={{ textAlign: 'right', fontSize: 13, color: '#4A3728' }}>
        {!isSubscriber && <p>{sent} session{sent !== 1 ? 's' : ''} sent</p>}
        {draft > 0 && <p style={{ color: '#7B1C1C', fontWeight: 600 }}>{draft} draft pending</p>}
        <p style={{ opacity: 0.5, marginTop: 4 }}>{isSubscriber ? 'Subscribed' : 'Added'} {fmt(c.created_at)}</p>
      </div>
    </div>
  )
}

// ── Clients tab ───────────────────────────────────────────────────────────────
function ClientsTab({ clients, loading }) {
  if (loading) return <p style={s.muted}>Loading…</p>
  if (!clients.length) return <p style={s.muted}>No clients yet. Generate coaching and save to add one.</p>

  const coaching = clients.filter(c => c.type === 'coaching')
  const subscribers = clients.filter(c => c.type === 'subscriber')

  return (
    <div>
      <div style={{ marginBottom: 48 }}>
        <p style={{ ...s.eyebrow, marginBottom: 16 }}>Coaching Clients — {coaching.length}</p>
        {coaching.length === 0
          ? <p style={s.muted}>No coaching clients yet. They appear here when someone pays via Lemon Squeezy.</p>
          : coaching.map(c => <ClientRow key={c.id} c={c} isSubscriber={false} />)
        }
      </div>
      <div>
        <p style={{ ...s.eyebrow, marginBottom: 16 }}>Potential Clients (Subscribers) — {subscribers.length}</p>
        {subscribers.length === 0
          ? <p style={s.muted}>No subscribers logged yet. They appear here when someone submits the email capture form.</p>
          : subscribers.map(c => <ClientRow key={c.id} c={c} isSubscriber={true} />)
        }
      </div>
    </div>
  )
}

// ── Approvals tab ─────────────────────────────────────────────────────────────
function ApprovalsTab({ pw, drafts, onApproved }) {
  const [approving, setApproving] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [error, setError] = useState('')

  async function approve(id) {
    setApproving(id); setError('')
    try {
      const res = await fetch('/api/sessions', {
        method: 'PATCH',
        headers: authHeaders(pw),
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onApproved(id)
    } catch (err) { setError(err.message) }
    finally { setApproving(null) }
  }

  if (!drafts.length) return <p style={s.muted}>No drafts pending approval. The weekly cron generates these automatically every Monday.</p>

  return (
    <div>
      {error && <p style={{ ...s.err, marginBottom: 16 }}>{error}</p>}
      {drafts.map(d => (
        <div key={d.id} style={s.draftRow}>
          <div style={s.draftHeader}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, fontFamily: 'Playfair Display,Georgia,serif' }}>
                {d.clients?.name} — Session {d.session_number}
              </p>
              <p style={{ fontSize: 12, color: '#C8A96E', fontWeight: 600, marginTop: 2 }}>{d.clients?.stage}</p>
              <p style={{ fontSize: 12, opacity: 0.5, marginTop: 2 }}>Generated {fmt(d.created_at)}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} style={s.btnOutline}>
                {expanded === d.id ? 'Hide' : 'Preview'}
              </button>
              <button onClick={() => approve(d.id)} style={s.btnPrimary} disabled={approving === d.id}>
                {approving === d.id ? 'Sending…' : 'Approve & Send'}
              </button>
            </div>
          </div>
          {expanded === d.id && (
            <div style={s.draftBody}>
              {d.coaching.split('\n').map((l, i) =>
                l.trim() ? <p key={i} style={s.para}>{l}</p> : <br key={i} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Assessments tab ───────────────────────────────────────────────────────────
function AssessmentsTab({ pw, assessments, loading, onGenerate, onMarkReviewed }) {
  const [expanded, setExpanded] = useState(null)
  const [marking, setMarking] = useState(null)

  async function markReviewed(id) {
    setMarking(id)
    try {
      await fetch(`/api/assessments?id=${id}`, {
        method: 'PATCH',
        headers: authHeaders(pw),
        body: JSON.stringify({ status: 'reviewed' }),
      })
      onMarkReviewed(id)
    } finally { setMarking(null) }
  }

  if (loading) return <p style={s.muted}>Loading…</p>
  if (!assessments.length) return (
    <p style={s.muted}>No assessments yet. Share <strong>ghostlifesyndrome.com/assessment</strong> with clients.</p>
  )

  const newOnes = assessments.filter(a => a.status === 'new')
  const reviewed = assessments.filter(a => a.status !== 'new')

  function renderRow(a) {
    const isOpen = expanded === a.id
    const words = [
      a.situation && `SITUATION:\n${a.situation}`,
      a.not_working && `NOT WORKING:\n${a.not_working}`,
      a.tried && `WHAT THEY'VE TRIED:\n${a.tried}`,
      a.wants && `WHAT THEY WANT:\n${a.wants}`,
    ].filter(Boolean).join('\n\n')

    return (
      <div key={a.id} style={{ ...s.draftRow, borderLeftColor: a.status === 'new' ? '#7B1C1C' : 'rgba(26,26,26,0.12)', borderLeftWidth: 3 }}>
        <div style={s.draftHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <p style={{ fontWeight: 700, fontSize: 15, fontFamily: 'Playfair Display,Georgia,serif' }}>
                {a.name || '(no name)'}
              </p>
              {a.status === 'new' && (
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: '#7B1C1C', color: '#F5EFE0', padding: '2px 8px', borderRadius: 2 }}>New</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#4A3728', marginBottom: 2 }}>{a.email}</p>
            <p style={{ fontSize: 12, opacity: 0.45 }}>{fmt(a.created_at)}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button onClick={() => setExpanded(isOpen ? null : a.id)} style={s.btnOutline}>
              {isOpen ? 'Hide' : 'Read'}
            </button>
            {a.status === 'new' && (
              <button onClick={() => markReviewed(a.id)} style={{ ...s.btnOutline, opacity: 0.7 }} disabled={marking === a.id}>
                {marking === a.id ? '…' : 'Mark reviewed'}
              </button>
            )}
            <button onClick={() => onGenerate({ name: a.name, email: a.email, words })} style={s.btnPrimary}>
              Generate Coaching
            </button>
          </div>
        </div>
        {isOpen && (
          <div style={s.draftBody}>
            {words.split('\n').map((l, i) =>
              l.trim()
                ? <p key={i} style={{ ...s.para, ...(l.endsWith(':') ? { fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C8A96E', marginTop: 16, marginBottom: 4 } : {}) }}>{l}</p>
                : <br key={i} />
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {newOnes.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <p style={{ ...s.eyebrow, marginBottom: 16 }}>New — {newOnes.length}</p>
          {newOnes.map(renderRow)}
        </div>
      )}
      {reviewed.length > 0 && (
        <div>
          <p style={{ ...s.eyebrow, marginBottom: 16 }}>Reviewed — {reviewed.length}</p>
          {reviewed.map(renderRow)}
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CoachPage() {
  const [pw, setPw] = useState(() => sessionStorage.getItem('coach_pw') || '')
  const [authed, setAuthed] = useState(!!sessionStorage.getItem('coach_pw'))
  const [tab, setTab] = useState('generate')
  const [clients, setClients] = useState([])
  const [drafts, setDrafts] = useState([])
  const [assessments, setAssessments] = useState([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingAssessments, setLoadingAssessments] = useState(false)
  const [generatePrefill, setGeneratePrefill] = useState(null)

  const loadClients = useCallback(async (password) => {
    setLoadingClients(true)
    try {
      const [cRes, dRes] = await Promise.all([
        fetch('/api/clients', { headers: authHeaders(password) }),
        fetch('/api/sessions', { headers: authHeaders(password) }),
      ])
      if (cRes.ok) setClients(await cRes.json())
      if (dRes.ok) setDrafts(await dRes.json())
    } finally { setLoadingClients(false) }
  }, [])

  const loadAssessments = useCallback(async (password) => {
    setLoadingAssessments(true)
    try {
      const res = await fetch('/api/assessments', { headers: authHeaders(password) })
      if (res.ok) setAssessments(await res.json())
    } finally { setLoadingAssessments(false) }
  }, [])

  useEffect(() => {
    if (authed && pw) {
      loadClients(pw)
      loadAssessments(pw)
    }
  }, [authed, pw, loadClients, loadAssessments])

  function handleAuth(password) {
    setPw(password)
    setAuthed(true)
  }

  function handleGenerateFromAssessment(prefill) {
    setGeneratePrefill(prefill)
    setTab('generate')
  }

  if (!authed) return <Gate onAuth={handleAuth} />

  const pendingCount = drafts.length
  const newAssessments = assessments.filter(a => a.status === 'new').length

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.header}>
          <p style={s.eyebrow}>GHOST LIFE COACHING</p>
          <h1 style={s.title}>Coach Dashboard</h1>
        </div>

        <div style={s.tabs}>
          {[
            { key: 'generate', label: 'Generate' },
            { key: 'assessments', label: `Assessments${newAssessments ? ` · ${newAssessments}` : ''}`, alert: newAssessments > 0 },
            { key: 'clients', label: `Clients (${clients.length})` },
            { key: 'approvals', label: `Approvals${pendingCount ? ` · ${pendingCount}` : ''}`, alert: pendingCount > 0 },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ ...s.tabBtn, ...(tab === t.key ? s.tabBtnActive : {}), ...(t.alert ? { color: '#7B1C1C' } : {}) }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'generate' && (
          <GenerateTab pw={pw} clients={clients} onSessionSaved={() => loadClients(pw)}
            prefill={generatePrefill} onPrefillConsumed={() => setGeneratePrefill(null)} />
        )}
        {tab === 'assessments' && (
          <AssessmentsTab pw={pw} assessments={assessments} loading={loadingAssessments}
            onGenerate={handleGenerateFromAssessment}
            onMarkReviewed={id => setAssessments(a => a.map(x => x.id === id ? { ...x, status: 'reviewed' } : x))} />
        )}
        {tab === 'clients' && (
          <ClientsTab clients={clients} loading={loadingClients} />
        )}
        {tab === 'approvals' && (
          <ApprovalsTab pw={pw} drafts={drafts}
            onApproved={id => { setDrafts(d => d.filter(x => x.id !== id)); loadClients(pw) }} />
        )}
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  gate: { minHeight: '100vh', background: '#141414', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
  gateBox: { background: '#1e1e1e', padding: '52px 48px', maxWidth: 400, width: '100%', textAlign: 'center' },
  gateTitle: { fontFamily: 'Playfair Display,Georgia,serif', fontSize: 32, color: '#F5EFE0', marginBottom: 32, fontWeight: 700 },
  page: { minHeight: '100vh', background: '#F5EFE0', padding: '48px 24px' },
  container: { maxWidth: 1100, margin: '0 auto' },
  header: { marginBottom: 32 },
  title: { fontFamily: 'Playfair Display,Georgia,serif', fontSize: 42, fontWeight: 700, color: '#141414', letterSpacing: '-0.02em' },
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: 8, fontFamily: 'Inter,system-ui,sans-serif' },
  tabs: { display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid rgba(26,26,26,0.12)', paddingBottom: 0 },
  tabBtn: { padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'rgba(26,26,26,0.45)', fontFamily: 'Inter,system-ui,sans-serif', letterSpacing: '0.02em', borderBottom: '2px solid transparent', marginBottom: -1 },
  tabBtnActive: { color: '#141414', borderBottomColor: '#7B1C1C' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A3728', fontFamily: 'Inter,system-ui,sans-serif' },
  input: { padding: '12px 16px', fontFamily: 'Inter,system-ui,sans-serif', fontSize: 15, border: '1.5px solid rgba(26,26,26,0.2)', borderRadius: 2, background: '#fff', color: '#141414', outline: 'none', width: '100%', boxSizing: 'border-box' },
  textarea: { minHeight: 140, resize: 'vertical', lineHeight: 1.6 },
  btnPrimary: { padding: '12px 28px', background: '#7B1C1C', color: '#F5EFE0', border: 'none', borderRadius: 2, fontFamily: 'Inter,system-ui,sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' },
  btnOutline: { padding: '12px 28px', background: 'transparent', color: '#7B1C1C', border: '1.5px solid #7B1C1C', borderRadius: 2, fontFamily: 'Inter,system-ui,sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' },
  err: { fontSize: 13, color: '#7B1C1C', fontWeight: 500, fontFamily: 'Inter,system-ui,sans-serif' },
  muted: { fontSize: 14, color: '#4A3728', opacity: 0.5, fontFamily: 'Inter,system-ui,sans-serif' },
  outputCol: { position: 'sticky', top: 24 },
  placeholder: { background: '#EDE8DA', padding: '48px 32px', minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  diagBox: { background: '#141414', padding: 24, marginBottom: 2 },
  resultBox: { background: '#fff', border: '1.5px solid rgba(26,26,26,0.12)' },
  resultHeader: { padding: '14px 20px', borderBottom: '1px solid rgba(26,26,26,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  copyBtn: { padding: '6px 14px', background: '#7B1C1C', color: '#F5EFE0', border: 'none', borderRadius: 2, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,system-ui,sans-serif' },
  resultBody: { padding: '24px 20px', maxHeight: '65vh', overflowY: 'auto' },
  para: { fontSize: 15, lineHeight: 1.75, color: '#141414', marginBottom: 12, fontFamily: 'Inter,system-ui,sans-serif' },
  clientRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '24px 0', borderBottom: '1px solid rgba(26,26,26,0.1)' },
  draftRow: { border: '1.5px solid rgba(26,26,26,0.12)', marginBottom: 12 },
  draftHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' },
  draftBody: { padding: '0 24px 24px', borderTop: '1px solid rgba(26,26,26,0.08)' },
}
