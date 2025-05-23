import React from 'react';
import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  mainEntity?: string;
}

/**
 * Component for implementing schema.org FAQPage markup
 * This improves SEO by enabling FAQ rich results in Google search
 */
const FAQSchema: React.FC<FAQSchemaProps> = ({
  faqs,
  mainEntity
}) => {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Create the structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(mainEntity && { 'mainEntity': mainEntity }),
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};

export default FAQSchema;
