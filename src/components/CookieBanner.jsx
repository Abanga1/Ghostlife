import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) setShow(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="cookie-banner">
      <p className="cookie-banner__text">
        This site uses cookies to improve your experience.{' '}
        <Link to="/privacy">Learn more</Link>
      </p>
      <button className="btn btn--primary cookie-banner__btn" onClick={accept}>
        Accept
      </button>
    </div>
  )
}
