// Simple script to copy Netlify functions to the dist folder
import { cpSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

console.log('Copying Netlify functions to dist folder...');

const functionsDir = join(process.cwd(), 'netlify', 'functions');
const distFunctionsDir = join(process.cwd(), 'dist', 'netlify', 'functions');
const utilsDir = join(functionsDir, 'utils');
const distUtilsDir = join(distFunctionsDir, 'utils');

// Create directories if they don't exist
if (!existsSync(distFunctionsDir)) {
  console.log('Creating dist/netlify/functions directory...');
  mkdirSync(distFunctionsDir, { recursive: true });
}

if (!existsSync(distUtilsDir)) {
  console.log('Creating dist/netlify/functions/utils directory...');
  mkdirSync(distUtilsDir, { recursive: true });
}

try {
  // Copy all Netlify functions
  cpSync(functionsDir, distFunctionsDir, {
    recursive: true,
    force: true,
    filter: (src) => !src.includes('/utils/') // Skip the utils directory as we'll copy it separately
  });
  console.log('Successfully copied Netlify functions to dist/netlify/functions');

  // Copy utils folder if it exists
  if (existsSync(utilsDir)) {
    cpSync(utilsDir, distUtilsDir, { recursive: true, force: true });
    console.log('Successfully copied Netlify functions/utils to dist/netlify/functions/utils');
  }
} catch (error) {
  console.error('Error copying Netlify functions:', error);
  process.exit(1);
}
