import React from 'react';
import { openRichResultsTest, openSchemaValidator, extractSchemaTypes } from '../utils/richResultsTest';

interface RichResultsTestButtonProps {
  url?: string;
  schemaType?: string;
  buttonStyle?: 'primary' | 'secondary' | 'link';
  buttonText?: string;
  showSchemaValidator?: boolean;
  className?: string;
}

/**
 * Button component that opens Google's Rich Results Test for a URL
 * Allows testing schema.org markup directly in Google's testing tool
 */
const RichResultsTestButton: React.FC<RichResultsTestButtonProps> = ({
  url = window.location.href,
  schemaType,
  buttonStyle = 'primary',
  buttonText = 'Test Rich Results',
  showSchemaValidator = false,
  className = ''
}) => {
  const handleClick = () => {
    openRichResultsTest(url);
  };

  const handleValidatorClick = () => {
    openSchemaValidator(url);
  };

  const getButtonClasses = () => {
    const baseClasses = 'px-4 py-2 rounded font-medium text-sm transition-colors';

    switch (buttonStyle) {
      case 'primary':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
      case 'secondary':
        return `${baseClasses} bg-white border border-blue-600 text-blue-600 hover:bg-blue-50`;
      case 'link':
        return 'text-blue-600 hover:text-blue-800 underline text-sm font-medium';
      default:
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
    }
  };

  const schemaTypes = extractSchemaTypes();
  const hasSchema = schemaTypes.length > 0;

  return (
    <div className={`inline-flex flex-wrap gap-2 ${className}`}>
      <button
        onClick={handleClick}
        className={getButtonClasses()}
        title={hasSchema ? `Test ${schemaTypes.join(', ')} schema` : 'No schema detected'}
      >
        {buttonText}
      </button>

      {showSchemaValidator && (
        <button
          onClick={handleValidatorClick}
          className={buttonStyle === 'primary' ? 'px-4 py-2 rounded font-medium text-sm bg-green-600 hover:bg-green-700 text-white' : getButtonClasses()}
        >
          Validate Schema
        </button>
      )}

      {hasSchema && (
        <div className="text-xs text-gray-600 w-full mt-1">
          Found: {schemaTypes.join(', ')}
        </div>
      )}
    </div>
  );
};

export default RichResultsTestButton;
