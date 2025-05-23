import React from 'react';
import { Helmet } from 'react-helmet-async';

interface BusinessLocation {
  id: string;
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  telephone: string;
  image?: string;
  url?: string;
  priceRange?: string;
  openingHours?: {
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }[];
}

interface LocalBusinessSchemaProps {
  business: BusinessLocation;
  sameAs?: string[];
  description?: string;
  additionalTypes?: string[];
}

/**
 * Component for adding LocalBusiness schema.org markup to pages
 */
const LocalBusinessSchema: React.FC<LocalBusinessSchemaProps> = ({
  business,
  sameAs = [],
  description = '',
  additionalTypes = []
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${business.url || window.location.origin}#LocalBusiness`,
    name: business.name,
    address: {
      '@type': 'PostalAddress',
      ...business.address
    },
    ...(business.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: business.geo.latitude,
        longitude: business.geo.longitude
      }
    }),
    telephone: business.telephone,
    ...(business.url && { url: business.url }),
    ...(business.image && { image: business.image }),
    ...(description && { description }),
    ...(business.priceRange && { priceRange: business.priceRange }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(additionalTypes.length > 0 && {
      additionalType: additionalTypes
    }),
  };

  // Add opening hours if available
  if (business.openingHours && business.openingHours.length > 0) {
    schema.openingHoursSpecification = business.openingHours.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.dayOfWeek,
      opens: hours.opens,
      closes: hours.closes
    }));
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Example of multiple locations organization schema
export const OrganizationWithLocationsSchema: React.FC<{
  organizationName: string;
  organizationLogo: string;
  organizationUrl: string;
  locations: BusinessLocation[];
}> = ({ organizationName, organizationLogo, organizationUrl, locations }) => {
  // Create the main organization schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${organizationUrl}#organization`,
    name: organizationName,
    url: organizationUrl,
    logo: organizationLogo,
    // Include references to all locations
    location: locations.map(location => ({
      '@type': 'LocalBusiness',
      '@id': `${organizationUrl}/locations/${location.id}#LocalBusiness`,
      name: location.name,
      address: {
        '@type': 'PostalAddress',
        ...location.address
      },
      telephone: location.telephone
    }))
  };

  // Create individual location schemas
  const locationSchemas = locations.map(location => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${organizationUrl}/locations/${location.id}#LocalBusiness`,
    name: `${organizationName} - ${location.name}`,
    address: {
      '@type': 'PostalAddress',
      ...location.address
    },
    ...(location.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: location.geo.latitude,
        longitude: location.geo.longitude
      }
    }),
    telephone: location.telephone,
    ...(location.url && { url: location.url }),
    ...(location.image && { image: location.image }),
    ...(location.priceRange && { priceRange: location.priceRange }),
    parentOrganization: {
      '@type': 'Organization',
      '@id': `${organizationUrl}#organization`
    }
  }));

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      {locationSchemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default LocalBusinessSchema;
