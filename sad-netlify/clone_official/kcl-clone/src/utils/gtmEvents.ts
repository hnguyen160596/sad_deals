/**
 * Google Tag Manager Custom Event Tracking
 *
 * This utility provides typed functions for sending custom events to Google Tag Manager,
 * ensuring consistent event naming and data structure across the application.
 */

// Types for various GTM events
interface GTMPageView {
  event: 'page_view';
  page: {
    title: string;
    path: string;
    search?: string;
  };
}

interface GTMProductView {
  event: 'view_item';
  ecommerce: {
    items: Array<{
      item_id: string;
      item_name: string;
      price: number;
      discount?: number;
      item_category?: string;
      item_brand?: string;
      currency: string;
    }>;
  };
}

interface GTMProductClick {
  event: 'select_item';
  ecommerce: {
    items: Array<{
      item_id: string;
      item_name: string;
      price: number;
      item_category?: string;
      item_brand?: string;
      currency: string;
    }>;
  };
}

interface GTMAddToCart {
  event: 'add_to_cart';
  ecommerce: {
    items: Array<{
      item_id: string;
      item_name: string;
      price: number;
      quantity: number;
      item_category?: string;
      item_brand?: string;
      currency: string;
    }>;
  };
}

interface GTMDealSaved {
  event: 'save_deal';
  deal_id: string;
  deal_title: string;
  deal_price: string | number;
  deal_store?: string;
  user_id?: string;
}

interface GTMUserSignup {
  event: 'sign_up';
  method: string;
  user_id?: string;
}

interface GTMUserLogin {
  event: 'login';
  method: string;
  user_id?: string;
}

interface GTMSearch {
  event: 'search';
  search_term: string;
  search_type?: string;
  search_results_count?: number;
}

interface GTMSocialShare {
  event: 'share';
  content_type: string;
  content_id: string;
  method: string;
}

interface GTMSubscribe {
  event: 'subscribe';
  subscription_type: string;
  user_id?: string;
}

interface GTMFormSubmit {
  event: 'form_submit';
  form_id: string;
  form_name: string;
  form_destination?: string;
}

interface GTMOutboundLink {
  event: 'outbound_link';
  link_url: string;
  link_text?: string;
  link_domain: string;
  is_affiliate?: boolean;
}

interface GTMCustomEvent {
  event: string;
  [key: string]: any;
}

type GTMEvent = GTMPageView | GTMProductView | GTMProductClick | GTMAddToCart |
  GTMDealSaved | GTMUserSignup | GTMUserLogin | GTMSearch | GTMSocialShare |
  GTMSubscribe | GTMFormSubmit | GTMOutboundLink | GTMCustomEvent;

/**
 * Push an event to the dataLayer
 * @param event The event object to push to the dataLayer
 */
export const pushToDataLayer = (event: GTMEvent): void => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(event);

    // Log events in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('GTM Event:', event);
    }
  }
};

/**
 * Track page view
 */
export const trackPageView = (title: string, path: string, search?: string): void => {
  pushToDataLayer({
    event: 'page_view',
    page: {
      title,
      path,
      ...(search && { search })
    }
  });
};

/**
 * Track product view
 */
export const trackProductView = (product: {
  id: string;
  name: string;
  price: number;
  discount?: number;
  category?: string;
  brand?: string;
  currency?: string;
}): void => {
  pushToDataLayer({
    event: 'view_item',
    ecommerce: {
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        ...(product.discount && { discount: product.discount }),
        ...(product.category && { item_category: product.category }),
        ...(product.brand && { item_brand: product.brand }),
        currency: product.currency || 'USD'
      }]
    }
  });
};

/**
 * Track product click
 */
export const trackProductClick = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  brand?: string;
  currency?: string;
}): void => {
  pushToDataLayer({
    event: 'select_item',
    ecommerce: {
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        ...(product.category && { item_category: product.category }),
        ...(product.brand && { item_brand: product.brand }),
        currency: product.currency || 'USD'
      }]
    }
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = (product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  brand?: string;
  currency?: string;
}): void => {
  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
        ...(product.category && { item_category: product.category }),
        ...(product.brand && { item_brand: product.brand }),
        currency: product.currency || 'USD'
      }]
    }
  });
};

/**
 * Track deal saved
 */
export const trackDealSaved = (deal: {
  id: string;
  title: string;
  price: string | number;
  store?: string;
  userId?: string;
}): void => {
  pushToDataLayer({
    event: 'save_deal',
    deal_id: deal.id,
    deal_title: deal.title,
    deal_price: deal.price,
    ...(deal.store && { deal_store: deal.store }),
    ...(deal.userId && { user_id: deal.userId })
  });
};

/**
 * Track user signup
 */
export const trackUserSignup = (method: string, userId?: string): void => {
  pushToDataLayer({
    event: 'sign_up',
    method,
    ...(userId && { user_id: userId })
  });
};

/**
 * Track user login
 */
export const trackUserLogin = (method: string, userId?: string): void => {
  pushToDataLayer({
    event: 'login',
    method,
    ...(userId && { user_id: userId })
  });
};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string, searchType?: string, resultsCount?: number): void => {
  pushToDataLayer({
    event: 'search',
    search_term: searchTerm,
    ...(searchType && { search_type: searchType }),
    ...(resultsCount !== undefined && { search_results_count: resultsCount })
  });
};

/**
 * Track social share
 */
export const trackSocialShare = (contentType: string, contentId: string, method: string): void => {
  pushToDataLayer({
    event: 'share',
    content_type: contentType,
    content_id: contentId,
    method
  });
};

/**
 * Track subscription
 */
export const trackSubscribe = (subscriptionType: string, userId?: string): void => {
  pushToDataLayer({
    event: 'subscribe',
    subscription_type: subscriptionType,
    ...(userId && { user_id: userId })
  });
};

/**
 * Track form submission
 */
export const trackFormSubmit = (formId: string, formName: string, formDestination?: string): void => {
  pushToDataLayer({
    event: 'form_submit',
    form_id: formId,
    form_name: formName,
    ...(formDestination && { form_destination: formDestination })
  });
};

/**
 * Track outbound link click
 */
export const trackOutboundLink = (linkUrl: string, linkText?: string, isAffiliate?: boolean): void => {
  // Extract domain from URL
  let domain = '';
  try {
    domain = new URL(linkUrl).hostname;
  } catch (e) {
    console.error('Invalid URL in trackOutboundLink:', linkUrl);
    domain = 'unknown';
  }

  pushToDataLayer({
    event: 'outbound_link',
    link_url: linkUrl,
    link_domain: domain,
    ...(linkText && { link_text: linkText }),
    ...(isAffiliate !== undefined && { is_affiliate: isAffiliate })
  });
};

/**
 * Track a custom event with custom data
 */
export const trackCustomEvent = (eventName: string, eventData: Record<string, any>): void => {
  pushToDataLayer({
    event: eventName,
    ...eventData
  });
};

// Type definitions for GTM data layer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export default {
  trackPageView,
  trackProductView,
  trackProductClick,
  trackAddToCart,
  trackDealSaved,
  trackUserSignup,
  trackUserLogin,
  trackSearch,
  trackSocialShare,
  trackSubscribe,
  trackFormSubmit,
  trackOutboundLink,
  trackCustomEvent
};
