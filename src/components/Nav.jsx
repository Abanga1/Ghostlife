import React, { useState, useEffect } from 'react'

const BOOK_URL = 'https://ghostlifesyndrome.lemonsqueezy.com/checkout/buy/61f7d117-9bee-48b0-ab43-c667f95f4ebc'

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
          </nav>
          <a href={BOOK_URL} className="btn btn--primary nav__cta" target="_blank" rel="noreferrer">
            Get the Book
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
          <a href={BOOK_URL} className="btn btn--primary" target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
            Get the Book — $17
          </a>
        </div>
      )}
    </>
  )
}
