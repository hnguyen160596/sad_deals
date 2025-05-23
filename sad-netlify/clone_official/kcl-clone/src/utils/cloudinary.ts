/**
 * Cloudinary integration utility for image optimization
 */

import { getErrorTracking } from './errorTracking';

// Cloudinary configuration
// Use environment variables if available, otherwise use defaults for demo
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'salesaholics';
const CLOUDINARY_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch`;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'deals_preset';
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || '';

// Default placeholder images when loading fails
export const DEFAULT_PLACEHOLDER = '/images/deals/deal-placeholder.png';
export const DEFAULT_ICON_PLACEHOLDER = '/images/icons/icon-placeholder.png';
export const DEFAULT_STORE_PLACEHOLDER = '/images/stores/placeholder/store-placeholder.png';
export const DEFAULT_AVATAR_PLACEHOLDER = '/images/user-avatar-placeholder.png';

/**
 * Available image transformation options
 */
export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png' | 'avif';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'pad';
  gravity?: 'auto' | 'center' | 'face' | 'faces' | 'north' | 'south' | 'east' | 'west';
  effect?: string;
  background?: string;
  dpr?: number | string;
  radius?: number | string;
  fetchFormat?: string;
  defaultImage?: string;
  colorSpace?: string;
  overlay?: string;
  underlay?: string;
}

/**
 * Check if a URL is from Telegram
 */
export const isTelegramUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('api.telegram.org');
};

/**
 * Check if an image URL is a remote URL that should be processed by Cloudinary
 */
export const isRemoteUrl = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Check if a URL is already a Cloudinary URL
 */
export const isCloudinaryUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('res.cloudinary.com');
};

/**
 * Check if a URL is a Data URL
 */
export const isDataUrl = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('data:');
};

/**
 * Check if a URL is a Blob URL
 */
export const isBlobUrl = (url: string): boolean => {
  if (!url) return false;
  return url.startsWith('blob:');
};

/**
 * Transform an image URL using Cloudinary
 *
 * @param url Original image URL
 * @param options Transformation options
 * @returns Transformed Cloudinary URL
 */
export const getCloudinaryUrl = (url: string, options: CloudinaryOptions = {}): string => {
  const errorTracking = getErrorTracking();

  // Don't transform if not a remote URL or already a Cloudinary URL
  if (!url || !isRemoteUrl(url) || isCloudinaryUrl(url) || isDataUrl(url) || isBlobUrl(url)) {
    return url;
  }

  try {
    // Build transformation string
    const transformations: string[] = [];

    // Add width and height if provided
    if (options.width) {
      transformations.push(`w_${options.width}`);
    }
    if (options.height) {
      transformations.push(`h_${options.height}`);
    }

    // Add crop mode if provided
    if (options.crop) {
      transformations.push(`c_${options.crop}`);
    }

    // Add gravity if provided
    if (options.gravity) {
      transformations.push(`g_${options.gravity}`);
    }

    // Add quality if provided (default to auto)
    transformations.push(`q_${options.quality || 'auto'}`);

    // Add format if provided (default to auto)
    transformations.push(`f_${options.format || 'auto'}`);

    // Add device pixel ratio if provided
    if (options.dpr) {
      transformations.push(`dpr_${options.dpr}`);
    }

    // Add effect if provided
    if (options.effect) {
      transformations.push(`e_${options.effect}`);
    }

    // Add background if provided
    if (options.background) {
      transformations.push(`b_${options.background}`);
    }

    // Add radius if provided (for rounded corners)
    if (options.radius) {
      transformations.push(`r_${options.radius}`);
    }

    // Add fetch format if provided
    if (options.fetchFormat) {
      transformations.push(`fl_${options.fetchFormat}`);
    }

    // Add default image if provided
    if (options.defaultImage) {
      transformations.push(`d_${options.defaultImage}`);
    }

    // Add color space if provided
    if (options.colorSpace) {
      transformations.push(`cs_${options.colorSpace}`);
    }

    // Add overlay if provided
    if (options.overlay) {
      transformations.push(`l_${options.overlay}`);
    }

    // Add underlay if provided
    if (options.underlay) {
      transformations.push(`u_${options.underlay}`);
    }

    // Build the final URL
    const transformationString = transformations.join(',');
    const encodedUrl = encodeURIComponent(url);

    return `${CLOUDINARY_URL}/${transformationString}/${encodedUrl}`;
  } catch (error) {
    errorTracking.captureWarning('Error creating Cloudinary URL', {
      component: 'cloudinary',
      method: 'getCloudinaryUrl',
      url,
      options
    });
    console.error('Error creating Cloudinary URL:', error);
    return url;
  }
};

/**
 * Optimize Telegram images with special handling for API URLs
 *
 * @param url Telegram image URL
 * @param options Transformation options
 * @returns Optimized image URL
 */
export const optimizeTelegramImage = (url: string, options: CloudinaryOptions = {}): string => {
  const errorTracking = getErrorTracking();

  if (!url) return DEFAULT_PLACEHOLDER;

  // If this is already a Cloudinary URL, return it directly
  if (isCloudinaryUrl(url)) {
    return url;
  }

  try {
    // Check if it's a Telegram API URL
    // Example: https://api.telegram.org/file/bot<token>/<path>
    if (isTelegramUrl(url)) {
      // Apply special transformations for Telegram images
      return getCloudinaryUrl(url, {
        // Default quality to auto for better compression
        quality: 'auto',
        // Default to webp which has best quality/size ratio
        format: 'auto',
        // Automatically detect and place subject in frame
        gravity: 'auto',
        // Apply sharpen effect to compensate for Telegram compression
        effect: 'sharpen:50',
        // Apply dpr scaling for high-resolution displays
        dpr: 'auto',
        // Default image if telegram image is unavailable
        defaultImage: encodeURIComponent(DEFAULT_PLACEHOLDER.replace(/^\//, '')),
        // Allow overriding any of these with passed options
        ...options
      });
    }

    // For non-Telegram URLs, just use standard optimization
    return getCloudinaryUrl(url, options);
  } catch (error) {
    errorTracking.captureWarning('Error optimizing Telegram image', {
      component: 'cloudinary',
      method: 'optimizeTelegramImage',
      url
    });
    console.error('Error optimizing Telegram image:', error);
    return url;
  }
};

/**
 * Optimize deal images with appropriate transformations
 */
export const optimizeDealImage = (url: string, options: CloudinaryOptions = {}): string => {
  const errorTracking = getErrorTracking();

  if (!url) return DEFAULT_PLACEHOLDER;

  try {
    return getCloudinaryUrl(url, {
      // Default quality to auto for better compression
      quality: 'auto',
      // Default to webp which has best quality/size ratio
      format: 'auto',
      // Default crop to fill
      crop: 'fill',
      // Default gravity to auto
      gravity: 'auto',
      // Default background to white
      background: 'white',
      // Allow overriding any of these with passed options
      ...options
    });
  } catch (error) {
    errorTracking.captureWarning('Error optimizing deal image', {
      component: 'cloudinary',
      method: 'optimizeDealImage',
      url
    });
    console.error('Error optimizing deal image:', error);
    return url;
  }
};

/**
 * Optimize store logo images
 */
export const optimizeStoreLogo = (url: string, options: CloudinaryOptions = {}): string => {
  const errorTracking = getErrorTracking();

  if (!url) return DEFAULT_STORE_PLACEHOLDER;

  try {
    return getCloudinaryUrl(url, {
      // Default quality to auto for better compression
      quality: 'auto',
      // Default to png for better transparency
      format: 'png',
      // Default crop to pad to preserve aspect ratio
      crop: 'pad',
      // Default background to white if padding needed
      background: 'white',
      // Allow overriding any of these with passed options
      ...options
    });
  } catch (error) {
    errorTracking.captureWarning('Error optimizing store logo', {
      component: 'cloudinary',
      method: 'optimizeStoreLogo',
      url
    });
    console.error('Error optimizing store logo:', error);
    return url;
  }
};

/**
 * Optimize user avatar images with appropriate transformations
 */
export const optimizeAvatarImage = (url: string, options: CloudinaryOptions = {}): string => {
  const errorTracking = getErrorTracking();

  if (!url) return DEFAULT_AVATAR_PLACEHOLDER;

  try {
    return getCloudinaryUrl(url, {
      // Default quality to auto for better compression
      quality: 'auto',
      // Default to webp which has best quality/size ratio
      format: 'auto',
      // Default crop to fill
      crop: 'fill',
      // Default gravity to face
      gravity: 'face',
      // Default to rounded corners
      radius: 'max',
      // Allow overriding any of these with passed options
      ...options
    });
  } catch (error) {
    errorTracking.captureWarning('Error optimizing avatar image', {
      component: 'cloudinary',
      method: 'optimizeAvatarImage',
      url
    });
    console.error('Error optimizing avatar image:', error);
    return url;
  }
};

/**
 * Get responsive image sizes based on device width
 *
 * @param originalWidth Original image width
 * @returns Array of sizes for srcset
 */
export const getResponsiveSizes = (originalWidth: number = 1200): number[] => {
  // Define breakpoints for responsive images
  const breakpoints = [320, 480, 640, 768, 1024, 1280, 1536];

  // Filter breakpoints that are smaller than the original width
  return breakpoints.filter(size => size <= originalWidth);
};

/**
 * Generate a complete srcset attribute value
 *
 * @param url Original image URL
 * @param options Base transformation options
 * @returns srcset attribute value string
 */
export const generateSrcSet = (url: string, options: CloudinaryOptions = {}): string => {
  const errorTracking = getErrorTracking();

  if (!url || !isRemoteUrl(url)) {
    return '';
  }

  try {
    const baseWidth = options.width || 1200;
    const sizes = getResponsiveSizes(baseWidth);

    // Generate srcset entries for each size
    return sizes
      .map(size => {
        const transformedUrl = getCloudinaryUrl(url, {
          ...options,
          width: size,
          quality: options.quality || 'auto'
        });
        return `${transformedUrl} ${size}w`;
      })
      .join(', ');
  } catch (error) {
    errorTracking.captureWarning('Error generating srcset', {
      component: 'cloudinary',
      method: 'generateSrcSet',
      url
    });
    console.error('Error generating srcset:', error);
    return '';
  }
};

/**
 * Get appropriate fallback image based on image type
 *
 * @param url Original URL (unused but kept for API consistency)
 * @param imageType Type of image (deal, product, store, icon, etc.)
 * @returns URL to appropriate fallback image
 */
export const getAppropriateImageFallback = (url: string, imageType: string): string => {
  switch (imageType) {
    case 'deal':
      return DEFAULT_PLACEHOLDER;
    case 'product':
      return DEFAULT_PLACEHOLDER;
    case 'store':
      return DEFAULT_STORE_PLACEHOLDER;
    case 'icon':
      return DEFAULT_ICON_PLACEHOLDER;
    case 'avatar':
      return DEFAULT_AVATAR_PLACEHOLDER;
    case 'telegram':
      return DEFAULT_PLACEHOLDER;
    default:
      return DEFAULT_PLACEHOLDER;
  }
};

/**
 * Upload an image to Cloudinary
 *
 * @param file Image file to upload
 * @returns Promise with upload result
 */
export const uploadImage = async (file: File): Promise<{ url: string; publicId: string } | null> => {
  const errorTracking = getErrorTracking();

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    errorTracking.captureError(error instanceof Error ? error : new Error('Error uploading to Cloudinary'), {
      component: 'cloudinary',
      method: 'uploadImage',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
};

/**
 * Background queue for processing images
 */
class ImageProcessingQueue {
  private queue: Array<{id: string; task: () => Promise<void>}> = [];
  private processing = false;
  private maxConcurrent = 2;
  private activeCount = 0;

  /**
   * Add an image processing task to the queue
   */
  public enqueue(id: string, task: () => Promise<void>): void {
    // Check if task with same ID already exists in queue
    const exists = this.queue.some(item => item.id === id);
    if (!exists) {
      this.queue.push({ id, task });
      this.processQueue();
    }
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
        const item = this.queue.shift();
        if (item) {
          this.activeCount++;

          item.task()
            .catch(err => {
              console.error(`Error processing queue item ${item.id}:`, err);
              getErrorTracking().captureError(err instanceof Error ? err : new Error(`Error processing queue item ${item.id}`), {
                component: 'cloudinary',
                method: 'ImageProcessingQueue',
                itemId: item.id
              });
            })
            .finally(() => {
              this.activeCount--;
              this.processQueue();
            });
        }
      }
    } finally {
      this.processing = false;

      // If we still have capacity and items, continue processing
      if (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
        setTimeout(() => this.processQueue(), 50);
      }
    }
  }
}

// Singleton instance of the queue
const imageQueue = new ImageProcessingQueue();

/**
 * Preload and optimize an image in the background
 *
 * @param url Image URL to preload
 * @param options Cloudinary options
 */
export const preloadImage = (url: string, options: CloudinaryOptions = {}): void => {
  if (!url || !isRemoteUrl(url)) return;

  // Skip if already a Cloudinary URL
  if (isCloudinaryUrl(url)) return;

  // Create a unique ID for this task
  const taskId = `preload-${url}`;

  // Add to processing queue
  imageQueue.enqueue(taskId, async () => {
    try {
      // Get optimized URL
      const optimizedUrl = getCloudinaryUrl(url, {
        quality: 'auto',
        format: 'auto',
        ...options
      });

      // Create image element to preload
      const img = new Image();
      img.src = optimizedUrl;

      // Wait for load or error
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    } catch (error) {
      console.error('Error preloading image:', error);
    }
  });
};

/**
 * Bulk optimize multiple images at once
 *
 * @param urls Array of image URLs to optimize
 * @param options Cloudinary options
 * @returns Object mapping original URLs to optimized URLs
 */
export const bulkOptimizeImages = (
  urls: string[],
  options: CloudinaryOptions = {}
): Record<string, string> => {
  const errorTracking = getErrorTracking();
  const result: Record<string, string> = {};

  if (!urls || !Array.isArray(urls)) return result;

  try {
    urls.forEach(url => {
      if (url && isRemoteUrl(url) && !isCloudinaryUrl(url)) {
        result[url] = getCloudinaryUrl(url, options);

        // Also trigger preloading
        preloadImage(url, options);
      } else {
        result[url] = url;
      }
    });
  } catch (error) {
    errorTracking.captureWarning('Error in bulk image optimization', {
      component: 'cloudinary',
      method: 'bulkOptimizeImages',
      urlCount: urls.length
    });
    console.error('Error in bulk image optimization:', error);

    // Return original URLs for any that failed
    urls.forEach(url => {
      if (!result[url]) {
        result[url] = url;
      }
    });
  }

  return result;
};

/**
 * Generate a color palette from an image
 * For visual harmony in UI components that display images
 *
 * Note: This is a mock implementation. In production, this would call the Cloudinary colors API
 *
 * @param url Image URL
 * @returns Array of hex color codes
 */
export const getImageColorPalette = async (url: string): Promise<string[]> => {
  const errorTracking = getErrorTracking();

  // Default colors if we can't extract them
  const defaultPalette = ['#982a4a', '#f5f5f5', '#333333', '#999999', '#cccccc'];

  if (!url || !isRemoteUrl(url)) return defaultPalette;

  try {
    // In production, we would call the Cloudinary API:
    // const colors = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/colors?url=${encodeURIComponent(url)}`);

    // For demo, return a mock palette based on the URL (but deterministic)
    const hash = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Generate a deterministic but semi-random palette based on URL hash
    return [
      `#${(hash % 16777215).toString(16).padStart(6, '0')}`,
      '#ffffff',
      '#' + ((hash * 2) % 16777215).toString(16).padStart(6, '0'),
      '#' + ((hash * 3) % 16777215).toString(16).padStart(6, '0'),
      '#' + ((hash * 4) % 16777215).toString(16).padStart(6, '0')
    ];
  } catch (error) {
    errorTracking.captureWarning('Error getting image color palette', {
      component: 'cloudinary',
      method: 'getImageColorPalette',
      url
    });
    console.error('Error getting image color palette:', error);
    return defaultPalette;
  }
};

/**
 * Detect if an image is a social media profile picture
 * Useful for special handling of user avatars
 *
 * @param url Image URL
 * @returns Boolean indicating if the image is a profile picture
 */
export const isProfilePicture = (url: string): boolean => {
  if (!url) return false;

  // List of known patterns in social media profile picture URLs
  const patterns = [
    /facebook\.com\/.*\/profile/i,
    /profile.*\.fb\./i,
    /twitter\.com\/profile_images/i,
    /pbs\.twimg\.com\/profile_images/i,
    /instagram\.com\/p\//i,
    /linkedin\.com\/.*\/profile/i,
    /googleusercontent\.com\/.*\/photo/i,
    /gravatar\.com\/avatar/i,
    /avatars\./i,
    /\.profile\./i,
    /profile-pictures/i
  ];

  return patterns.some(pattern => pattern.test(url));
};

/**
 * Get image dimensions from URL
 *
 * @param url Image URL
 * @returns Promise with image dimensions
 */
export const getImageDimensions = async (url: string): Promise<{width: number; height: number} | null> => {
  const errorTracking = getErrorTracking();

  if (!url) return null;

  try {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for dimensions calculation'));
      };

      img.src = url;
    });
  } catch (error) {
    errorTracking.captureWarning('Error getting image dimensions', {
      component: 'cloudinary',
      method: 'getImageDimensions',
      url
    });
    console.error('Error getting image dimensions:', error);
    return null;
  }
};

export default {
  getCloudinaryUrl,
  generateSrcSet,
  isRemoteUrl,
  isCloudinaryUrl,
  isTelegramUrl,
  getResponsiveSizes,
  optimizeTelegramImage,
  optimizeDealImage,
  optimizeStoreLogo,
  optimizeAvatarImage,
  getAppropriateImageFallback,
  uploadImage,
  preloadImage,
  bulkOptimizeImages,
  getImageColorPalette,
  isProfilePicture,
  getImageDimensions
};
