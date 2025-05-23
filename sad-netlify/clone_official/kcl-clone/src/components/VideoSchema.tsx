import React from 'react';
import { Helmet } from 'react-helmet-async';

interface VideoSchemaProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string; // ISO 8601 format
  contentUrl?: string; // Direct URL to the video file
  embedUrl?: string; // Embed URL (e.g., YouTube embed URL)
  duration?: string; // ISO 8601 duration format (e.g., "PT1H30M" for 1 hour 30 minutes)
  expires?: string; // ISO 8601 format
  hasPart?: Array<{
    name: string;
    startOffset: number;
    endOffset: number;
    url?: string;
  }>;
  publisher?: {
    name: string;
    logo?: string;
    url?: string;
  };
  regionsAllowed?: string[];
  isFamilyFriendly?: boolean;
}

/**
 * Component for implementing schema.org VideoObject markup
 * This helps search engines understand video content and enables video rich snippets
 * in search results, increasing visibility and click-through rates
 */
const VideoSchema: React.FC<VideoSchemaProps> = ({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
  duration,
  expires,
  hasPart,
  publisher,
  regionsAllowed,
  isFamilyFriendly = true
}) => {
  // Build the basic video schema
  const videoSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    'name': name,
    'description': description,
    'thumbnailUrl': thumbnailUrl,
    'uploadDate': uploadDate
  };

  // Add optional properties
  if (contentUrl) videoSchema.contentUrl = contentUrl;
  if (embedUrl) videoSchema.embedUrl = embedUrl;
  if (duration) videoSchema.duration = duration;
  if (expires) videoSchema.expires = expires;
  if (isFamilyFriendly !== undefined) videoSchema.isFamilyFriendly = isFamilyFriendly;
  if (regionsAllowed && regionsAllowed.length > 0) videoSchema.regionsAllowed = regionsAllowed;

  // Add publisher information if provided
  if (publisher) {
    videoSchema.publisher = {
      '@type': 'Organization',
      'name': publisher.name,
      ...(publisher.url && { 'url': publisher.url }),
      ...(publisher.logo && {
        'logo': {
          '@type': 'ImageObject',
          'url': publisher.logo
        }
      })
    };
  }

  // Add video clip markers if any exist
  if (hasPart && hasPart.length > 0) {
    videoSchema.hasPart = hasPart.map(clip => ({
      '@type': 'Clip',
      'name': clip.name,
      'startOffset': clip.startOffset,
      'endOffset': clip.endOffset,
      ...(clip.url && { 'url': clip.url })
    }));
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(videoSchema)}
      </script>
    </Helmet>
  );
};

export default VideoSchema;
