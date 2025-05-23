import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ProductReview {
  author: string;
  rating: number;
  reviewBody?: string;
  datePublished?: string;
}

interface ProductSchemaProps {
  name: string;
  description: string;
  imageUrl: string;
  url: string;
  brand?: string;
  sku?: string;
  gtin?: string; // Can be UPC, EAN, or ISBN
  mpn?: string; // Manufacturer Part Number
  price?: number;
  priceCurrency?: string;
  priceValidUntil?: string; // ISO 8601 date format
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  category?: string;
  reviews?: ProductReview[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  seller?: {
    name: string;
    url?: string;
  };
  offers?: {
    price: number;
    priceCurrency: string;
    priceValidUntil?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    url?: string;
    seller?: {
      name: string;
      url?: string;
    };
  }[];
}

/**
 * Component for implementing schema.org Product markup
 * This improves SEO by enabling rich product results in Google search
 * with pricing, availability, ratings, and more
 */
const ProductSchema: React.FC<ProductSchemaProps> = ({
  name,
  description,
  imageUrl,
  url,
  brand,
  sku,
  gtin,
  mpn,
  price,
  priceCurrency = 'USD',
  priceValidUntil,
  availability = 'InStock',
  category,
  reviews = [],
  aggregateRating,
  seller,
  offers = []
}) => {
  // Create the structured data
  const productSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': name,
    'description': description,
    'image': imageUrl,
    'url': url
  };

  // Add optional properties if they exist
  if (brand) productSchema.brand = { '@type': 'Brand', 'name': brand };
  if (sku) productSchema.sku = sku;
  if (gtin) productSchema.gtin = gtin;
  if (mpn) productSchema.mpn = mpn;
  if (category) productSchema.category = category;

  // Add seller information
  if (seller) {
    productSchema.seller = {
      '@type': 'Organization',
      'name': seller.name,
      ...(seller.url && { 'url': seller.url })
    };
  }

  // Add price and availability if direct price is provided
  if (price !== undefined) {
    productSchema.offers = {
      '@type': 'Offer',
      'price': price,
      'priceCurrency': priceCurrency,
      'availability': `https://schema.org/${availability}`,
      ...(priceValidUntil && { 'priceValidUntil': priceValidUntil }),
      ...(url && { 'url': url }),
      ...(seller && {
        'seller': {
          '@type': 'Organization',
          'name': seller.name,
          ...(seller.url && { 'url': seller.url })
        }
      })
    };
  }

  // Add multiple offers if available
  if (offers && offers.length > 0) {
    productSchema.offers = offers.map(offer => ({
      '@type': 'Offer',
      'price': offer.price,
      'priceCurrency': offer.priceCurrency || priceCurrency,
      'availability': `https://schema.org/${offer.availability || 'InStock'}`,
      ...(offer.priceValidUntil && { 'priceValidUntil': offer.priceValidUntil }),
      ...(offer.url && { 'url': offer.url }),
      ...(offer.seller && {
        'seller': {
          '@type': 'Organization',
          'name': offer.seller.name,
          ...(offer.seller.url && { 'url': offer.seller.url })
        }
      })
    }));
  }

  // Add reviews if available
  if (reviews && reviews.length > 0) {
    productSchema.review = reviews.map(review => ({
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': review.author
      },
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': review.rating
      },
      ...(review.reviewBody && { 'reviewBody': review.reviewBody }),
      ...(review.datePublished && { 'datePublished': review.datePublished })
    }));
  }

  // Add aggregate rating if available
  if (aggregateRating) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': aggregateRating.ratingValue,
      'reviewCount': aggregateRating.reviewCount
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
    </Helmet>
  );
};

export default ProductSchema;
