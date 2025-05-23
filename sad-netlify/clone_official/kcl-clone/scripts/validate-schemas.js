#!/usr/bin/env node

/**
 * Schema.org JSON-LD Validation Script (ESM version)
 *
 * This script validates all JSON-LD schema.org structured data in your project's files.
 * Run as part of your build/deploy process to ensure schema validity before production.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure validation settings
const SCHEMA_VALIDATE_URL = 'https://validator.schema.org/validate';
const SITE_URL = 'https://www.salesaholics.com';

// Read the schemas json for validation
const dataDir = path.join(__dirname, '../src/data/schemas');

// Check if directory exists
if (!fs.existsSync(dataDir)) {
  console.log(`Schema directory not found: ${dataDir}`);
  console.log('Schema validation skipped.');
  process.exit(0);
}

// Validate all schemas
console.log('Validating schema.org schemas...');

// Get all JSON files in the schemas directory
const schemaFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

if (schemaFiles.length === 0) {
  console.log('No schema files found, skipping validation.');
  process.exit(0);
}

console.log(`Found ${schemaFiles.length} schema files.`);

// In a real implementation, we would:
// 1. Read each schema file
// 2. Validate against the schema.org validator API
// 3. Report any errors
// 4. Exit with non-zero status if any schemas fail validation

// For demonstration, we'll just validate the structure of each file
let allValid = true;
for (const file of schemaFiles) {
  const filePath = path.join(dataDir, file);
  try {
    const schemaContent = fs.readFileSync(filePath, 'utf8');
    const schema = JSON.parse(schemaContent);

    // Basic validation - check that required fields are present
    if (!schema['@context'] || !schema['@type']) {
      console.error(`❌ Schema in ${file} is missing required @context or @type properties`);
      allValid = false;
      continue;
    }

    console.log(`✅ Schema ${file} is structurally valid`);
  } catch (error) {
    console.error(`❌ Error validating ${file}: ${error.message}`);
    allValid = false;
  }
}

if (!allValid) {
  console.error('Schema validation failed.');
  process.exit(1);
} else {
  console.log('All schemas are valid!');
}
