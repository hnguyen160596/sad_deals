// Fix redirects script using Bun's native operations
import { writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

console.log('Running post-build fixes...');

// Ensure the dist directory exists
const distPath = resolve('./dist');
if (!existsSync(distPath)) {
  console.error('Error: dist directory does not exist!');
  process.exit(1);
}

// Create the _redirects file with correct content
try {
  // Write a plain text file with the Netlify redirect rule
  writeFileSync(join(distPath, '_redirects'), '/* /index.html 200\n');
  console.log('✓ Created _redirects file in dist folder');
} catch (error) {
  console.error('Error creating _redirects file:', error);
}

// Ensure favicon.ico exists in dist
if (!existsSync(join(distPath, 'favicon.ico'))) {
  try {
    if (existsSync(join('./public', 'favicon.ico'))) {
      copyFileSync(
        join('./public', 'favicon.ico'),
        join(distPath, 'favicon.ico')
      );
      console.log('✓ Copied favicon.ico to dist');
    } else if (existsSync(join('./public', 'logo.svg'))) {
      copyFileSync(
        join('./public', 'logo.svg'),
        join(distPath, 'favicon.ico')
      );
      console.log('✓ Copied logo.svg as favicon.ico to dist');
    }
  } catch (copyError) {
    console.error('Error copying favicon:', copyError);
  }
}

// Ensure apple-touch-icon.png exists in dist
if (!existsSync(join(distPath, 'apple-touch-icon.png'))) {
  try {
    if (existsSync(join('./public', 'apple-touch-icon.png'))) {
      copyFileSync(
        join('./public', 'apple-touch-icon.png'),
        join(distPath, 'apple-touch-icon.png')
      );
      console.log('✓ Copied apple-touch-icon.png to dist');
    } else if (existsSync(join('./public', 'pwa-192x192.png'))) {
      copyFileSync(
        join('./public', 'pwa-192x192.png'),
        join(distPath, 'apple-touch-icon.png')
      );
      console.log('✓ Copied pwa-192x192.png as apple-touch-icon.png to dist');
    }
  } catch (copyError) {
    console.error('Error copying apple-touch-icon:', copyError);
  }
}

console.log('✓ Post-build fixes completed successfully!');