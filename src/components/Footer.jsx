import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer__brand serif">The Ghost Life Syndrome</p>
        <p className="footer__copy">© 2026. All rights reserved.</p>
        <div className="footer__links">
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/affiliate">Affiliates</Link>
        </div>
      </div>
    </footer>
  )
}
