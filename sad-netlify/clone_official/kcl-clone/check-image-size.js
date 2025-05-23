const { imageSize } = require('image-size');
const path = require('path');

function checkImageSizes() {
  try {
    const originalPath = path.join(__dirname, 'public/pwa-512x512.png');
    const resizedPath = path.join(__dirname, 'public/pwa-192x192.png');
    
    const originalDimensions = imageSize(originalPath);
    const resizedDimensions = imageSize(resizedPath);
    
    console.log('Original image dimensions:', originalDimensions);
    console.log('Resized image dimensions:', resizedDimensions);
  } catch (error) {
    console.error('Error checking image sizes:', error);
  }
}

checkImageSizes();