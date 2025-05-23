import React from 'react';

interface AMPTemplateProps {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  price?: string;
  storeName?: string;
  reviewCount?: number;
  ratingValue?: number;
  contentHtml: string;
  organization?: {
    name: string;
    logo: string;
  };
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  cssStyles?: string;
}

/**
 * AMPTemplate component for generating AMP-compatible HTML
 * Used for serving AMP versions of deal pages to improve mobile performance
 */
const AMPTemplate: React.FC<AMPTemplateProps> = ({
  title,
  description,
  canonicalUrl,
  imageUrl,
  datePublished,
  dateModified = datePublished,
  authorName = 'Sales Aholics Deals',
  price,
  storeName,
  reviewCount,
  ratingValue,
  contentHtml,
  organization = {
    name: 'Sales Aholics Deals',
    logo: 'https://salesaholicsdeals.com/logo.svg'
  },
  breadcrumbs = [],
  faqs = [],
  cssStyles = '',
}) => {
  const baseStyles = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 16px;
    }
    h1 {
      font-size: 24px;
      margin: 24px 0 16px;
      color: #982a4a;
    }
    h2 {
      font-size: 20px;
      margin: 20px 0 12px;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 16px 0;
    }
    .price {
      font-size: 24px;
      font-weight: bold;
      color: #982a4a;
      margin: 16px 0;
    }
    .store {
      font-size: 16px;
      color: #666;
      margin-bottom: 16px;
    }
    .date {
      font-size: 14px;
      color: #888;
      margin-bottom: 24px;
    }
    .breadcrumb {
      display: flex;
      flex-wrap: wrap;
      font-size: 14px;
      list-style: none;
      padding: 0;
      margin: 0 0 16px;
    }
    .breadcrumb li {
      display: inline;
      margin-right: 8px;
    }
    .breadcrumb li:not(:last-child):after {
      content: "›";
      margin-left: 8px;
    }
    .breadcrumb a {
      color: #555;
      text-decoration: none;
    }
    .breadcrumb a:hover {
      text-decoration: underline;
    }
    .header {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      border-bottom: 1px solid #eee;
      padding-bottom: 16px;
    }
    .logo {
      height: 40px;
      margin-right: 12px;
    }
    .site-name {
      font-size: 18px;
      font-weight: bold;
      color: #982a4a;
    }
    .main-content {
      margin-bottom: 32px;
    }
    .faq-section {
      margin-top: 32px;
      border-top: 1px solid #eee;
      padding-top: 24px;
    }
    .faq-item {
      margin-bottom: 16px;
    }
    .faq-question {
      font-weight: bold;
      margin-bottom: 8px;
    }
    .faq-answer {
      margin: 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #eee;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .deal-image-container {
      text-align: center;
    }
    .cta-button {
      display: block;
      background-color: #982a4a;
      color: white;
      text-align: center;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: bold;
      text-decoration: none;
      margin: 24px 0;
    }
    ${cssStyles}
  `;

  // Generate structured data for the deal
  const generateStructuredData = () => {
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: title,
      description: description,
      image: imageUrl,
      ...(price && {
        offers: {
          '@type': 'Offer',
          price: price.replace(/[^0-9.]/g, ''),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: canonicalUrl,
          ...(storeName && { seller: { '@type': 'Organization', name: storeName } })
        }
      }),
      ...((reviewCount && ratingValue) && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: ratingValue,
          reviewCount: reviewCount
        }
      })
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    };

    const faqSchema = faqs.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    } : null;

    return [
      productSchema,
      breadcrumbs.length > 0 ? breadcrumbSchema : null,
      faqs.length > 0 ? faqSchema : null
    ].filter(Boolean);
  };

  return `<!doctype html>
<html ⚡ lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">

  <title>${title}</title>
  <meta name="description" content="${description}">

  <link rel="canonical" href="${canonicalUrl}">
  <link rel="preconnect" href="https://cdn.ampproject.org">

  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-carousel" src="https://cdn.ampproject.org/v0/amp-carousel-0.1.js"></script>
  <script async custom-element="amp-accordion" src="https://cdn.ampproject.org/v0/amp-accordion-0.1.js"></script>
  <script async custom-element="amp-social-share" src="https://cdn.ampproject.org/v0/amp-social-share-0.1.js"></script>
  <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/v0/amp-analytics-0.1.js"></script>

  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>

  <style amp-custom>${baseStyles}</style>

  <script type="application/ld+json">
    ${JSON.stringify(generateStructuredData())}
  </script>
</head>
<body>
  <header class="header">
    <amp-img class="logo" src="${organization.logo}" width="40" height="40" alt="${organization.name} Logo"></amp-img>
    <div class="site-name">${organization.name}</div>
  </header>

  ${breadcrumbs.length > 0 ? `
  <nav aria-label="Breadcrumbs">
    <ol class="breadcrumb">
      ${breadcrumbs.map(crumb => `
        <li><a href="${crumb.url}">${crumb.name}</a></li>
      `).join('')}
    </ol>
  </nav>
  ` : ''}

  <h1>${title}</h1>

  <div class="date">
    <time datetime="${datePublished}">${new Date(datePublished).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
    ${dateModified !== datePublished ? ` (Updated: <time datetime="${dateModified}">${new Date(dateModified).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>)` : ''}
    ${authorName ? ` by ${authorName}` : ''}
  </div>

  ${price ? `<div class="price">${price}</div>` : ''}
  ${storeName ? `<div class="store">Available at ${storeName}</div>` : ''}

  <div class="deal-image-container">
    <amp-img src="${imageUrl}" width="600" height="400" layout="responsive" alt="${title}"></amp-img>
  </div>

  <div class="main-content">
    ${contentHtml}
  </div>

  <a href="${canonicalUrl}" class="cta-button">Get This Deal</a>

  <div class="social-sharing">
    <amp-social-share type="twitter" width="40" height="40"></amp-social-share>
    <amp-social-share type="facebook" width="40" height="40"></amp-social-share>
    <amp-social-share type="pinterest" width="40" height="40"></amp-social-share>
    <amp-social-share type="email" width="40" height="40"></amp-social-share>
  </div>

  ${faqs.length > 0 ? `
  <div class="faq-section">
    <h2>Frequently Asked Questions</h2>
    <amp-accordion>
      ${faqs.map((faq, index) => `
        <section class="faq-item">
          <h3 class="faq-question">${faq.question}</h3>
          <p class="faq-answer">${faq.answer}</p>
        </section>
      `).join('')}
    </amp-accordion>
  </div>
  ` : ''}

  <footer class="footer">
    <p>&copy; ${new Date().getFullYear()} ${organization.name}. All rights reserved.</p>
    <p><a href="${canonicalUrl}">View non-AMP version</a></p>
  </footer>

  <amp-analytics type="googleanalytics">
    <script type="application/json">
    {
      "vars": {
        "account": "UA-XXXXXXXX-X"
      },
      "triggers": {
        "trackPageview": {
          "on": "visible",
          "request": "pageview"
        }
      }
    }
    </script>
  </amp-analytics>
</body>
</html>`;
};

export default AMPTemplate;
