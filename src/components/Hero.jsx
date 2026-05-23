import React from 'react'

// Replace these with your actual Lemon Squeezy product URLs
const BOOK_URL = 'https://ghostlifesyndrome.lemonsqueezy.com/checkout/buy/61f7d117-9bee-48b0-ab43-c667f95f4ebc'

export default function Hero({ onEmailClick }) {
  return (
    <section className="hero">
      <img
        src="/cover.png"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 0,
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(10,10,20,0.45) 0%, rgba(10,10,20,0.65) 50%, rgba(10,10,20,0.93) 100%)',
        zIndex: 1,
      }} />
      <div className="hero__noise" style={{ zIndex: 2 }} />
      <div style={{ position: 'relative', zIndex: 3 }}>
        <p className="hero__eyebrow">A Book About What Nobody Names</p>
        <h1 className="hero__title">
          The Ghost<br />
          <em>Life</em> Syndrome
        </h1>
        <p className="hero__sub">
          You function. You show up. You say the right things.
          But somewhere along the way, you stopped feeling like
          you were actually living — and started watching instead.
        </p>
        <div className="hero__cta-group">
          <a href={BOOK_URL} className="btn btn--primary" target="_blank" rel="noreferrer">
            Get the Book — $17
          </a>
          <button className="btn btn--outline" onClick={onEmailClick} style={{ color: '#F3EDD9', borderColor: '#F3EDD9' }}>
            Read Chapter One Free
          </button>
        </div>
      </div>
      <p className="hero__scroll">scroll</p>
    </section>
  )
}
