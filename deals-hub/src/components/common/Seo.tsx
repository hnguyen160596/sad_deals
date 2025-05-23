import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: object;
  additionalMetaTags?: Array<{ name: string; content: string }>;
  additionalLinkTags?: Array<{ rel: string; href: string; hreflang?: string }>;
  noindex?: boolean;
  language?: string;
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  organization?: {
    name: string;
    logo: string;
  };
}

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage = '/images/og-default.jpg',
  ogType = 'website',
  ogTitle,
  ogDescription,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  structuredData,
  additionalMetaTags = [],
  additionalLinkTags = [],
  noindex = false,
  language = 'en',
  publishedAt,
  modifiedAt,
  author,
  organization = {
    name: 'DealsHub',
    logo: 'https://deals-hub.com/logo.svg'
  },
}) => {
  // Default website structured data
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: title,
    description: description,
    url: canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://deals-hub.com'),
    inLanguage: language,
    publisher: {
      '@type': 'Organization',
      name: organization.name,
      logo: {
        '@type': 'ImageObject',
        url: organization.logo
      }
    }
  };

  // Generate appropriate JSON-LD structured data
  const generateStructuredData = () => {
    // Use provided structured data if available
    if (structuredData) {
      return JSON.stringify(structuredData);
    }

    // Otherwise use default website structured data
    return JSON.stringify(defaultStructuredData);
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="language" content={language} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Dates for content pages */}
      {publishedAt && <meta name="article:published_time" content={publishedAt} />}
      {modifiedAt && <meta name="article:modified_time" content={modifiedAt} />}
      {author && <meta name="author" content={author} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://deals-hub.com')} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={organization.name} />
      <meta property="og:locale" content={language} />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || ogTitle || title} />
      <meta name="twitter:description" content={twitterDescription || ogDescription || description} />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}

      {/* Additional Meta Tags */}
      {additionalMetaTags.map((tag, index) => (
        <meta key={index} name={tag.name} content={tag.content} />
      ))}

      {/* Additional Link Tags (for hreflang, etc.) */}
      {additionalLinkTags.map((tag, index) => (
        <link key={index} rel={tag.rel} href={tag.href} hrefLang={tag.hreflang} />
      ))}

      {/* Structured Data for Rich Results */}
      <script type="application/ld+json">{generateStructuredData()}</script>
    </Helmet>
  );
};

// Helper function to create Product structured data
export const createProductStructuredData = (product: {
  name: string;
  description: string;
  image: string;
  price: string;
  currency?: string;
  availability?: string;
  url?: string;
  brand?: string;
  sku?: string;
  reviewCount?: number;
  ratingValue?: number;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price.replace(/[^0-9.]/g, ''),
      priceCurrency: product.currency || 'USD',
      availability: product.availability || 'https://schema.org/InStock',
      url: product.url || undefined
    },
    ...(product.brand && { brand: { '@type': 'Brand', name: product.brand } }),
    ...(product.sku && { sku: product.sku }),
    ...(product.reviewCount && product.ratingValue && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingValue,
        reviewCount: product.reviewCount
      }
    })
  };
};

// Helper function to create Article structured data
export const createArticleStructuredData = (article: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  publisherName?: string;
  publisherLogo?: string;
  url?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.authorName
    },
    publisher: {
      '@type': 'Organization',
      name: article.publisherName || 'DealsHub',
      logo: {
        '@type': 'ImageObject',
        url: article.publisherLogo || 'https://deals-hub.com/logo.svg'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url || 'https://deals-hub.com'
    }
  };
};

// Helper function to create Breadcrumb structured data
export const createBreadcrumbStructuredData = (breadcrumbs: Array<{
  name: string;
  url: string;
}>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url
    }))
  };
};

// Helper function to create FAQ structured data
export const createFAQStructuredData = (faqs: Array<{
  question: string;
  answer: string;
}>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

// Helper function to create Review structured data
export const createReviewStructuredData = (review: {
  reviewBody: string;
  ratingValue: number;
  author: string;
  datePublished: string;
  itemReviewed: {
    name: string;
    image?: string;
  };
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.ratingValue,
      bestRating: 5
    },
    author: {
      '@type': 'Person',
      name: review.author
    },
    datePublished: review.datePublished,
    itemReviewed: {
      '@type': 'Product',
      name: review.itemReviewed.name,
      image: review.itemReviewed.image
    }
  };
};

// Helper function to create enhanced offer structured data
export const createOfferStructuredData = (offer: {
  price: string | number;
  currency?: string;
  availability?: string;
  url?: string;
  validFrom?: string;
  validThrough?: string;
  priceValidUntil?: string;
  seller?: {
    name: string;
    url?: string;
  };
}) => {
  return {
    '@type': 'Offer',
    price: typeof offer.price === 'string' ? offer.price.replace(/[^0-9.]/g, '') : offer.price,
    priceCurrency: offer.currency || 'USD',
    availability: offer.availability || 'https://schema.org/InStock',
    url: offer.url,
    ...(offer.validFrom && { validFrom: offer.validFrom }),
    ...(offer.validThrough && { validThrough: offer.validThrough }),
    ...(offer.priceValidUntil && { priceValidUntil: offer.priceValidUntil }),
    ...(offer.seller && {
      seller: {
        '@type': 'Organization',
        name: offer.seller.name,
        ...(offer.seller.url && { url: offer.seller.url })
      }
    })
  };
};

export default Seo;
