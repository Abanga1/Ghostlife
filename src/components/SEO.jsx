import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://ghostlifesyndrome.com'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

export default function SEO({ title, description, path = '', image = DEFAULT_IMAGE }) {
  const fullTitle = title ? `${title} | Ghost Life Syndrome` : 'The Ghost Life Syndrome'
  const url = `${BASE_URL}${path}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
