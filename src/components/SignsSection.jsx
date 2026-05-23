import React, { useEffect, useRef } from 'react'
import { SIGNS } from '../data'

export default function SignsSection() {
  const ref = useRef(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal') || []
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.08 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section className="signs" ref={ref}>
      <div className="container">
        <p className="section-label reveal">Chapter One</p>
        <h2 className="section-title reveal">
          15 Signs You Are Living a Ghost Life
        </h2>
      </div>
      <div className="container--wide">
        <div className="signs__grid">
          {SIGNS.map(s => (
            <div className="sign-card reveal" key={s.num}>
              <p className="sign-card__num">Sign {s.num}</p>
              <h3 className="sign-card__title">{s.title}</h3>
              <p className="sign-card__body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
