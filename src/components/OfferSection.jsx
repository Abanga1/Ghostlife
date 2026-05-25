import React, { useEffect, useRef } from 'react'

const URLS = {
  book:       'https://ghostlifesyndrome.lemonsqueezy.com/checkout/buy/61f7d117-9bee-48b0-ab43-c667f95f4ebc',
  assessment: 'https://ghostlifesyndrome.lemonsqueezy.com/checkout/buy/34856ebd-5d34-4e1b-9973-212f8ae74c4e',
  programme:  'https://ghostlifesyndrome.lemonsqueezy.com/checkout/buy/61f7d117-9bee-48b0-ab43-c667f95f4ebc', // TODO: replace with programme product URL
}

const TIERS = [
  {
    tier: 'The Book',
    price: '$16.99',
    priceNote: 'one-time',
    name: 'The Ghost Life Syndrome',
    featured: false,
    badge: null,
    features: [
      'Full PDF — all chapters',
      '15 Signs in full detail',
      '20-question diagnostic quiz',
      '5-stage framework',
      'Stage-specific path forward',
      'Instant digital delivery',
    ],
    url: URLS.book,
    cta: 'Get the Book',
  },
  {
    tier: 'Assessment',
    price: '$56.99',
    priceNote: 'one-time',
    name: 'Written Assessment',
    featured: true,
    badge: 'Most Popular',
    features: [
      'Everything in the book',
      'Structured intake form',
      'Personalised written breakdown',
      'Your specific stage and pattern',
      'Clear written path forward',
      'Delivered within 48 hours',
    ],
    url: URLS.assessment,
    cta: 'Get the Assessment',
  },
  {
    tier: '30-Day Programme',
    price: '$127',
    priceNote: 'per month',
    name: '30-Day Written Coaching',
    featured: false,
    badge: null,
    features: [
      'Everything in the assessment',
      'Private email thread',
      'Weekly written check-ins',
      'Personalised weekly response',
      'No calls, fully async',
      'Cancel any time',
    ],
    url: URLS.programme,
    cta: 'Start the Programme',
  },
]

export default function OfferSection() {
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
    <section className="offer" ref={ref}>
      <div className="container">
        <p className="section-label reveal" style={{ color: 'rgba(243,237,217,0.5)' }}>Choose Your Path</p>
        <h2 className="section-title reveal">
          Start where you are.<br />Go as deep as you need.
        </h2>
        <p className="reveal" style={{ opacity: 0.6, maxWidth: 520 }}>
          No calls. No video. No scheduled sessions.
          Every product is delivered in writing, on your schedule, with your face nowhere in sight.
        </p>
      </div>
      <div className="container--wide">
        <div className="offer__grid reveal">
          {TIERS.map(t => (
            <div
              key={t.tier}
              className={`offer__card${t.featured ? ' offer__card--featured' : ''}`}
            >
              {t.badge && <span className="offer__badge">{t.badge}</span>}
              <p className="offer__tier">{t.tier}</p>
              <p className="offer__price">{t.price}</p>
              <p className="offer__price-note">{t.priceNote}</p>
              <p className="offer__name">{t.name}</p>
              <ul className="offer__features">
                {t.features.map(f => <li key={f}>{f}</li>)}
              </ul>
              <a
                href={t.url}
                className={`btn ${t.featured ? 'btn--outline' : 'btn--primary'}`}
                style={t.featured ? { borderColor: '#F3EDD9', color: '#F3EDD9' } : {}}
                target="_blank"
                rel="noreferrer"
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>
        <p className="reveal" style={{ textAlign: 'center', marginTop: 28, fontSize: 13, opacity: 0.35 }}>
          Secure checkout via Lemon Squeezy. PDF delivered instantly. 30-day refund policy.
        </p>
      </div>
    </section>
  )
}
