import React from 'react'
import { Link } from 'react-router-dom'
import { ARTICLES } from '../data/articles'
import Footer from '../components/Footer'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function BlogPage() {
  return (
    <>
      <nav className="page-nav">
        <div className="container">
          <Link to="/" className="page-nav__back">← Back</Link>
          <span className="page-nav__brand">Ghost Life Syndrome</span>
        </div>
      </nav>

      <main className="page-main">
        <div className="container">
          <p className="page-label">Writing</p>
          <h1 className="page-title serif">
            On living a <em>real</em> life
          </h1>
          <p className="page-intro">
            Articles on emotional disconnection, self-loss, and the path back.
            No productivity tips. No optimism. Just honest maps.
          </p>

          <div className="blog__grid">
            {ARTICLES.map(article => (
              <article key={article.slug} className="blog-card">
                <div className="blog-card__meta">
                  <span className="blog-card__date">{formatDate(article.date)}</span>
                  <span className="blog-card__read">{article.readTime}</span>
                </div>
                <h2 className="blog-card__title serif">
                  <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                </h2>
                <p className="blog-card__intro">{article.intro}</p>
                <Link to={`/blog/${article.slug}`} className="blog-card__cta">
                  Read article →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
