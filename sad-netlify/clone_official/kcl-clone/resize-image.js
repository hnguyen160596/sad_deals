const sharp = require('sharp');
const path = require('path');

async function resizeImage() {
  try {
    console.log('Resizing pwa-512x512.png to 192x192px...');
    
    const inputPath = path.join(__dirname, 'public/pwa-512x512.png');
    const outputPath = path.join(__dirname, 'public/pwa-192x192.png');
    
    await sharp(inputPath)
      .resize(192, 192)
      .png({ quality: 90 })
      .toFile(outputPath);
    
    console.log('Successfully created pwa-192x192.png');
  } catch (error) {
    console.error('Error resizing image:', error);
    process.exit(1);
  }
}

resizeImage();