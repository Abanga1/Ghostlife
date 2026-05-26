import React from 'react'
import { Link } from 'react-router-dom'
import { ARTICLES } from '../data/articles'

const RECENT = ARTICLES.slice(0, 3)

export default function BlogPreview() {
  return (
    <section className="blog-preview">
      <div className="container">
        <div className="blog-preview__grid">
          {RECENT.map(article => (
            <Link key={article.slug} to={`/blog/${article.slug}`} className="blog-preview__card">
              <p className="blog-preview__read">{article.readTime}</p>
              <h3 className="blog-preview__title serif">{article.title}</h3>
              <p className="blog-preview__teaser">{article.intro.slice(0, 140)}…</p>
              <span className="blog-preview__arrow">Read →</span>
            </Link>
          ))}
        </div>
        <div className="blog-preview__footer">
          <Link to="/blog" className="blog-preview__all-btn">View all writing →</Link>
        </div>
      </div>
    </section>
  )
}
