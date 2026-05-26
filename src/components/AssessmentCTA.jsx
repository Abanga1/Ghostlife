import React, { useEffect, useRef } from 'react'

const ASSESSMENT_URL = 'https://buy.stripe.com/6oU00j303d8TePO64E67S01'

export default function AssessmentCTA() {
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
    <section className="assess-cta" ref={ref}>
      <div className="container assess-cta__inner">
        <p className="assess-cta__eyebrow reveal">Written Assessment</p>
        <h2 className="serif assess-cta__title reveal">Find out exactly where you are.</h2>
        <p className="assess-cta__sub reveal">
          Tell me what's going on. I'll send back a detailed written breakdown of your stage
          and a clear path forward within 48 hours. Four questions. No calls. Entirely in writing.
        </p>
        <div className="reveal">
          <a
            href={ASSESSMENT_URL}
            className="btn btn--primary assess-cta__btn"
            target="_blank"
            rel="noreferrer"
          >
            Get the Assessment — $56.99
          </a>
        </div>
        <p className="assess-cta__note reveal">Secure checkout via Stripe. Delivered within 48 hours.</p>
      </div>
    </section>
  )
}
