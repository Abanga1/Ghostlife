import React from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

const steps = [
  { num: '01', title: 'Apply', desc: 'Send a short note about your platform and audience. We review every application.' },
  { num: '02', title: 'Get Your Link', desc: 'Once approved, you receive a unique affiliate link tracked through LemonSqueezy.' },
  { num: '03', title: 'Earn', desc: 'Earn 20% commission on every sale made through your link. Payouts are monthly.' },
]

const rules = [
  'Only promote through honest, genuine content. No spam or misleading claims.',
  'Do not bid on our branded keywords in paid advertising.',
  'Cookies track for 30 days. Purchases within that window earn you the commission.',
  'We reserve the right to remove affiliates who violate these terms.',
]

export default function AffiliatePage() {
  return (
    <>
      <nav className="page-nav">
        <div className="container">
          <Link to="/" className="page-nav__back">← Back</Link>
          <span className="page-nav__brand serif">The Ghost Life Syndrome</span>
        </div>
      </nav>

      <main className="page-main">
        <div className="container">
          <p className="page-label">Affiliate Program</p>
          <h1 className="page-title serif">Share the work.<br /><em>Earn for it.</em></h1>
          <p className="page-intro">
            If you believe in this work, we want to compensate you for sharing it. Join our affiliate program and earn 20% on every book sold through your link.
          </p>

          <div className="affiliate-steps">
            {steps.map(s => (
              <div key={s.num} className="affiliate-step">
                <span className="affiliate-step__num serif">{s.num}</span>
                <h3 className="affiliate-step__title serif">{s.title}</h3>
                <p className="affiliate-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="affiliate-rate">
            <span className="affiliate-rate__num serif">20%</span>
            <span className="affiliate-rate__label">commission per sale · monthly payouts · no cap</span>
          </div>

          <div className="affiliate-cta">
            <h2 className="serif" style={{ fontSize: 32, marginBottom: 16 }}>Ready to apply?</h2>
            <p style={{ marginBottom: 32, opacity: 0.7 }}>Send us a short note about who you are and how you plan to share the book.</p>
            <Link to="/contact" className="btn btn--primary">Apply via Contact</Link>
          </div>

          <div className="affiliate-rules">
            <h3 className="serif affiliate-rules__title">Program Rules</h3>
            {rules.map((rule, i) => (
              <div key={i} className="affiliate-rule">
                <span className="affiliate-rule__num">{i + 1}.</span>
                <p>{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
