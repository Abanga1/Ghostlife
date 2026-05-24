import React, { useState } from 'react'
import { QUIZ_QUESTIONS, STAGES } from '../data'

const BOOK_URL = 'https://ghostlifesyndrome.lemonsqueezy.com/checkout/buy/61f7d117-9bee-48b0-ab43-c667f95f4ebc'
const FORM_URL = import.meta.env.VITE_EMAIL_FORM_URL || ''
const SITE_URL = 'https://ghostlifesyndrome.com'

const OPTIONS = [
  { label: 'Never', value: 1 },
  { label: 'Rarely', value: 2 },
  { label: 'Sometimes', value: 3 },
  { label: 'Often', value: 4 },
  { label: 'Always', value: 5 },
]

function getStage(score) {
  if (score <= 40) return STAGES[0]
  if (score <= 55) return STAGES[1]
  if (score <= 68) return STAGES[2]
  if (score <= 80) return STAGES[3]
  return STAGES[4]
}

function ShareButtons({ stage, score }) {
  const text = `I just took the Ghost Life Syndrome quiz. My stage: ${stage.title} (${score}/100). Find yours:`
  const url = `${SITE_URL}/#quiz`

  function shareX() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
  }

  function shareNative() {
    navigator.share({ title: 'My Ghost Life Stage', text, url }).catch(() => {})
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url).catch(() => {})
    alert('Link copied.')
  }

  return (
    <div className="quiz__share">
      <p className="quiz__share-label">Share your result</p>
      <div className="quiz__share-buttons">
        <button className="quiz__share-btn" onClick={shareX}>Share on X</button>
        {typeof navigator !== 'undefined' && navigator.share && (
          <button className="quiz__share-btn" onClick={shareNative}>Share</button>
        )}
        <button className="quiz__share-btn" onClick={copyLink}>Copy Link</button>
      </div>
    </div>
  )
}

export default function Quiz() {
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState([])
  const [current, setCurrent] = useState(0)
  const [selecting, setSelecting] = useState(false)

  // Email gate state
  const [gated, setGated] = useState(false)
  const [gateName, setGateName] = useState('')
  const [gateEmail, setGateEmail] = useState('')
  const [gating, setGating] = useState(false)
  const [gateError, setGateError] = useState('')

  const total = QUIZ_QUESTIONS.length
  const done = answers.length === total
  const score = answers.reduce((s, a) => s + a, 0)
  const stage = done ? getStage(score) : null

  function handleSelect(value) {
    if (selecting) return
    setSelecting(true)
    setTimeout(() => {
      setAnswers(prev => [...prev, value])
      setCurrent(prev => prev + 1)
      setSelecting(false)
    }, 280)
  }

  async function handleGateSubmit(e) {
    e.preventDefault()
    if (!gateEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setGateError('Please enter a valid email.')
      return
    }
    setGating(true)
    setGateError('')
    const payload = { name: gateName, email: gateEmail, stage: stage?.title, score, source: 'quiz-result-gate' }
    try {
      await Promise.all([
        FORM_URL ? fetch(FORM_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) }) : Promise.resolve(),
        fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
      ])
    } catch { /* non-blocking — show result regardless */ }
    setGating(false)
    setGated(true)
  }

  function reset() {
    setAnswers([])
    setCurrent(0)
    setStarted(false)
    setGated(false)
    setGateName('')
    setGateEmail('')
    setGateError('')
  }

  // Intro
  if (!started) {
    return (
      <section className="quiz" id="quiz">
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="section-label" style={{ color: 'rgba(243,237,217,0.5)' }}>Diagnostic Quiz</p>
          <h2 className="section-title serif" style={{ color: 'var(--cream)' }}>Which stage are you in?</h2>
          <p className="quiz__intro">
            20 questions. Your answers place you in one of five stages — each with a different path back.
          </p>
          <button className="btn btn--primary" onClick={() => setStarted(true)}>
            Take the Quiz
          </button>
        </div>
      </section>
    )
  }

  // Questions
  if (!done) {
    const q = QUIZ_QUESTIONS[current]
    const pct = (current / total) * 100
    return (
      <section className="quiz quiz--active" id="quiz">
        <div className="container">
          <div className="quiz__progress-bar">
            <div className="quiz__progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="quiz__counter">{current + 1} of {total}</p>
          <h2 className="quiz__question serif">{q.text}</h2>
          <div className="quiz__options">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                className="quiz__option"
                onClick={() => handleSelect(opt.value)}
                disabled={selecting}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Email gate
  if (!gated) {
    return (
      <section className="quiz quiz--gate" id="quiz">
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="quiz__result-label">Quiz complete</p>
          <h2 className="quiz__gate-title serif">Your result is ready.</h2>
          <p className="quiz__gate-sub">
            Enter your email to see which stage you're in and what it means for your path back.
            I'll also send Chapter One — free.
          </p>
          <form className="quiz__gate-form" onSubmit={handleGateSubmit} noValidate>
            <input
              type="text"
              placeholder="First name (optional)"
              value={gateName}
              onChange={e => setGateName(e.target.value)}
              className="quiz__gate-input"
            />
            <input
              type="email"
              placeholder="Your email address"
              value={gateEmail}
              onChange={e => setGateEmail(e.target.value)}
              required
              className="quiz__gate-input"
            />
            {gateError && <p className="quiz__gate-error">{gateError}</p>}
            <button type="submit" className="btn btn--primary" disabled={gating}>
              {gating ? 'One moment…' : 'Show My Result'}
            </button>
          </form>
          <p className="quiz__gate-note">No spam. Unsubscribe any time.</p>
        </div>
      </section>
    )
  }

  // Result
  return (
    <section className="quiz quiz--result" id="quiz">
      <div className="container" style={{ textAlign: 'center' }}>
        <p className="quiz__result-label">Your result</p>
        <p className="quiz__result-score">Score: {score} / 100</p>
        <p className="quiz__result-stage">{stage.name}</p>
        <h2 className="quiz__result-title serif">{stage.title}</h2>
        <p className="quiz__result-desc">{stage.desc}</p>
        <p className="quiz__result-cta-intro">
          The book maps out exactly where you are and what comes next.
        </p>
        <div className="quiz__result-actions">
          <a href={BOOK_URL} className="btn btn--primary" target="_blank" rel="noreferrer">
            Get the Book — $17
          </a>
          <button className="btn btn--outline quiz__retake" onClick={reset}>
            Retake the Quiz
          </button>
        </div>
        <ShareButtons stage={stage} score={score} />
      </div>
    </section>
  )
}
