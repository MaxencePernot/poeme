import { Helmet } from 'react-helmet-async';

const SITE = 'Rachel entre lignes';
const BASE = 'https://rachelentrelignes.netlify.app';

// Gère les balises <title>, description, canonical et Open Graph par page.
export default function Seo({
  title,
  description = 'Un espace personnel de poésie, de lecture et de photographie.',
  path = '/',
  image = '/og-image.svg',
  type = 'website',
  noindex = false,
}) {
  const fullTitle = title ? `${title} — ${SITE}` : SITE;
  const url = `${BASE}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image.startsWith('http') ? image : `${BASE}${image}`} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
