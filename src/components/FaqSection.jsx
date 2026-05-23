import React, { useState, useEffect, useRef } from 'react'
import { FAQS } from '../data'

export default function FaqSection() {
  const [open, setOpen] = useState(null)
  const [visible, setVisible] = useState(new Set())
  const ref = useRef(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal') || []
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = e.target.dataset.idx
          setVisible(prev => new Set([...prev, idx ?? 'static']))
        }
      }),
      { threshold: 0.1 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  function cls(...parts) { return parts.filter(Boolean).join(' ') }

  return (
    <section className="faq" ref={ref}>
      <div className="container">
        <p className={cls('section-label reveal', visible.has('static') && 'visible')}>Questions</p>
        <h2 className={cls('section-title reveal', visible.has('static') && 'visible')}>Common questions</h2>
        <div className="faq__list">
          {FAQS.map((item, i) => (
            <div
              key={i}
              data-idx={String(i)}
              className={cls(
                'faq__item reveal',
                visible.has(String(i)) && 'visible',
                open === i && 'faq__item--open'
              )}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="faq__q">
                {item.q}
                <span className="faq__icon">+</span>
              </div>
              <div className="faq__a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
