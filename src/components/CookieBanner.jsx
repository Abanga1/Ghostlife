import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setShow(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setShow(false)
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="cookie-banner">
      <p className="cookie-banner__text">
        This site uses cookies to improve your experience.{' '}
        <Link to="/privacy">Learn more</Link>
      </p>
      <div className="cookie-banner__actions">
        <button className="btn btn--outline cookie-banner__btn" onClick={decline}>
          Decline
        </button>
        <button className="btn btn--primary cookie-banner__btn" onClick={accept}>
          Accept
        </button>
      </div>
    </div>
  )
}
