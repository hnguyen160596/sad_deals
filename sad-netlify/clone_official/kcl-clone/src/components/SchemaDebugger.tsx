import React, { useState, useEffect } from 'react';
import { validateAllSchemas } from '../utils/schemaValidator';
import RichResultsTestButton from './RichResultsTestButton';
import { applyAutoSchema, GeneratedSchemaInfo } from '../utils/autoSchemaGenerator';

interface SchemaValidationResult {
  type: string;
  valid: boolean;
  errors: string[];
}

interface SchemaDebuggerProps {
  className?: string;
  allowAutoGeneration?: boolean;
}

/**
 * Component for debugging and validating schema.org structured data
 * Allows admins to ensure all structured data is valid for SEO
 */
const SchemaDebugger: React.FC<SchemaDebuggerProps> = ({
  className = '',
  allowAutoGeneration = true
}) => {
  const [results, setResults] = useState<SchemaValidationResult[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [testUrl, setTestUrl] = useState<string>('');
  const [generatedSchema, setGeneratedSchema] = useState<GeneratedSchemaInfo | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [autoGenUrl, setAutoGenUrl] = useState<string>('');

  // Validate schemas on component mount
  useEffect(() => {
    const validateSchemas = () => {
      try {
        setIsLoading(true);
        const validationResults = validateAllSchemas();
        setResults(validationResults.schemaResults);
        setIsValid(validationResults.valid);
      } catch (error) {
        setResults([{
          type: 'Validation Error',
          valid: false,
          errors: [`Error validating schemas: ${error}`]
        }]);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateSchemas();
  }, []);

  // Handle auto-generation of schema based on content
  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const url = autoGenUrl || window.location.href;
      const schemaInfo = await applyAutoSchema(true, url);
      setGeneratedSchema(schemaInfo);

      // Refresh validation results to include the new schema
      const validationResults = validateAllSchemas();
      setResults(validationResults.schemaResults);
      setIsValid(validationResults.valid);
    } catch (error) {
      console.error('Error auto-generating schema:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-4">Schema.org Structured Data Debugger</h2>

      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          This tool helps you validate structured data on your site for better SEO.
        </p>

        <div className="flex items-center mt-4 space-x-2">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter URL or leave blank for current page"
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <RichResultsTestButton
            url={testUrl || undefined}
            buttonText="Google Rich Results Test"
            showSchemaValidator={true}
          />
        </div>

        {allowAutoGeneration && (
          <div className="mt-4 border-t pt-4">
            <h3 className="text-md font-semibold mb-2">Auto-Generate Structured Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Automatically generate schema.org markup based on page content.
            </p>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={autoGenUrl}
                onChange={(e) => setAutoGenUrl(e.target.value)}
                placeholder="URL to analyze (leave blank for current page)"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button
                onClick={handleAutoGenerate}
                disabled={isGenerating}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  isGenerating
                    ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isGenerating ? 'Generating...' : 'Generate Schema'}
              </button>
            </div>

            {generatedSchema && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    Generated {generatedSchema.type} Schema
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Confidence: {Math.round(generatedSchema.confidence * 100)}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-600">
                  Schema has been applied to the page and will be included in future validation.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-3 text-gray-600">Validating schemas...</p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <div className="flex items-center mb-4">
            <span className="mr-2 font-medium">Overall Status:</span>
            {isValid ? (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                All schemas valid
              </span>
            ) : (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                Schema issues found
              </span>
            )}
          </div>

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  result.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">
                    {result.type}
                  </h3>
                  {result.valid ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      Valid
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                      Invalid
                    </span>
                  )}
                </div>

                {!result.valid && result.errors.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-red-800 mb-1">Errors:</h4>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {result.errors.map((error, errorIndex) => (
                        <li key={errorIndex}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No schema.org markup found on this page.</p>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <h4 className="font-medium mb-2">Tips for optimal structured data:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Include required properties for each schema type</li>
          <li>Limit article headlines to 110 characters for Google display</li>
          <li>Use specific schema types (e.g., BlogPosting instead of Article)</li>
          <li>Include image URLs with absolute paths, not relative</li>
          <li>Format dates in ISO 8601 format (YYYY-MM-DD)</li>
          <li>For JobPosting schema, include all required fields (title, description, datePosted, etc.)</li>
          <li>For Recipe schema, include recipeIngredient and recipeInstructions</li>
          <li>Use auto-generation for a starting point, then refine manually</li>
          <li>Test with Google's Rich Results Test for definitive validation</li>
        </ul>
      </div>
    </div>
  );
};

export default SchemaDebugger;
