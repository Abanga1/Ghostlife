import React from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ARTICLES } from '../data/articles'
import Footer from '../components/Footer'
import SEO from '../components/SEO'

const BASE_URL = 'https://ghostlifesyndrome.com'
const ASSESSMENT_URL = 'https://buy.stripe.com/6oU00j303d8TePO64E67S01'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function parseLinks(str) {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  const parts = []
  let lastIndex = 0
  let match
  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) parts.push(str.slice(lastIndex, match.index))
    const [, text, url] = match
    if (url.startsWith('/')) {
      parts.push(<Link key={match.index} to={url}>{text}</Link>)
    } else {
      parts.push(<a key={match.index} href={url} target="_blank" rel="noreferrer">{text}</a>)
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < str.length) parts.push(str.slice(lastIndex))
  return parts.length > 0 ? parts : str
}

function renderBody(text) {
  return text.split('\n\n').map((para, i) => {
    if (para.startsWith('**') && para.includes('.**\n')) {
      const lines = para.split('\n')
      return lines.map((line, j) => {
        if (!line.trim()) return null
        if (line.startsWith('**')) {
          const boldEnd = line.indexOf('.**')
          if (boldEnd !== -1) {
            const bold = line.slice(2, boldEnd)
            const rest = line.slice(boldEnd + 3)
            return (
              <p key={`${i}-${j}`} className="article__para">
                <strong>{bold}.</strong>{parseLinks(rest)}
              </p>
            )
          }
        }
        return <p key={`${i}-${j}`} className="article__para">{parseLinks(line)}</p>
      })
    }
    return <p key={i} className="article__para">{parseLinks(para)}</p>
  })
}

export default function ArticlePage() {
  const { slug } = useParams()
  const article = ARTICLES.find(a => a.slug === slug)

  if (!article) return <Navigate to="/blog" replace />

  const articleUrl = `${BASE_URL}/blog/${article.slug}`

  return (
    <>
      <SEO
        title={article.title}
        description={article.metaDescription}
        path={`/blog/${article.slug}`}
      />
      <Helmet>
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={article.date} />
        <meta property="article:author" content="Isaac" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.metaDescription,
          datePublished: article.date,
          dateModified: article.date,
          author: { '@type': 'Person', name: 'Isaac', url: BASE_URL },
          publisher: { '@type': 'Organization', name: 'Ghost Life Syndrome', url: BASE_URL },
          url: articleUrl,
          mainEntityOfPage: articleUrl,
          image: `${BASE_URL}/og-image.png`,
        })}</script>
      </Helmet>

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
            <p className="article__cta-label">Find out exactly where you are</p>
            <h3 className="article__cta-title serif">Get the Written Assessment</h3>
            <p className="article__cta-sub">
              Tell me what's going on. I'll send back a detailed written breakdown of your stage and a clear path forward within 48 hours. Four questions. No calls.
            </p>
            <div className="article__cta-actions">
              <a href={ASSESSMENT_URL} className="btn btn--primary" target="_blank" rel="noreferrer">
                Get the Assessment — $56.99
              </a>
              <Link to="/#quiz" className="btn btn--outline">Take the Free Quiz</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
