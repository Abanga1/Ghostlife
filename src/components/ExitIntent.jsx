import React from 'react'

export default function ExitIntent({ onClose, onEmailClick }) {

  return (
    <div className="exit-overlay" onClick={e => e.target === e.currentTarget && onClose('dismiss')}>
      <div className="exit-box">
        <button className="exit-close" onClick={() => onClose('dismiss')} aria-label="Close">×</button>
        <p className="exit-box__eyebrow">Wait — one thing</p>
        <h2 className="exit-box__title">
          Take Chapter One with you. It's free.
        </h2>
        <p className="exit-box__sub">
          15 signs. A 20-question quiz. The 5-stage framework.
          No purchase required.
        </p>
        <button className="btn btn--primary" onClick={() => { onClose('email'); onEmailClick() }}>
          Send me the free chapter
        </button>
        <p style={{ marginTop: 16, fontSize: 12, opacity: 0.4 }}>
          No spam. One email. Unsubscribe any time.
        </p>
      </div>
    </div>
  )
}
