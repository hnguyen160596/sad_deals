import React from 'react';
import { Link } from 'react-router-dom';
import BreadcrumbsSchema from './BreadcrumbsSchema';
import { useTheme } from '../context/ThemeContext';

export interface BreadcrumbItem {
  name: string;
  url: string;
  isLast?: boolean;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showSchema?: boolean;
  className?: string;
}

/**
 * A reusable breadcrumbs component with schema.org markup support
 * This enhances both UX and SEO by providing clear navigation paths
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showSchema = true,
  className = "",
}) => {
  const { isDarkMode } = useTheme();

  // Prepare items for schema
  const schemaItems = items.map((item, index) => ({
    name: item.name,
    url: item.url,
    position: index + 2 // +2 because Home is position 1
  }));

  // Style classes based on theme
  const textColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const hoverColor = isDarkMode ? 'hover:text-gray-100' : 'hover:text-blue-600';
  const activeColor = isDarkMode ? 'text-white' : 'text-gray-800';

  return (
    <>
      {/* Add structured data for SEO if requested */}
      {showSchema && <BreadcrumbsSchema items={schemaItems} />}

      {/* Visual breadcrumbs */}
      <nav aria-label="Breadcrumb" className={`${className} ${textColor}`}>
        <ol className="flex flex-wrap items-center space-x-2 text-sm">
          <li className="flex items-center">
            <Link
              to="/"
              className={`${hoverColor} font-medium`}
              aria-label="Home"
            >
              Home
            </Link>
          </li>

          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <span className="mx-2" aria-hidden="true">/</span>
              {item.isLast ? (
                <span className={`${activeColor} font-medium`} aria-current="page">
                  {item.name}
                </span>
              ) : item.onClick ? (
                <button
                  onClick={item.onClick}
                  className={`${hoverColor}`}
                >
                  {item.name}
                </button>
              ) : (
                <Link
                  to={item.url}
                  className={`${hoverColor}`}
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
