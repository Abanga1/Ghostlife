import React, { useState } from 'react'

// Set VITE_EMAIL_FORM_URL in your .env.local to a Formspree or Brevo endpoint
// e.g. https://formspree.io/f/your_form_id
const FORM_URL = import.meta.env.VITE_EMAIL_FORM_URL || ''

export default function EmailCapture({ id }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return
    setSubmitting(true)
    setError('')
    try {
      if (FORM_URL) {
        const res = await fetch(FORM_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (!res.ok) throw new Error()
      }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="email-cap" id={id}>
      <div className="container">
        {submitted ? (
          <>
            <h2 className="email-cap__title serif">Check your inbox.</h2>
            <p className="email-cap__sub">
              Chapter One is on its way. It will name things you have been
              carrying without words for a long time.
            </p>
          </>
        ) : (
          <>
            <p className="section-label">Free Chapter</p>
            <h2 className="email-cap__title serif">
              Read Chapter One before you decide anything.
            </h2>
            <p className="email-cap__sub">
              15 signs. A quiz. The five stages. Free.
              No pitch at the end — just the chapter.
            </p>
            <form className="email-cap__form" onSubmit={handleSubmit}>
              <input
                className="email-cap__input"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send it to me'}
              </button>
            </form>
            {error && <p style={{ color: 'var(--maroon)', fontSize: 13, marginTop: 10 }}>{error}</p>}
            <p className="email-cap__note">No spam. Unsubscribe any time.</p>
          </>
        )}
      </div>
    </section>
  )
}
