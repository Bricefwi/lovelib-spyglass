export interface SEOConfig {
  title: string;
  description: string;
  url?: string;
  image?: string;
}

export function buildSEO({ title, description, url, image }: SEOConfig) {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image || '/images/imotion-fallback.jpg' }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image || '/images/imotion-fallback.jpg']
    }
  };
}

export interface ArticleJsonLd {
  headline: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url: string;
}

export function jsonLdArticle({ headline, datePublished, dateModified, author, url }: ArticleJsonLd) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author || 'IMOTION'
    },
    mainEntityOfPage: url
  };
}
