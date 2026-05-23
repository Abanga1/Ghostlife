import React, { useEffect, useRef } from 'react'
import { STAGES } from '../data'

export default function StagesSection() {
  const ref = useRef(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal') || []
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section className="stages" ref={ref}>
      <div className="container">
        <p className="section-label reveal">The Framework</p>
        <h2 className="section-title reveal">
          Which stage are you in?
        </h2>
        <p className="reveal" style={{ maxWidth: 560, marginBottom: 0, opacity: 0.75 }}>
          The book includes a 20-question diagnostic quiz. Your score places you
          in one of five stages — each with a different path back.
        </p>
      </div>
      <div className="container--wide">
        <div className="stages__track reveal">
          {STAGES.map(s => (
            <div className="stage-item" key={s.name}>
              <p className="stage-item__name">{s.name}</p>
              <h3 className="stage-item__title">{s.title}</h3>
              <p className="stage-item__score">Score {s.score}</p>
              <p className="stage-item__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
