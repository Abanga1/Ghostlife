import React from 'react'

const BOOK_URL = 'https://buy.stripe.com/7sY7sLdEH8SD0YY8cM67S00'

export default function Hero({ onEmailClick }) {
  return (
    <section className="hero">
      <div className="hero__noise" />
      <div className="container--wide hero__inner">
        <div className="hero__text">
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
            <button className="btn btn--outline hero__outline-btn" onClick={onEmailClick}>
              Read Chapter One Free
            </button>
          </div>
          <p className="hero__proof">6,000+ readers · Rated 4.9 stars</p>
        </div>
      </div>
      <p className="hero__scroll">scroll</p>
    </section>
  )
}
