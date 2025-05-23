import React, { useState } from 'react';
import FAQSchema from './FAQSchema';
import { useTheme } from '../context/ThemeContext';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs: FAQItem[];
  className?: string;
  showSchema?: boolean;
}

/**
 * Component for displaying FAQs with optional schema markup
 * Allows for expandable/collapsible FAQ items with proper styling
 */
const FAQSection: React.FC<FAQSectionProps> = ({
  title = "Frequently Asked Questions",
  subtitle,
  faqs,
  className = "",
  showSchema = true
}) => {
  const { isDarkMode } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Toggle question expanded state
  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Handle keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleQuestion(index);
    }
  };

  // Styles based on dark mode
  const headingColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const textColor = isDarkMode ? 'text-gray-200' : 'text-gray-800';
  const subtitleColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const bgHoverColor = isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50';

  return (
    <div className={`w-full ${className}`}>
      {/* Include schema.org markup if requested */}
      {showSchema && <FAQSchema faqs={faqs} />}

      {/* Section heading */}
      {title && (
        <h2 className={`text-2xl font-bold mb-2 ${headingColor}`}>{title}</h2>
      )}

      {/* Optional subtitle */}
      {subtitle && (
        <p className={`mb-6 ${subtitleColor}`}>{subtitle}</p>
      )}

      {/* FAQ items */}
      <div className="mt-4 space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`border ${borderColor} rounded-lg overflow-hidden ${expandedIndex === index ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
          >
            {/* Question header - clickable */}
            <div
              className={`flex justify-between items-center p-4 cursor-pointer ${bgHoverColor}`}
              onClick={() => toggleQuestion(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={0}
              role="button"
              aria-expanded={expandedIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <h3 className={`font-medium ${textColor}`}>{faq.question}</h3>
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${expandedIndex === index ? 'transform rotate-180' : ''} ${textColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Answer - collapsible */}
            <div
              id={`faq-answer-${index}`}
              className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedIndex === index ? 'max-h-96' : 'max-h-0'}`}
            >
              <div className={`p-4 pt-0 ${textColor} border-t ${borderColor}`}>
                <p dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
