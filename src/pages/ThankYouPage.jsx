import React from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

export default function ThankYouPage() {
  return (
    <>
      <nav className="page-nav">
        <div className="container">
          <Link to="/" className="page-nav__back">← Home</Link>
          <span className="page-nav__brand serif">The Ghost Life Syndrome</span>
        </div>
      </nav>

      <main className="page-main" style={{ textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <p className="page-label">Order Confirmed</p>
          <h1 className="page-title serif">Your copy is confirmed.</h1>
          <p style={{ fontSize: 20, lineHeight: 1.7, marginBottom: 56, opacity: 0.75 }}>
            Now clear an hour. The first chapter will not let you put it down.
          </p>

          <div className="thankyou-steps">
            <div className="thankyou-step">
              <span className="thankyou-step__num serif">1</span>
              <p>Check your email — your download link is on its way</p>
            </div>
            <div className="thankyou-step">
              <span className="thankyou-step__num serif">2</span>
              <p>Open to the assessment on page 12</p>
            </div>
            <div className="thankyou-step">
              <span className="thankyou-step__num serif">3</span>
              <p>Most people read their result three times</p>
            </div>
          </div>

          <Link to="/" className="btn btn--outline" style={{ marginTop: 48, display: 'inline-block' }}>
            Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </>
  )
}
