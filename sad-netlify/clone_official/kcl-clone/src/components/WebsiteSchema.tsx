import React from 'react';
import { Helmet } from 'react-helmet-async';

interface WebsiteSchemaProps {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string;
  potentialActions?: Array<{
    type: 'SearchAction' | 'OrderAction' | 'DownloadAction';
    target: string;
    queryInput?: string;
  }>;
  sameAs?: string[];
  alternateName?: string[];
  publisher?: {
    name: string;
    logo?: string;
  };
  inLanguage?: string | string[];
}

/**
 * Component for implementing schema.org WebSite markup
 * This helps search engines understand your site's identity, search functionality,
 * and relationship to social profiles
 */
const WebsiteSchema: React.FC<WebsiteSchemaProps> = ({
  name,
  url,
  description,
  searchUrl,
  potentialActions = [],
  sameAs = [],
  alternateName = [],
  publisher,
  inLanguage = 'en-US'
}) => {
  // Build the basic website schema
  const websiteSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': name,
    'url': url
  };

  // Add optional properties
  if (description) websiteSchema.description = description;
  if (alternateName.length > 0) websiteSchema.alternateName = alternateName;
  if (sameAs.length > 0) websiteSchema.sameAs = sameAs;
  if (inLanguage) websiteSchema.inLanguage = inLanguage;

  // Add publisher information if provided
  if (publisher) {
    websiteSchema.publisher = {
      '@type': 'Organization',
      'name': publisher.name,
      ...(publisher.logo && {
        'logo': {
          '@type': 'ImageObject',
          'url': publisher.logo
        }
      })
    };
  }

  // Add search action if search URL is provided
  if (searchUrl) {
    potentialActions.push({
      type: 'SearchAction',
      target: `${searchUrl}{search_term_string}`,
      queryInput: 'required name=search_term_string'
    });
  }

  // Add potential actions if any exist
  if (potentialActions.length > 0) {
    websiteSchema.potentialAction = potentialActions.map(action => {
      const actionSchema: any = {
        '@type': action.type,
        'target': action.target
      };

      if (action.type === 'SearchAction' && action.queryInput) {
        actionSchema['query-input'] = action.queryInput;
      }

      return actionSchema;
    });
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
};

export default WebsiteSchema;
