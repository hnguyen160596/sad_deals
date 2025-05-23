import React, { useState, useEffect } from 'react';
import { validateAllSchemas } from '../utils/schemaValidator';

interface SchemaValidationBadgeProps {
  inline?: boolean;
  showCount?: boolean;
  className?: string;
}

/**
 * A component that displays a validation badge for schema.org markup
 * Used to provide visual feedback about schema validation status
 */
const SchemaValidationBadge: React.FC<SchemaValidationBadgeProps> = ({
  inline = false,
  showCount = true,
  className = ''
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validCount, setValidCount] = useState<number>(0);
  const [invalidCount, setInvalidCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkSchemas = () => {
      try {
        setIsLoading(true);
        const validationResults = validateAllSchemas();
        setIsValid(validationResults.valid);

        const valid = validationResults.schemaResults.filter(r => r.valid).length;
        const invalid = validationResults.schemaResults.filter(r => !r.valid).length;

        setValidCount(valid);
        setInvalidCount(invalid);
      } catch (error) {
        console.error('Schema validation error:', error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSchemas();
  }, []);

  if (isLoading) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Validating Schemas
      </span>
    );
  }

  if (inline) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isValid
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        } ${className}`}
      >
        <span className={`w-2 h-2 mr-1.5 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`} />
        {isValid ? 'Valid Schemas' : 'Schema Issues'}
        {showCount && (
          <span className="ml-1 text-xs">
            ({validCount}/{validCount + invalidCount})
          </span>
        )}
      </span>
    );
  }

  return (
    <div className={`flex flex-col items-center p-4 rounded-lg border ${
      isValid
        ? 'border-green-200 bg-green-50'
        : 'border-red-200 bg-red-50'
    } ${className}`}>
      <div className={`w-4 h-4 rounded-full mb-2 ${isValid ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="font-medium text-sm">
        {isValid ? 'Schema Validated' : 'Schema Issues'}
      </span>
      {showCount && (
        <div className="mt-1 text-xs text-gray-600">
          {validCount} valid / {invalidCount} invalid
        </div>
      )}
    </div>
  );
};

export default SchemaValidationBadge;
