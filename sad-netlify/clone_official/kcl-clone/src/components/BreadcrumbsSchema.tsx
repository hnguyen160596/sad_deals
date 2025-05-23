import React from 'react';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  url: string;
  position: number;
}

interface BreadcrumbsSchemaProps {
  items: BreadcrumbItem[];
  homeUrl?: string;
  homeName?: string;
}

/**
 * Component for implementing schema.org BreadcrumbList markup
 * This improves SEO by helping search engines understand your site's structure
 * and enables rich results in Google search
 */
const BreadcrumbsSchema: React.FC<BreadcrumbsSchemaProps> = ({
  items,
  homeUrl = '/',
  homeName = 'Home'
}) => {
  // Ensure the home page is always the first breadcrumb
  const breadcrumbItems = [
    { name: homeName, url: homeUrl, position: 1 },
    ...items.map((item, index) => ({ ...item, position: index + 2 }))
  ];

  // Create the structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems.map(item => ({
      '@type': 'ListItem',
      'position': item.position,
      'item': {
        '@id': item.url,
        'name': item.name
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};

export default BreadcrumbsSchema;
