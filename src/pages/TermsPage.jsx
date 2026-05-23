import React from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

function Section({ title, children }) {
  return (
    <div className="policy-section">
      <h2 className="policy-section__title serif">{title}</h2>
      <div className="policy-section__body">{children}</div>
    </div>
  )
}

export default function TermsPage() {
  return (
    <>
      <nav className="page-nav">
        <div className="container">
          <Link to="/" className="page-nav__back">← Back</Link>
          <span className="page-nav__brand serif">The Ghost Life Syndrome</span>
        </div>
      </nav>

      <main className="page-main">
        <div className="container" style={{ maxWidth: 720 }}>
          <p className="page-label">Last updated: May 2026</p>
          <h1 className="page-title serif">Terms of Service</h1>

          <Section title="Acceptance">
            <p>By using this website or purchasing our products, you agree to these terms. If you do not agree, please do not use the site.</p>
          </Section>

          <Section title="Products">
            <p><em>The Ghost Life Syndrome</em> is available as a paperback, hardcover, and digital e-book. Digital products are delivered electronically and are non-transferable.</p>
          </Section>

          <Section title="Payments & Refunds">
            <p>All payments are processed securely by LemonSqueezy. Prices are displayed in USD.</p>
            <p>Digital products (e-books) are non-refundable once delivered, as access is granted immediately upon purchase. If you experience a technical issue with your download, contact us within 7 days and we will resolve it.</p>
            <p>Physical book orders fulfilled through Amazon are subject to Amazon's return policy.</p>
          </Section>

          <Section title="Intellectual Property">
            <p>The Ghost Life Syndrome™, G.H.O.S.T. Framework™, The Resurrection Code™, R.I.S.E.S.™, and Ghost-Proofing Protocol™ are trademarks of the author. All content on this site — text, images, frameworks, and exercises — is protected by copyright.</p>
            <p>You may not reproduce, distribute, or create derivative works from any content without written permission.</p>
          </Section>

          <Section title="Disclaimer">
            <p>This book and website are for informational and educational purposes only. Nothing here constitutes professional mental health, medical, or legal advice. If you are in crisis, please contact a qualified mental health professional.</p>
          </Section>

          <Section title="Limitation of Liability">
            <p>To the maximum extent permitted by law, Isaac shall not be liable for any indirect, incidental, or consequential damages arising from your use of this site or its products.</p>
          </Section>

          <Section title="Changes">
            <p>We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the updated terms.</p>
          </Section>

          <Section title="Contact">
            <p>Questions? <a href="mailto:hello@ghostlifesyndrome.com">hello@ghostlifesyndrome.com</a></p>
          </Section>
        </div>
      </main>

      <Footer />
    </>
  )
}
