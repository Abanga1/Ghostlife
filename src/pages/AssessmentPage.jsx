import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

const STEPS = [
  {
    id: 'situation',
    label: 'What\'s been going on for you lately?',
    hint: 'Describe it in your own words, without filtering. No clinical language needed — just what\'s true.',
    placeholder: 'Something like: "I feel like I\'m just going through the motions. I do everything I\'m supposed to do but nothing feels real…"',
    rows: 7,
  },
  {
    id: 'not_working',
    label: 'What specifically is not working? What are you most tired of?',
    hint: 'The thing you keep coming back to. The pattern you\'re exhausted by.',
    placeholder: 'Something like: "I keep saying yes to everyone else and then resenting it. I don\'t know how to stop…"',
    rows: 6,
  },
  {
    id: 'tried',
    label: 'What have you already tried?',
    hint: 'Books, therapy, strategies, advice you\'ve followed. What helped — if anything — and what didn\'t.',
    placeholder: 'Something like: "I\'ve read a lot of self-help. I tried journaling. Nothing sticks…"',
    rows: 5,
  },
  {
    id: 'wants',
    label: 'What would feel different if something changed?',
    hint: 'Not a goal you think you should have. What would actually feel different in your life.',
    placeholder: 'Something like: "I want to feel like I\'m actually here. Like I\'m living my life instead of watching it…"',
    rows: 5,
  },
]

export default function AssessmentPage() {
  const [step, setStep] = useState(0) // 0..STEPS.length-1 = questions, STEPS.length = contact, STEPS.length+1 = done
  const [answers, setAnswers] = useState({ situation: '', not_working: '', tried: '', wants: '' })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totalSteps = STEPS.length
  const isContactStep = step === totalSteps
  const isDone = step === totalSteps + 1
  const pct = Math.round((step / (totalSteps + 1)) * 100)

  function handleTextChange(id, value) {
    setAnswers(prev => ({ ...prev, [id]: value }))
  }

  function next(e) {
    e?.preventDefault()
    const current = STEPS[step]
    if (current && !answers[current.id].trim()) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, ...answers }),
      })
      if (!res.ok) throw new Error('Submission failed')
      setStep(totalSteps + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isDone) {
    return (
      <>
        <SEO title="Assessment Received — Ghost Life Syndrome" path="/assessment" />
        <Nav />
        <main className="assess-page">
          <div className="container assess-page__inner assess-page__done">
            <p className="assess-page__eyebrow">Assessment received</p>
            <h1 className="serif assess-page__done-title">
              Your intake is in.
            </h1>
            <p className="assess-page__done-body">
              I will read every word you wrote. Within 48 hours you will receive
              a detailed written response — your stage, the pattern underneath it,
              and a clear path forward. Entirely in writing, at your pace.
            </p>
            <p className="assess-page__done-body" style={{ opacity: 0.6, fontSize: 14 }}>
              Check your inbox — a confirmation is on its way to {email}.
            </p>
            <Link to="/" className="btn btn--outline" style={{ marginTop: 32, display: 'inline-block' }}>
              Back to site
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <SEO
        title="Written Assessment — Ghost Life Syndrome"
        description="A private intake form. Describe your situation in your own words. You'll receive a detailed written breakdown of your stage and a clear path forward within 48 hours."
        path="/assessment"
      />
      <Nav />
      <main className="assess-page">
        <div className="container assess-page__inner">

          {/* Header — shown on first step only */}
          {step === 0 && (
            <div className="assess-page__header">
              <p className="assess-page__eyebrow">Written Assessment</p>
              <h1 className="serif assess-page__title">
                Tell me what's going on.
              </h1>
              <p className="assess-page__subtitle">
                This is a private intake form. Four questions. Your answers go
                directly to me — no algorithm, no automated response.
                Within 48 hours you'll receive a detailed written breakdown:
                your stage, the pattern underneath it, and what comes next.
              </p>
            </div>
          )}

          {/* Progress bar */}
          <div className="assess-page__progress">
            <div className="assess-page__progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="assess-page__counter">
            {isContactStep ? 'Last step' : `Question ${step + 1} of ${totalSteps}`}
          </p>

          {/* Question steps */}
          {!isContactStep && (
            <form onSubmit={next} className="assess-page__form" key={step}>
              <label className="assess-page__q-label serif">
                {STEPS[step].label}
              </label>
              {STEPS[step].hint && (
                <p className="assess-page__q-hint">{STEPS[step].hint}</p>
              )}
              <textarea
                className="assess-page__textarea"
                rows={STEPS[step].rows}
                placeholder={STEPS[step].placeholder}
                value={answers[STEPS[step].id]}
                onChange={e => handleTextChange(STEPS[step].id, e.target.value)}
                autoFocus
              />
              <div className="assess-page__nav">
                {step > 0 && (
                  <button
                    type="button"
                    className="btn btn--outline assess-page__back"
                    onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={!answers[STEPS[step].id].trim()}
                >
                  {step === totalSteps - 1 ? 'Continue to submit' : 'Next'}
                </button>
              </div>
            </form>
          )}

          {/* Contact step */}
          {isContactStep && (
            <form onSubmit={handleSubmit} className="assess-page__form">
              <label className="assess-page__q-label serif">
                Where should I send your assessment?
              </label>
              <p className="assess-page__q-hint">
                Your responses stay private. No pitch at the end — just the assessment.
              </p>
              <div className="assess-page__contact-fields">
                <input
                  className="assess-page__input"
                  type="text"
                  placeholder="First name (optional)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <input
                  className="assess-page__input"
                  type="email"
                  placeholder="Email address *"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {error && <p className="assess-page__error">{error}</p>}
              <div className="assess-page__nav">
                <button
                  type="button"
                  className="btn btn--outline assess-page__back"
                  onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                >
                  Back
                </button>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Submit assessment'}
                </button>
              </div>
              <p className="assess-page__note">No spam. Your details are never shared.</p>
            </form>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
