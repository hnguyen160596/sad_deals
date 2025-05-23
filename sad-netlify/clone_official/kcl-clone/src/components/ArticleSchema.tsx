import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ArticleAuthor {
  name: string;
  url?: string;
  imageUrl?: string;
}

interface ArticleOrganization {
  name: string;
  logo?: string;
  url?: string;
}

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  datePublished: string; // ISO 8601 format
  dateModified?: string; // ISO 8601 format
  author: ArticleAuthor;
  publisher?: ArticleOrganization;
  articleType?: 'Article' | 'NewsArticle' | 'BlogPosting';
  articleSection?: string;
  keywords?: string[];
  articleBody?: string;
}

/**
 * Component for implementing schema.org Article markup
 * This improves SEO by enabling rich article results in Google search
 * with dates, authorship, images and more
 */
const ArticleSchema: React.FC<ArticleSchemaProps> = ({
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  author,
  publisher,
  articleType = 'Article',
  articleSection,
  keywords,
  articleBody
}) => {
  // Create the structured data
  const articleSchema: any = {
    '@context': 'https://schema.org',
    '@type': articleType,
    'headline': title,
    'description': description,
    'image': imageUrl,
    'url': url,
    'datePublished': datePublished,
    'dateModified': dateModified || datePublished,
    'author': {
      '@type': 'Person',
      'name': author.name,
      ...(author.url && { 'url': author.url }),
      ...(author.imageUrl && { 'image': author.imageUrl })
    }
  };

  // Add publisher if provided
  if (publisher) {
    articleSchema.publisher = {
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

  // Add optional properties if they exist
  if (articleSection) articleSchema.articleSection = articleSection;
  if (keywords && keywords.length > 0) articleSchema.keywords = keywords.join(',');
  if (articleBody) articleSchema.articleBody = articleBody;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>
    </Helmet>
  );
};

export default ArticleSchema;
