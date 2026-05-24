import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

// Set VITE_CONTACT_FORM_URL in your .env.local to a Formspree endpoint
// e.g. https://formspree.io/f/your_form_id
const FORM_URL = import.meta.env.VITE_CONTACT_FORM_URL || ''

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'general', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Please enter your name.'); return }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { setError('Please enter a valid email.'); return }
    setError('')
    setSubmitting(true)
    try {
      if (FORM_URL) {
        const res = await fetch(FORM_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(form),
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
    <>
      <SEO
        title="Contact"
        description="Get in touch with Isaac about the Ghost Life Syndrome book, written assessment, or coaching programme."
        path="/contact"
      />
      <nav className="page-nav">
        <div className="container">
          <Link to="/" className="page-nav__back">← Back</Link>
          <span className="page-nav__brand serif">The Ghost Life Syndrome</span>
        </div>
      </nav>

      <main className="page-main">
        <div className="container" style={{ maxWidth: 620 }}>
          <h1 className="page-title serif">Get in touch.</h1>

          {submitted ? (
            <div className="form-success">
              <p className="serif" style={{ fontSize: 22, marginBottom: 8 }}>Thank you, {form.name}.</p>
              <p style={{ opacity: 0.6 }}>I'll be in touch within a few days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <input
                  type="text" placeholder="Your name" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="form-input"
                />
                <input
                  type="email" placeholder="Your email" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="form-input"
                />
              </div>
              <select
                value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                className="form-input"
              >
                <option value="general">General Inquiry</option>
                <option value="media">Media & Press</option>
                <option value="bulk">Bulk Orders</option>
                <option value="other">Other</option>
              </select>
              <textarea
                placeholder="Your message..." rows={6}
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                className="form-input form-textarea"
              />
              {error && <p className="form-error">{error}</p>}
              <button type="submit" className="btn btn--primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </>
  )
}
