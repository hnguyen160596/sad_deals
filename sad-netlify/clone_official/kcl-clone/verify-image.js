const sharp = require('sharp');
const path = require('path');

async function verifyImages() {
  try {
    const originalPath = path.join(__dirname, 'public/pwa-512x512.png');
    const resizedPath = path.join(__dirname, 'public/pwa-192x192.png');
    
    // Get original image metadata
    const originalMeta = await sharp(originalPath).metadata();
    console.log('Original image dimensions:', {
      width: originalMeta.width,
      height: originalMeta.height,
      format: originalMeta.format,
      size: `${Math.round(originalMeta.size / 1024)} KB`
    });
    
    // Get resized image metadata
    const resizedMeta = await sharp(resizedPath).metadata();
    console.log('Resized image dimensions:', {
      width: resizedMeta.width,
      height: resizedMeta.height,
      format: resizedMeta.format,
      size: `${Math.round(resizedMeta.size / 1024)} KB`
    });
    
    // Verify dimensions
    if (resizedMeta.width === 192 && resizedMeta.height === 192) {
      console.log('✅ Success! The image was correctly resized to 192x192 pixels.');
    } else {
      console.error('❌ Error: The resized image dimensions are not 192x192.');
    }
  } catch (error) {
    console.error('Error verifying images:', error);
  }
}

verifyImages();