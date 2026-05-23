import React, { useEffect, useRef } from 'react'

const PAINS = [
  {
    num: '01',
    text: 'You watch your own life from a slight distance — present enough to function, absent enough to feel like a passenger.',
  },
  {
    num: '02',
    text: 'The feelings come delayed or not at all. You wait for them in the shower three days later.',
  },
  {
    num: '03',
    text: 'You have gotten very good at sounding fine. The performance is so polished that most people believe it — and some days, almost, so do you.',
  },
]

export default function PainSection() {
  const ref = useRef(null)

  useEffect(() => {
    const els = ref.current?.querySelectorAll('.reveal') || []
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.15 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section className="pain" ref={ref}>
      <div className="container">
        <p className="pain__intro reveal serif">
          This is not depression. It is not burnout. It is something quieter —
          the slow withdrawal of yourself from your own life, so gradual
          you did not notice until the gap became the default.
        </p>
      </div>
      <div className="container--wide">
        <div className="pain__cards">
          {PAINS.map(p => (
            <div className="pain__card reveal" key={p.num}>
              <p className="pain__card-num">Sign {p.num}</p>
              <p className="pain__card-text">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
