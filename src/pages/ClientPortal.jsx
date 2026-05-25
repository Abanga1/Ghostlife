import React, { useState } from 'react'
import SEO from '../components/SEO'
import Footer from '../components/Footer'

const BRAND = 'Ghost Life Syndrome'

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Email entry ───────────────────────────────────────────────────────────────
function EmailEntry({ onFound }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/client-portal?email=${encodeURIComponent(email.trim())}`)
      if (res.status === 404) {
        setError('No coaching account found for this email. Make sure you're using the email you purchased with.')
        return
      }
      if (!res.ok) throw new Error('Something went wrong.')
      const data = await res.json()
      onFound({ ...data, email: email.trim() })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <SEO title="Your Coaching — Ghost Life Syndrome" path="/portal" />
      <div style={s.entryWrap}>
        <p style={s.eyebrow}>{BRAND}</p>
        <h1 style={s.entryTitle}>Your private coaching portal.</h1>
        <p style={s.entrySub}>Enter the email address you used when you purchased to access your sessions.</p>
        <form onSubmit={submit} style={s.entryForm}>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={s.entryInput}
            autoFocus
            required
          />
          <button type="submit" style={s.btnPrimary} disabled={loading}>
            {loading ? 'Looking up…' : 'Access my portal'}
          </button>
        </form>
        {error && <p style={s.err}>{error}</p>}
        <p style={s.entryNote}>Your data is private. Only you and Isaac can see your sessions.</p>
      </div>
    </div>
  )
}

// ── Stage card ────────────────────────────────────────────────────────────────
function StageCard({ stage, stageDesc }) {
  if (!stage) return null
  return (
    <div style={s.stageCard}>
      <p style={s.stageLabel}>Your Stage</p>
      <p style={s.stageName}>{stage}</p>
      {stageDesc && <p style={s.stageDesc}>{stageDesc}</p>}
    </div>
  )
}

// ── Session letter ────────────────────────────────────────────────────────────
function SessionLetter({ session, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={s.letter}>
      <div style={s.letterHeader} onClick={() => setOpen(o => !o)}>
        <div>
          <p style={s.letterNum}>Session {session.session_number}</p>
          <p style={s.letterDate}>{fmt(session.sent_at || session.created_at)}</p>
        </div>
        <span style={{ ...s.letterToggle, transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </div>
      {open && (
        <div style={s.letterBody}>
          {session.coaching.split('\n').map((l, i) =>
            l.trim() ? <p key={i} style={s.letterPara}>{l}</p> : <br key={i} />
          )}
        </div>
      )}
    </div>
  )
}

// ── Check-in form ─────────────────────────────────────────────────────────────
function CheckInForm({ email, sessionNumber, onSubmitted }) {
  const [words, setWords] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!words.trim()) return
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/client-portal', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, words }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error === 'already_pending' ? 'You already have a check-in waiting for a response.' : 'Something went wrong.')
      }
      onSubmitted(words)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={s.checkinWrap}>
      <p style={s.checkinLabel}>Session {sessionNumber} — Write to Isaac</p>
      <p style={s.checkinHint}>
        What's been going on since we last spoke? Write exactly what's true — unfiltered.
        This goes directly to Isaac. Response within 48 hours.
      </p>
      <form onSubmit={submit}>
        <textarea
          value={words}
          onChange={e => setWords(e.target.value)}
          placeholder="Write here…"
          style={s.checkinTextarea}
          rows={8}
          autoFocus
        />
        {error && <p style={s.err}>{error}</p>}
        <button type="submit" style={{ ...s.btnPrimary, marginTop: 12 }} disabled={submitting || !words.trim()}>
          {submitting ? 'Sending…' : 'Send to Isaac'}
        </button>
      </form>
    </div>
  )
}

// ── Pending state ─────────────────────────────────────────────────────────────
function PendingState({ words }) {
  const [showWords, setShowWords] = useState(false)
  return (
    <div style={s.pendingWrap}>
      <div style={s.pendingDot} />
      <div>
        <p style={s.pendingTitle}>Isaac has your words.</p>
        <p style={s.pendingDesc}>Your response is being prepared. You'll receive it by email within 48 hours.</p>
        {words && (
          <button onClick={() => setShowWords(o => !o)} style={s.pendingToggle}>
            {showWords ? 'Hide what you wrote' : 'See what you wrote'}
          </button>
        )}
        {showWords && words && (
          <div style={s.pendingWords}>
            {words.split('\n').map((l, i) =>
              l.trim() ? <p key={i} style={{ ...s.letterPara, color: 'rgba(243,237,217,0.7)', marginBottom: 8 }}>{l}</p> : <br key={i} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Welcome (no sessions yet) ─────────────────────────────────────────────────
function WelcomeState({ name, email, onSubmitted }) {
  return (
    <div>
      <div style={s.welcomeCard}>
        <p style={s.eyebrow}>Welcome</p>
        <h2 style={s.welcomeTitle}>You're in, {name?.split(' ')[0] || 'there'}.</h2>
        <p style={s.welcomeBody}>
          This is where your coaching happens. Each week you write to Isaac here — what's going on,
          what's shifted, what hasn't. He reads everything and sends back a detailed written response.
        </p>
        <div style={s.welcomeSteps}>
          {[
            { n: '01', text: 'Write what\'s going on for you in the box below — unfiltered.' },
            { n: '02', text: 'Isaac reads your words and sends a detailed written response within 48 hours.' },
            { n: '03', text: 'Your responses build up here over time — a record of your arc.' },
          ].map(step => (
            <div key={step.n} style={s.welcomeStep}>
              <span style={s.welcomeStepNum}>{step.n}</span>
              <p style={s.welcomeStepText}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>
      <CheckInForm email={email} sessionNumber={1} onSubmitted={onSubmitted} />
    </div>
  )
}

// ── Main portal ───────────────────────────────────────────────────────────────
function Portal({ data }) {
  const { client, sessions, hasPending, pendingWords, stageDesc, email } = data
  const [pending, setPending] = useState(hasPending)
  const [submittedWords, setSubmittedWords] = useState(pendingWords)
  const nextSession = sessions.length + (pending ? 1 : 0) + 1

  function handleSubmitted(words) {
    setPending(true)
    setSubmittedWords(words)
  }

  const isNew = sessions.length === 0 && !pending

  return (
    <div style={s.page}>
      <div style={s.portalWrap}>

        {/* Top bar */}
        <div style={s.topBar}>
          <p style={s.eyebrow}>{BRAND} — Private Coaching</p>
        </div>

        {/* Client header */}
        <div style={s.clientHeader}>
          <div>
            <h1 style={s.clientName}>{client.name}</h1>
            <p style={s.clientMeta}>
              {sessions.length > 0
                ? `Session ${sessions.length} complete · ${client.stage || 'Undiagnosed'}`
                : client.stage || 'Undiagnosed'}
            </p>
          </div>
          {sessions.length > 0 && (
            <div style={s.sessionBadge}>
              <span style={s.sessionBadgeNum}>{sessions.length}</span>
              <span style={s.sessionBadgeLabel}>session{sessions.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Stage card */}
        <StageCard stage={client.stage} stageDesc={stageDesc} />

        {/* Main content */}
        {isNew ? (
          <WelcomeState name={client.name} email={email} onSubmitted={handleSubmitted} />
        ) : (
          <div>
            {/* Current status */}
            {pending ? (
              <PendingState words={submittedWords} />
            ) : (
              <CheckInForm email={email} sessionNumber={nextSession} onSubmitted={handleSubmitted} />
            )}

            {/* Session timeline */}
            {sessions.length > 0 && (
              <div style={s.timeline}>
                <p style={s.timelineLabel}>Your Sessions</p>
                {[...sessions].reverse().map((session, i) => (
                  <SessionLetter key={session.id} session={session} defaultOpen={i === 0} />
                ))}
              </div>
            )}
          </div>
        )}

        <div style={s.portalFooter}>
          <p style={s.portalFooterText}>Ghost Life Syndrome · Private Coaching Portal</p>
          <p style={s.portalFooterText}>Questions? Reply to any email from Isaac.</p>
        </div>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ClientPortal() {
  const [data, setData] = useState(null)

  if (!data) return <EmailEntry onFound={setData} />
  return <Portal data={data} />
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: '100vh', background: '#141414', color: '#F5EFE0', fontFamily: 'Inter,system-ui,sans-serif' },
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: 16 },
  err: { fontSize: 13, color: '#e07070', fontWeight: 500, marginTop: 12 },

  // Entry
  entryWrap: { maxWidth: 480, margin: '0 auto', padding: '120px 24px 80px', textAlign: 'center' },
  entryTitle: { fontFamily: 'Playfair Display,Georgia,serif', fontSize: 'clamp(32px,6vw,52px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' },
  entrySub: { fontSize: 16, lineHeight: 1.75, opacity: 0.6, marginBottom: 40 },
  entryForm: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 },
  entryInput: { padding: '16px 20px', fontFamily: 'Inter,system-ui,sans-serif', fontSize: 16, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(243,237,217,0.15)', borderRadius: 2, color: '#F5EFE0', outline: 'none' },
  entryNote: { fontSize: 12, opacity: 0.3, letterSpacing: '0.03em', marginTop: 16 },

  // Portal
  portalWrap: { maxWidth: 720, margin: '0 auto', padding: '64px 24px 100px' },
  topBar: { marginBottom: 48 },
  clientHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 },
  clientName: { fontFamily: 'Playfair Display,Georgia,serif', fontSize: 'clamp(28px,5vw,44px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 10, letterSpacing: '-0.02em' },
  clientMeta: { fontSize: 14, opacity: 0.45, letterSpacing: '0.04em' },
  sessionBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(200,169,110,0.12)', border: '1px solid rgba(200,169,110,0.25)', padding: '16px 24px', minWidth: 80 },
  sessionBadgeNum: { fontFamily: 'Playfair Display,Georgia,serif', fontSize: 40, fontWeight: 700, color: '#C8A96E', lineHeight: 1 },
  sessionBadgeLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.5, marginTop: 4 },

  // Stage card
  stageCard: { background: '#7B1C1C', padding: '28px 32px', marginBottom: 40 },
  stageLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(243,237,217,0.6)', marginBottom: 8 },
  stageName: { fontFamily: 'Playfair Display,Georgia,serif', fontSize: 22, fontWeight: 700, marginBottom: 10 },
  stageDesc: { fontSize: 15, lineHeight: 1.7, opacity: 0.8 },

  // Welcome
  welcomeCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(243,237,217,0.08)', padding: '40px 36px', marginBottom: 40 },
  welcomeTitle: { fontFamily: 'Playfair Display,Georgia,serif', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 700, marginBottom: 16, letterSpacing: '-0.02em' },
  welcomeBody: { fontSize: 16, lineHeight: 1.8, opacity: 0.7, marginBottom: 36 },
  welcomeSteps: { display: 'flex', flexDirection: 'column', gap: 20 },
  welcomeStep: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  welcomeStepNum: { fontFamily: 'Playfair Display,Georgia,serif', fontSize: 28, color: '#C8A96E', opacity: 0.5, lineHeight: 1, flexShrink: 0 },
  welcomeStepText: { fontSize: 15, lineHeight: 1.7, opacity: 0.7, paddingTop: 4 },

  // Check-in
  checkinWrap: { marginBottom: 48 },
  checkinLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: 12 },
  checkinHint: { fontSize: 15, lineHeight: 1.7, opacity: 0.55, marginBottom: 20 },
  checkinTextarea: { width: '100%', padding: '18px 20px', fontFamily: 'Georgia,serif', fontSize: 16, lineHeight: 1.8, background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(243,237,217,0.15)', borderRadius: 2, color: '#F5EFE0', resize: 'vertical', outline: 'none', boxSizing: 'border-box' },

  // Pending
  pendingWrap: { display: 'flex', gap: 20, alignItems: 'flex-start', background: 'rgba(200,169,110,0.08)', border: '1px solid rgba(200,169,110,0.2)', padding: '28px 32px', marginBottom: 48 },
  pendingDot: { width: 10, height: 10, borderRadius: '50%', background: '#C8A96E', flexShrink: 0, marginTop: 6, boxShadow: '0 0 12px rgba(200,169,110,0.5)' },
  pendingTitle: { fontFamily: 'Playfair Display,Georgia,serif', fontSize: 22, fontWeight: 700, marginBottom: 8 },
  pendingDesc: { fontSize: 15, lineHeight: 1.7, opacity: 0.65, marginBottom: 16 },
  pendingToggle: { background: 'none', border: 'none', color: '#C8A96E', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, letterSpacing: '0.04em' },
  pendingWords: { marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(243,237,217,0.08)' },

  // Timeline
  timeline: { marginTop: 64 },
  timelineLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8A96E', marginBottom: 24 },

  // Letter
  letter: { borderTop: '1px solid rgba(243,237,217,0.08)', marginBottom: 0 },
  letterHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', cursor: 'pointer' },
  letterNum: { fontFamily: 'Playfair Display,Georgia,serif', fontSize: 18, fontWeight: 700, marginBottom: 4 },
  letterDate: { fontSize: 12, opacity: 0.4, letterSpacing: '0.04em' },
  letterToggle: { fontSize: 24, color: '#C8A96E', transition: 'transform 0.2s', lineHeight: 1, flexShrink: 0 },
  letterBody: { paddingBottom: 32 },
  letterPara: { fontSize: 16, lineHeight: 1.85, color: 'rgba(243,237,217,0.85)', marginBottom: 14, fontFamily: 'Georgia,serif' },

  // Buttons
  btnPrimary: { display: 'block', width: '100%', padding: '16px 32px', background: '#7B1C1C', color: '#F5EFE0', border: 'none', borderRadius: 2, fontFamily: 'Inter,system-ui,sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s' },

  // Footer
  portalFooter: { marginTop: 80, paddingTop: 32, borderTop: '1px solid rgba(243,237,217,0.06)', textAlign: 'center' },
  portalFooterText: { fontSize: 12, opacity: 0.25, marginBottom: 6, letterSpacing: '0.03em' },
}
