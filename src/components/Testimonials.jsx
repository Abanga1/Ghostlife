import React from 'react'
import { TESTIMONIALS } from '../data'

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <p className="section-label">What Readers Say</p>
        <h2 className="section-title serif">Read before you decide anything.</h2>
      </div>
      <div className="container--wide">
        <div className="testimonials__grid">
          {TESTIMONIALS.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <p className="testimonial-card__quote serif">"{t.quote}"</p>
              <div className="testimonial-card__attr">
                <span className="testimonial-card__name">{t.name}</span>
                <span className="testimonial-card__role">{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
