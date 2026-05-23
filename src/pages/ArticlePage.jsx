import React from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ARTICLES } from '../data/articles'
import Footer from '../components/Footer'

const BOOK_URL = 'https://ghostlifesyndrome.lemonsqueezy.com/checkout/buy/61f7d117-9bee-48b0-ab43-c667f95f4ebc'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function renderBody(text) {
  return text.split('\n\n').map((para, i) => {
    if (para.startsWith('**') && para.includes('.**\n')) {
      const parts = para.split('\n')
      return parts.map((line, j) => {
        if (!line.trim()) return null
        if (line.startsWith('**')) {
          const boldEnd = line.indexOf('.**')
          if (boldEnd !== -1) {
            const bold = line.slice(2, boldEnd)
            const rest = line.slice(boldEnd + 3)
            return (
              <p key={`${i}-${j}`} className="article__para">
                <strong>{bold}.</strong>{rest}
              </p>
            )
          }
        }
        return <p key={`${i}-${j}`} className="article__para">{line}</p>
      })
    }
    return <p key={i} className="article__para">{para}</p>
  })
}

export default function ArticlePage() {
  const { slug } = useParams()
  const article = ARTICLES.find(a => a.slug === slug)

  if (!article) return <Navigate to="/blog" replace />

  return (
    <>
      <nav className="page-nav">
        <div className="container">
          <Link to="/blog" className="page-nav__back">← All articles</Link>
          <span className="page-nav__brand">Ghost Life Syndrome</span>
        </div>
      </nav>

      <main className="article-main">
        <div className="container container--article">
          <div className="article__header">
            <div className="article__meta">
              <span className="article__date">{formatDate(article.date)}</span>
              <span className="article__sep">·</span>
              <span className="article__read">{article.readTime}</span>
            </div>
            <h1 className="article__title serif">{article.title}</h1>
            <p className="article__intro">{article.intro}</p>
          </div>

          <div className="article__body">
            {article.sections.map((section, i) => (
              <div key={i} className="article__section">
                <h2 className="article__section-title serif">{section.heading}</h2>
                <div className="article__section-body">
                  {renderBody(section.body)}
                </div>
              </div>
            ))}
          </div>

          <div className="article__cta">
            <p className="article__cta-label">Find your stage</p>
            <h3 className="article__cta-title serif">Take the Ghost Life Syndrome quiz</h3>
            <p className="article__cta-sub">
              20 questions. Places you in one of five stages of disconnection. Free.
            </p>
            <div className="article__cta-actions">
              <Link to="/#quiz" className="btn btn--primary">Take the Quiz</Link>
              <a href={BOOK_URL} className="btn btn--outline" target="_blank" rel="noreferrer">
                Get the Book — $17
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
