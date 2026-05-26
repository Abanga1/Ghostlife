import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const ASSESSMENT_URL = 'https://buy.stripe.com/6oU00j303d8TePO64E67S01'

const LINKS = [
  { label: 'The Signs', id: 'signs' },
  { label: 'Stages', id: 'stages' },
  { label: 'Take the Quiz', id: 'quiz' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'FAQ', id: 'faq' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <>
      <header className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
        <div className="nav__inner container--wide">
          <button className="nav__brand serif" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Ghost Life Syndrome
          </button>
          <nav className="nav__links">
            {LINKS.map(l => (
              <button key={l.id} className="nav__link" onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            ))}
            <Link to="/blog" className="nav__link" style={{ textDecoration: 'none' }}>Writing</Link>
          </nav>
          <a href={ASSESSMENT_URL} className="btn btn--primary nav__cta" target="_blank" rel="noreferrer">
            Get Assessed
          </a>
          <button
            className={`nav__hamburger${open ? ' nav__hamburger--open' : ''}`}
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {open && (
        <div className="nav__mobile-menu">
          <button className="nav__mobile-close" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
          {LINKS.map(l => (
            <button key={l.id} className="nav__mobile-link serif" onClick={() => scrollTo(l.id)}>
              {l.label}
            </button>
          ))}
          <Link to="/blog" className="nav__mobile-link serif" style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>Writing</Link>
          <a href={ASSESSMENT_URL} className="btn btn--primary" target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
            Get Assessed — $56.99
          </a>
        </div>
      )}
    </>
  )
}
