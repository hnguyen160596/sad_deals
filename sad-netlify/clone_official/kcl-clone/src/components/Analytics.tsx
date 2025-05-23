import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Track generic events
export const trackEvent = (eventName: string, category?: string, label?: string) => {
  try {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        event_category: category,
        event_label: label
      });
    }
  } catch (e) {
    // Silently fail
  }
};

// Track click events
export const trackClick = (component: string, action: string) => {
  try {
    // Legacy analytics and Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'click', {
        component: component,
        action: action
      });
    }
  } catch (error) {
    // Silently fail
  }
};

// Track form submissions
export const trackFormSubmit = (formName: string, formData?: any) => {
  try {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'form_submit', {
        form_name: formName,
        form_data: formData
      });
    }
  } catch (e) {
    // Silently fail
  }
};

// Track search events
export const trackSearch = (searchTerm: string, searchType?: string) => {
  try {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'search', {
        search_term: searchTerm,
        search_type: searchType
      });
    }
  } catch (e) {
    // Silently fail
  }
};

// Track ecommerce events
export const trackEcommerce = {
  viewProduct: (productData: any) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'view_item', productData);
      }
    } catch (e) {
      // Silently fail
    }
  },
  addToCart: (cartData: any) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'add_to_cart', cartData);
      }
    } catch (e) {
      // Silently fail
    }
  },
  initiateCheckout: (checkoutData: any) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'begin_checkout', checkoutData);
      }
    } catch (e) {
      // Silently fail
    }
  },
  purchase: (purchaseData: any) => {
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'purchase', purchaseData);
      }
    } catch (e) {
      // Silently fail
    }
  }
};

// Track page views
export const trackPageView = (pageTitle: string, pagePath: string) => {
  try {
    // Google Analytics 4 - using a safeguard for the analytics ID
    const analyticsId = 'G-EXAMPLE123'; // Default fallback

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', analyticsId, {
        page_title: pageTitle,
        page_path: pagePath
      });

      (window as any).gtag('event', 'page_view', {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath
      });
    }
  } catch (error) {
    // Silently fail
  }
};

// Track conversion events
export const trackConversion = (action: string, value: number = 0, currency: string = 'USD') => {
  try {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        action: action,
        value: value,
        currency: currency
      });
    }
  } catch (error) {
    // Silently fail
  }
};

// Initialize Google Analytics
const initGoogleAnalytics = () => {
  if (typeof window === 'undefined') return;

  // Create script elements for Google Analytics
  const createGoogleAnalyticsScript = () => {
    try {
      // Create the Google Analytics tag
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=G-EXAMPLE123`;

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-EXAMPLE123', {
          send_page_view: false
        });
      `;

      // Add scripts to the document
      document.head.appendChild(script1);
      document.head.appendChild(script2);
    } catch (error) {
      // Silently fail
    }
  };

  // Initialize if not already done
  if (!(window as any).gtag) {
    createGoogleAnalyticsScript();
  }
};

// Main Analytics component
const Analytics: React.FC = () => {
  const location = useLocation();

  // Initialize analytics on mount
  useEffect(() => {
    try {
      initGoogleAnalytics();
    } catch (error) {
      // Silently fail
    }
  }, []);

  // Track page views when location changes
  useEffect(() => {
    try {
      const pageTitle = document.title;
      const pagePath = location.pathname + location.search;
      trackPageView(pageTitle, pagePath);
    } catch (error) {
      // Silently fail
    }
  }, [location]);

  return null; // This component doesn't render anything
};

export default Analytics;
