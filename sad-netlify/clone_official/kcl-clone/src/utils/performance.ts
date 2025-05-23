/**
 * Performance optimization utilities to improve Core Web Vitals
 */

/**
 * Add resource hints to the document head
 * @param options Options for resource hints
 */
export const addResourceHints = (options: {
  preconnect?: string[];
  prefetch?: string[];
  preload?: Array<{ href: string; as: string; type?: string; crossOrigin?: string }>;
  prerender?: string[];
  dnsPrefetch?: string[];
}) => {
  if (typeof document === 'undefined') return;

  // Add preconnect hints
  if (options.preconnect && options.preconnect.length > 0) {
    options.preconnect.forEach(url => {
      // Skip if already exists
      if (document.querySelector(`link[rel="preconnect"][href="${url}"]`)) return;

      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Add prefetch hints
  if (options.prefetch && options.prefetch.length > 0) {
    options.prefetch.forEach(url => {
      // Skip if already exists
      if (document.querySelector(`link[rel="prefetch"][href="${url}"]`)) return;

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  // Add preload hints
  if (options.preload && options.preload.length > 0) {
    options.preload.forEach(item => {
      // Skip if already exists
      if (document.querySelector(`link[rel="preload"][href="${item.href}"]`)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = item.href;
      link.as = item.as;
      if (item.type) link.type = item.type;
      if (item.crossOrigin) link.crossOrigin = item.crossOrigin;
      document.head.appendChild(link);
    });
  }

  // Add prerender hints
  if (options.prerender && options.prerender.length > 0) {
    options.prerender.forEach(url => {
      // Skip if already exists
      if (document.querySelector(`link[rel="prerender"][href="${url}"]`)) return;

      const link = document.createElement('link');
      link.rel = 'prerender';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  // Add DNS prefetch hints
  if (options.dnsPrefetch && options.dnsPrefetch.length > 0) {
    options.dnsPrefetch.forEach(url => {
      // Skip if already exists
      if (document.querySelector(`link[rel="dns-prefetch"][href="${url}"]`)) return;

      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }
};

/**
 * Preload critical resources for the current page
 */
export const preloadCriticalResources = () => {
  // Add preconnects
  addResourceHints({
    preconnect: [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://res.cloudinary.com',
      'https://api.telegram.org'
    ],
    // Add default preloads
    preload: [
      { href: '/fonts/inter-regular.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { href: '/fonts/inter-medium.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { href: '/logo.svg', as: 'image' }
    ]
  });
};

/**
 * Defer loading of non-critical resources
 */
export const deferNonCriticalResources = () => {
  // Lazy-load below-the-fold images
  const lazyLoadImages = () => {
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      // Skip if in viewport
      const rect = img.getBoundingClientRect();
      const isInViewport = rect.top < window.innerHeight && rect.bottom >= 0;

      if (!isInViewport) {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
      } else {
        img.setAttribute('fetchpriority', 'high');
      }
    });
  };

  // Defer non-critical CSS
  const deferNonCriticalCSS = () => {
    const links = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical="true"])');
    links.forEach(link => {
      link.setAttribute('media', 'print');
      link.setAttribute('onload', 'this.media="all"');
    });
  };

  // Defer non-critical JavaScript
  const deferNonCriticalJS = () => {
    const scripts = document.querySelectorAll('script:not([data-critical="true"])');
    scripts.forEach(script => {
      if (!script.hasAttribute('src') || script.hasAttribute('async') || script.hasAttribute('defer')) return;

      script.setAttribute('defer', '');
    });
  };

  // Wait for a bit to not block initial rendering
  setTimeout(() => {
    lazyLoadImages();
    deferNonCriticalCSS();
    deferNonCriticalJS();
  }, 100);
};

/**
 * Measure and report Core Web Vitals metrics
 */
export const measureCoreWebVitals = () => {
  if (typeof window === 'undefined' || typeof performance === 'undefined') return;

  // Measure Largest Contentful Paint (LCP)
  const observeLCP = () => {
    const entryTypes = ['largest-contentful-paint'];

    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];

        // Report LCP
        console.log(`Largest Contentful Paint: ${Math.round(lastEntry.startTime)}ms`);

        // Send to analytics
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'LCP',
            value: Math.round(lastEntry.startTime),
            non_interaction: true
          });
        }
      });

      observer.observe({ type: entryTypes[0], buffered: true });
    } catch (e) {
      console.error('PerformanceObserver for LCP not supported', e);
    }
  };

  // Measure First Input Delay (FID)
  const observeFID = () => {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0];

        // Report FID
        console.log(`First Input Delay: ${Math.round(firstEntry.processingStart - firstEntry.startTime)}ms`);

        // Send to analytics
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'FID',
            value: Math.round(firstEntry.processingStart - firstEntry.startTime),
            non_interaction: true
          });
        }
      });

      observer.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.error('PerformanceObserver for FID not supported', e);
    }
  };

  // Measure Cumulative Layout Shift (CLS)
  const observeCLS = () => {
    let clsValue = 0;
    let clsEntries = [];

    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();

        entries.forEach(entry => {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            const firstSessionEntry = clsEntries.length === 0;
            const entrySameWindow = clsEntries.length > 0 && entry.startTime - clsEntries[clsEntries.length - 1].startTime < 1000;

            if (firstSessionEntry || entrySameWindow) {
              clsEntries.push(entry);
            } else {
              clsEntries = [entry];
            }

            // Update CLS value
            clsValue = clsEntries
              .map(entry => entry.value)
              .reduce((sum, value) => sum + value, 0);
          }
        });

        // Report CLS
        console.log(`Cumulative Layout Shift: ${clsValue.toFixed(4)}`);

        // Send to analytics
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'CLS',
            value: Math.round(clsValue * 1000),
            non_interaction: true
          });
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.error('PerformanceObserver for CLS not supported', e);
    }
  };

  // Start measuring after main content is likely loaded
  window.addEventListener('load', () => {
    // Use requestIdleCallback or setTimeout as a fallback
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        observeLCP();
        observeFID();
        observeCLS();
      });
    } else {
      setTimeout(() => {
        observeLCP();
        observeFID();
        observeCLS();
      }, 500);
    }
  });
};

// Declare global gtag for TypeScript
declare global {
  interface Window {
    gtag: any;
  }
}

/**
 * Initialize all performance optimizations
 */
export const initPerformanceOptimizations = () => {
  preloadCriticalResources();
  setTimeout(() => {
    deferNonCriticalResources();
    measureCoreWebVitals();
  }, 100);
};

/**
 * Report web vitals to analytics
 */
export const reportWebVitals = (metric: { name: string; value: number; delta: number; id: string }) => {
  // Log to console in development
  console.log(`Web Vital: ${metric.name} - ${metric.value}`);

  // Send to analytics in production
  if (window.gtag) {
    window.gtag('event', 'web_vitals', {
      event_category: 'Web Vitals',
      event_label: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
      metric_id: metric.id,
      metric_delta: metric.delta
    });
  }
};

export default {
  addResourceHints,
  preloadCriticalResources,
  deferNonCriticalResources,
  measureCoreWebVitals,
  initPerformanceOptimizations,
  reportWebVitals
};
