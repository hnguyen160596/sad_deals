import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface GoogleTagManagerProps {
  gtmId: string;
}

const GoogleTagManager: React.FC<GoogleTagManagerProps> = ({ gtmId }) => {
  const location = useLocation();

  // Initialize GTM
  useEffect(() => {
    if (!gtmId) return;

    // Define dataLayer and push the GTM code
    const dataLayerCode = `
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });
    `;

    // Create and append the GTM script
    const script = document.createElement('script');
    script.async = true;
    script.innerHTML = dataLayerCode;
    document.head.appendChild(script);

    // Create and append the main GTM script
    const mainScript = document.createElement('script');
    mainScript.async = true;
    mainScript.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    document.head.appendChild(mainScript);

    return () => {
      // Clean up scripts when component unmounts
      document.head.removeChild(script);
      document.head.removeChild(mainScript);
    };
  }, [gtmId]);

  // Track page views
  useEffect(() => {
    if (!gtmId || !window.dataLayer) return;

    window.dataLayer.push({
      event: 'pageview',
      page: {
        path: location.pathname,
        title: document.title,
        location: window.location.href,
        search: location.search
      }
    });
  }, [location, gtmId]);

  // NoScript fallback for when JavaScript is disabled
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
};

// Helper function to push data to the dataLayer
export const pushToDataLayer = (data: any) => {
  if (typeof window === 'undefined' || !window.dataLayer) return;
  window.dataLayer.push(data);
};

// Helper function to track events
export const trackEvent = (eventName: string, eventParams: object = {}) => {
  pushToDataLayer({
    event: eventName,
    ...eventParams
  });
};

// Helper function to track ecommerce events
export const trackEcommerceEvent = (
  eventName: 'view_item' | 'add_to_cart' | 'purchase' | 'view_item_list',
  products: any[], // Array of product objects
  additionalParams: object = {}
) => {
  pushToDataLayer({
    event: eventName,
    ecommerce: {
      items: products,
      ...additionalParams
    }
  });
};

export default GoogleTagManager;
