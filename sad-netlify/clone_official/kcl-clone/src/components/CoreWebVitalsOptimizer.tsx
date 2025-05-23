import React, { useEffect } from 'react';
import {
  preloadCriticalResources,
  deferNonCriticalResources,
  addResourceHints,
  measureCoreWebVitals
} from '../utils/performance';

interface CoreWebVitalsOptimizerProps {
  preconnectUrls?: string[];
  preloadFonts?: string[];
  preloadImages?: string[];
  measureWebVitals?: boolean;
}

/**
 * Component that automatically applies performance optimizations
 * to improve Core Web Vitals metrics (LCP, FID, CLS).
 *
 * This component doesn't render anything visible, it only
 * adds performance optimizations to the page.
 */
const CoreWebVitalsOptimizer: React.FC<CoreWebVitalsOptimizerProps> = ({
  preconnectUrls = [],
  preloadFonts = ['/fonts/inter-regular.woff2', '/fonts/inter-medium.woff2'],
  preloadImages = ['/logo.svg'],
  measureWebVitals = true
}) => {
  useEffect(() => {
    // Add resource hints (preconnect, prefetch, etc.)
    if (preconnectUrls.length > 0) {
      addResourceHints({
        preconnect: [
          ...preconnectUrls,
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com',
          'https://api.telegram.org'
        ]
      });
    }

    // Preload critical fonts
    preloadFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload critical images
    preloadImages.forEach(image => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = image;
      link.as = 'image';
      document.head.appendChild(link);
    });

    // Call preloadCriticalResources to apply general preload optimizations
    preloadCriticalResources();

    // Defer non-critical resources
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        deferNonCriticalResources();
      } else {
        window.addEventListener('load', deferNonCriticalResources);
      }

      // Set priority hints on critical images
      const criticalImages = document.querySelectorAll('.hero-image, .logo, .product-main-image');
      criticalImages.forEach(img => {
        img.setAttribute('fetchpriority', 'high');
      });

      // Use native lazy loading for below-the-fold images
      const belowFoldImages = document.querySelectorAll('img:not([fetchpriority="high"])');
      belowFoldImages.forEach(img => {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
      });
    }

    // Measure Core Web Vitals if enabled
    if (measureWebVitals) {
      measureCoreWebVitals();
    }

    return () => {
      window.removeEventListener('load', deferNonCriticalResources);
    };
  }, [preconnectUrls, preloadFonts, preloadImages, measureWebVitals]);

  // This component doesn't render anything visible
  return null;
};

export default CoreWebVitalsOptimizer;
