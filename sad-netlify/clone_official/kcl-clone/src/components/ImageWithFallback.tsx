import React, { useState, useEffect } from 'react';
import cloudinary, { CloudinaryOptions, DEFAULT_PLACEHOLDER, DEFAULT_ICON_PLACEHOLDER } from '../utils/cloudinary';

interface ImageWithFallbackProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  decoding?: 'async' | 'sync' | 'auto';
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  onLoad?: () => void;
  onError?: () => void;
  imageType?: 'deal' | 'product' | 'store' | 'icon' | 'avatar' | 'telegram';
  useCloudinary?: boolean;
  cloudinaryOptions?: CloudinaryOptions;
}

/**
 * Enhanced ImageWithFallback component with:
 * - Cloudinary image optimization and transformation
 * - Native lazy loading
 * - Blur-up effect while loading
 * - Prevents layout shifts by reserving space using aspect-ratio or width/height
 * - Fallback image on error
 * - Built-in retry mechanism
 */
const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  sizes = '100vw',
  decoding = 'async',
  style = {},
  onClick,
  onLoad,
  onError,
  imageType = 'deal',
  useCloudinary = true,
  cloudinaryOptions = {},
}) => {
  // Determine appropriate fallback images
  const defaultFallbackSrc = cloudinary.getAppropriateImageFallback('', imageType);
  const actualFallbackSrc = fallbackSrc || defaultFallbackSrc;
  const ultimateFallback = DEFAULT_ICON_PLACEHOLDER;

  // Process image URLs to ensure they work
  const processImageUrl = (url: string | undefined): string => {
    // If path is undefined or null, return the appropriate fallback
    if (!url) return actualFallbackSrc;

    // If we're using Cloudinary and it's a remote URL
    if (useCloudinary && cloudinary.isRemoteUrl(url)) {
      // For Telegram images, use special optimization
      if (imageType === 'telegram') {
        return cloudinary.optimizeTelegramImage(url, {
          width: typeof width === 'number' ? width : undefined,
          height: typeof height === 'number' ? height : undefined,
          ...cloudinaryOptions
        });
      }

      // For other images, use standard Cloudinary transformation
      return cloudinary.getCloudinaryUrl(url, {
        width: typeof width === 'number' ? width : undefined,
        height: typeof height === 'number' ? height : undefined,
        ...cloudinaryOptions
      });
    }

    // Handle relative paths by ensuring they start with /
    if (!url.startsWith('http') && !url.startsWith('/')) {
      return `/${url}`;
    }

    return url;
  };

  const [imgSrc, setImgSrc] = useState<string>(processImageUrl(src));
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [usedFallback, setUsedFallback] = useState<boolean>(false);
  const maxRetries = 1;

  // Reset state if src changes
  useEffect(() => {
    setImgSrc(processImageUrl(src));
    setIsLoaded(false);
    setIsError(false);
    setRetryCount(0);
    setUsedFallback(false);
  }, [src]);

  // Handle image error with more robust fallback logic
  const handleError = () => {
    // If we haven't tried the primary fallback yet
    if (!usedFallback) {
      console.log(`Primary image failed, using fallback: ${actualFallbackSrc}`);
      setImgSrc(processImageUrl(actualFallbackSrc));
      setUsedFallback(true);
      // Reset retry count for the fallback
      setRetryCount(0);
    }
    // Try to retry the current source (either original or fallback)
    else if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      console.log(`Retry ${retryCount + 1}/${maxRetries} for: ${imgSrc}`);
    }
    // If fallback also failed and retries are exhausted, use ultimate fallback
    else {
      console.log(`All image attempts failed, using ultimate fallback`);
      setImgSrc(ultimateFallback);
      setIsError(true);
    }

    if (onError) onError();
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    if (onLoad) onLoad();
  };

  // Handle click events safely
  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  // Generate a srcset if we're using Cloudinary
  const srcSet = useCloudinary && cloudinary.isRemoteUrl(src)
    ? cloudinary.generateSrcSet(src, {
        width: typeof width === 'number' ? width : undefined,
        height: typeof height === 'number' ? height : undefined,
        ...cloudinaryOptions
      })
    : undefined;

  // Blur-up effect styles
  const imageStyle: React.CSSProperties = {
    ...style,
    opacity: isLoaded ? 1 : 0.5,
    transition: 'opacity 0.3s ease-in-out',
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    display: 'block',
    objectFit: 'cover',
  };

  // Container style to prevent layout shifts
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    display: 'block',
  };

  // Use aspect ratio if both width and height are provided as numbers
  if (
    width &&
    height &&
    typeof width === 'number' &&
    typeof height === 'number'
  ) {
    // @ts-ignore: aspectRatio is supported in modern browsers
    containerStyle.aspectRatio = `${width} / ${height}`;
    // Remove explicit height to let aspect-ratio control it
    containerStyle.height = undefined;
    imageStyle.height = '100%';
    imageStyle.width = '100%';
  }

  return (
    <div style={containerStyle} className={`image-container ${className}`}>
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
        </div>
      )}

      <img
        src={imgSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={imageStyle}
        width={typeof width === 'number' ? width : undefined}
        height={typeof height === 'number' ? height : undefined}
        loading={loading}
        decoding={decoding}
        sizes={sizes}
        srcSet={srcSet}
        onError={handleError}
        onLoad={handleLoad}
        onClick={handleClick}
        draggable={false}
      />

      {isError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-75 p-2">
          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-gray-500 text-center">{alt || 'Image failed to load'}</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;
