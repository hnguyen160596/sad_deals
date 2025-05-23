import React from 'react';
import { Helmet } from 'react-helmet-async';

interface EventOffer {
  price: number;
  priceCurrency: string;
  url?: string;
  validFrom?: string; // ISO 8601 format
  availability?: 'InStock' | 'SoldOut' | 'PreOrder';
}

interface EventLocation {
  type: 'Place' | 'VirtualLocation';
  name: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  url?: string; // For VirtualLocation
}

interface EventPerformer {
  name: string;
  url?: string;
}

interface EventSchemaProps {
  name: string;
  description: string;
  startDate: string; // ISO 8601 format
  endDate: string; // ISO 8601 format
  imageUrl?: string;
  url?: string;
  location: EventLocation;
  offers?: EventOffer[];
  performers?: EventPerformer[];
  organizer?: {
    name: string;
    url?: string;
  };
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed' | 'EventRescheduled' | 'EventMovedOnline';
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
  previousStartDate?: string; // ISO 8601 format, for rescheduled events
}

/**
 * Component for implementing schema.org Event markup
 * This helps search engines understand event information and enables rich event snippets
 * in search results with dates, locations, and ticket information
 */
const EventSchema: React.FC<EventSchemaProps> = ({
  name,
  description,
  startDate,
  endDate,
  imageUrl,
  url,
  location,
  offers = [],
  performers = [],
  organizer,
  eventStatus = 'EventScheduled',
  eventAttendanceMode = location.type === 'VirtualLocation' ? 'OnlineEventAttendanceMode' : 'OfflineEventAttendanceMode',
  previousStartDate
}) => {
  // Build the basic event schema
  const eventSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': name,
    'description': description,
    'startDate': startDate,
    'endDate': endDate,
    'eventStatus': `https://schema.org/${eventStatus}`,
    'eventAttendanceMode': `https://schema.org/${eventAttendanceMode}`
  };

  // Add optional properties
  if (imageUrl) eventSchema.image = imageUrl;
  if (url) eventSchema.url = url;
  if (previousStartDate) eventSchema.previousStartDate = previousStartDate;

  // Add location based on type
  if (location.type === 'Place') {
    eventSchema.location = {
      '@type': 'Place',
      'name': location.name,
      ...(location.address && {
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': location.address.streetAddress,
          'addressLocality': location.address.addressLocality,
          'addressRegion': location.address.addressRegion,
          'postalCode': location.address.postalCode,
          'addressCountry': location.address.addressCountry
        }
      })
    };
  } else if (location.type === 'VirtualLocation') {
    eventSchema.location = {
      '@type': 'VirtualLocation',
      'name': location.name,
      ...(location.url && { 'url': location.url })
    };
  }

  // Add offers if any exist
  if (offers.length > 0) {
    eventSchema.offers = offers.map(offer => ({
      '@type': 'Offer',
      'price': offer.price,
      'priceCurrency': offer.priceCurrency,
      ...(offer.url && { 'url': offer.url }),
      ...(offer.validFrom && { 'validFrom': offer.validFrom }),
      ...(offer.availability && { 'availability': `https://schema.org/${offer.availability}` })
    }));
  }

  // Add performers if any exist
  if (performers.length > 0) {
    eventSchema.performer = performers.map(performer => ({
      '@type': 'Person',
      'name': performer.name,
      ...(performer.url && { 'url': performer.url })
    }));
  }

  // Add organizer if provided
  if (organizer) {
    eventSchema.organizer = {
      '@type': 'Organization',
      'name': organizer.name,
      ...(organizer.url && { 'url': organizer.url })
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(eventSchema)}
      </script>
    </Helmet>
  );
};

export default EventSchema;
