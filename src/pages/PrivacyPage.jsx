import React from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

function Section({ title, children }) {
  return (
    <div className="policy-section">
      <h2 className="policy-section__title serif">{title}</h2>
      <div className="policy-section__body">{children}</div>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Privacy policy for Ghost Life Syndrome — how we handle your data."
        path="/privacy"
      />
      <nav className="page-nav">
        <div className="container">
          <Link to="/" className="page-nav__back">← Back</Link>
          <span className="page-nav__brand serif">The Ghost Life Syndrome</span>
        </div>
      </nav>

      <main className="page-main">
        <div className="container" style={{ maxWidth: 720 }}>
          <p className="page-label">Last updated: May 2026</p>
          <h1 className="page-title serif">Privacy Policy</h1>

          <Section title="Who We Are">
            <p>This website is owned and operated by Isaac. You can reach us at <a href="mailto:hello@ghostlifesyndrome.com">hello@ghostlifesyndrome.com</a>.</p>
          </Section>

          <Section title="What We Collect">
            <p>We collect information you provide directly:</p>
            <ul>
              <li>Name and email when you subscribe to the newsletter or submit a contact form</li>
              <li>Purchase details processed by LemonSqueezy — we do not store your payment information</li>
              <li>Any message content you submit through our contact form</li>
            </ul>
          </Section>

          <Section title="How We Use Your Information">
            <ul>
              <li>To deliver your purchase and send order confirmation</li>
              <li>To send the newsletter you opted into — unsubscribe any time</li>
              <li>To respond to your inquiries</li>
              <li>To understand how people use the site and improve it</li>
            </ul>
            <p>We do not sell, rent, or share your personal information with third parties for their marketing purposes.</p>
          </Section>

          <Section title="Third-Party Services">
            <p>The following services may process your data:</p>
            <ul>
              <li><strong>LemonSqueezy</strong> — payment processing. Their privacy policy governs transactions.</li>
              <li><strong>Google Fonts</strong> — font delivery. Google may log font requests per their policy.</li>
            </ul>
          </Section>

          <Section title="Cookies">
            <p>This site uses only the cookies necessary for it to function. We do not use advertising or tracking cookies.</p>
          </Section>

          <Section title="Your Rights">
            <p>You can request access to, correction of, or deletion of any personal data we hold. Email <a href="mailto:hello@ghostlifesyndrome.com">hello@ghostlifesyndrome.com</a> and we will respond within 30 days.</p>
          </Section>

          <Section title="Contact">
            <p>Questions about this policy? <a href="mailto:hello@ghostlifesyndrome.com">hello@ghostlifesyndrome.com</a></p>
          </Section>
        </div>
      </main>

      <Footer />
    </>
  )
}
