import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
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

const SEO: React.FC<SEOProps> = ({
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
    name: 'Sales Aholics Deals',
    logo: 'https://salesaholicsdeals.com/logo.svg'
  },
}) => {
  // Default website structured data
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: title,
    description: description,
    url: canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://salesaholicsdeals.com'),
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
      <meta property="og:url" content={canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://salesaholicsdeals.com')} />
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
      name: article.publisherName || 'Sales Aholics Deals',
      logo: {
        '@type': 'ImageObject',
        url: article.publisherLogo || 'https://salesaholicsdeals.com/logo.svg'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url || 'https://salesaholicsdeals.com'
    }
  };
};

// Helper function to create LocalBusiness structured data
export const createLocalBusinessStructuredData = (business: {
  name: string;
  description: string;
  image?: string;
  telephone?: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  priceRange?: string;
  url?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    ...(business.image && { image: business.image }),
    ...(business.telephone && { telephone: business.telephone }),
    address: {
      '@type': 'PostalAddress',
      ...business.address
    },
    ...(business.priceRange && { priceRange: business.priceRange }),
    ...(business.url && { url: business.url })
  };
};

export default SEO;
