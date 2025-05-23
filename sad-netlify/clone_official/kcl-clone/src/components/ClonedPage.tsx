import type React from 'react';
import { useEffect, useState } from 'react';
import Layout from './Layout';
import SEO from './SEO';
import { useLocation } from 'react-router-dom';

interface ClonedPageProps {
  path: string;
}

const ClonedPage: React.FC<ClonedPageProps> = ({ path }) => {
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  // Normalize path for file loading
  const normalizedPath = path === '/' ? '/home' : path;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);

        // Attempt to fetch the cloned content
        const response = await fetch(`/clone${normalizedPath}/index.html`);

        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }

        const html = await response.text();

        // Extract content from the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract the title
        const pageTitle = doc.querySelector('title')?.textContent || '';
        setTitle(pageTitle);

        // Extract the main content
        // In a real implementation, we'd want to be more selective about what we extract
        // This simplified version just takes the entire body
        const body = doc.querySelector('body');

        if (body) {
          // Remove the header, navigation, and footer elements that might be in the cloned content
          // This is a simplified version - in practice, you'd need more specific selectors
          const header = body.querySelector('header');
          const footer = body.querySelector('footer');
          const nav = body.querySelector('nav');

          if (header) header.remove();
          if (footer) footer.remove();
          if (nav) nav.remove();

          // Set the cleaned content
          setContent(body.innerHTML);
        } else {
          throw new Error('Could not extract content from page');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading cloned page:', err);
        setError(`Could not load content for "${path}". Please try again later.`);
        setLoading(false);
      }
    };

    fetchContent();
  }, [normalizedPath, path]);

  // Format path segments for SEO title and description
  const pathSegments = path.split('/').filter(Boolean);
  const formattedTitle = pathSegments.length > 0
    ? pathSegments.map(segment =>
        segment.split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      ).join(' - ')
    : 'Home';

  return (
    <Layout>
      <SEO
        title={title || `${formattedTitle} | Sales Aholics Deals`}
        description={`Browse ${formattedTitle.toLowerCase()} deals, coupons, and savings tips on Sales Aholics Deals.`}
        canonicalUrl={`https://salesaholicsdeals.com${location.pathname}`}
      />

      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="cloned-page-wrapper">
          {/* Note: Consider implementing a safe HTML sanitizer like DOMPurify
              in production environments before setting HTML content */}
          <div
            className="cloned-content"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      )}
    </Layout>
  );
};

export default ClonedPage;
