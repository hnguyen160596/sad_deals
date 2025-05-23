import React from 'react';
import { Helmet } from 'react-helmet-async';

interface AggregateRatingSchemaProps {
  itemType: 'Product' | 'Organization' | 'LocalBusiness' | 'Course' | 'Event' | 'Brand' | 'CreativeWork';
  name: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  ratingValue: number;
  ratingCount: number;
  bestRating?: number;
  worstRating?: number;
  additionalData?: Record<string, any>;
}

/**
 * Component for implementing schema.org AggregateRating markup
 * This helps display star ratings in search results, increasing visibility and click-through rates
 * Can be used for products, organizations, local businesses, and more
 */
const AggregateRatingSchema: React.FC<AggregateRatingSchemaProps> = ({
  itemType,
  name,
  description,
  imageUrl,
  url,
  ratingValue,
  ratingCount,
  bestRating = 5,
  worstRating = 1,
  additionalData = {}
}) => {
  // Build the schema
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': itemType,
    'name': name,
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': ratingValue,
      'ratingCount': ratingCount,
      'bestRating': bestRating,
      'worstRating': worstRating
    },
    ...additionalData
  };

  // Add optional properties
  if (description) schema.description = description;
  if (imageUrl) schema.image = imageUrl;
  if (url) schema.url = url;

  // Add specific properties based on item type
  if (itemType === 'Product' && !schema.offers) {
    schema.offers = {
      '@type': 'AggregateOffer',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock'
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default AggregateRatingSchema;
