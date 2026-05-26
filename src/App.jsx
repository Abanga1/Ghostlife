import React, { useState, useCallback, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { loadGA, isConsented } from './analytics'
import SEO from './components/SEO'
import Nav from './components/Nav'
import Hero from './components/Hero'
import PainSection from './components/PainSection'
import SignsSection from './components/SignsSection'
import StagesSection from './components/StagesSection'
import Quiz from './components/Quiz'
import Testimonials from './components/Testimonials'
import OfferSection from './components/OfferSection'
import EmailCapture from './components/EmailCapture'
import FaqSection from './components/FaqSection'
import ExitIntent from './components/ExitIntent'
import Footer from './components/Footer'
import CookieBanner from './components/CookieBanner'
import ContactPage from './pages/ContactPage'
import CoachPage from './pages/CoachPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import AffiliatePage from './pages/AffiliatePage'
import ThankYouPage from './pages/ThankYouPage'
import BlogPage from './pages/BlogPage'
import ArticlePage from './pages/ArticlePage'
import AssessmentPage from './pages/AssessmentPage'
import ClientPortal from './pages/ClientPortal'
import AssessmentCTA from './components/AssessmentCTA'
import BlogPreview from './components/BlogPreview'

function HomePage() {
  const [showExit, setShowExit] = useState(false)
  const [exitFired, setExitFired] = useState(false)

  useEffect(() => { if (isConsented()) loadGA() }, [])

  function handleExitClose(reason) {
    setShowExit(false)
    setExitFired(true)
    if (reason === 'email') scrollToEmail()
  }

  function scrollToEmail() {
    document.getElementById('email-capture')?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    function handleMouseLeave(e) {
      if (e.clientY <= 8 && !exitFired) setShowExit(true)
    }
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [exitFired])

  return (
    <>
      <SEO
        description="Are you living your life or watching it from a distance? The Ghost Life Syndrome names what you've been feeling — and maps the way back."
        path="/"
      />
      {showExit && (
        <ExitIntent onClose={handleExitClose} onEmailClick={scrollToEmail} />
      )}
      <Nav />
      <Hero onEmailClick={scrollToEmail} />
      <PainSection />
      <div className="divider">◆ ◆ ◆</div>
      <div id="signs"><SignsSection /></div>
      <div className="divider">◆ ◆ ◆</div>
      <div id="stages"><StagesSection /></div>
      <div id="quiz"><Quiz /></div>
      <EmailCapture id="email-capture" />
      <div id="testimonials"><Testimonials /></div>
      <div id="pricing"><OfferSection /></div>
      <div className="divider">◆ ◆ ◆</div>
      <div id="faq"><FaqSection /></div>
      <AssessmentCTA />
      <BlogPreview />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/affiliate" element={<AffiliatePage />} />
        <Route path="/thank-you" element={<ThankYouPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<ArticlePage />} />
        <Route path="/coach" element={<CoachPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/portal" element={<ClientPortal />} />
      </Routes>
      <CookieBanner />
    </>
  )
}
