# Google Tag Manager Setup Guide

This guide provides step-by-step instructions for setting up Google Tag Manager (GTM) for your website.

## What is Google Tag Manager?

Google Tag Manager is a tag management system that allows you to quickly and easily update measurement codes and related code fragments collectively known as "tags" on your website or mobile app. Once the small segment of Tag Manager code has been added to your project, you can deploy analytics and measurement tag configurations from a web-based user interface.

## Benefits of Using GTM

- Manage all your tracking codes in one place
- Add or update tags without modifying code (non-developers can make changes)
- Deploy changes quickly and safely with version control
- Implement complex tracking more easily
- Reduce errors in tag implementation

## Setup Process

### Step 1: Create a GTM Account and Container

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Click "Create Account"
3. Enter an account name (typically your company name)
4. Enter a container name (typically your website name)
5. Select "Web" as the target platform
6. Click "Create"
7. Accept the GTM Terms of Service

### Step 2: Install GTM on Your Website

After creating your account and container, GTM will provide you with installation code:

1. Add the following code as high as possible in the `<head>` of your website:
   ```html
   <!-- Google Tag Manager -->
   <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
   new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
   j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
   'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
   })(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
   <!-- End Google Tag Manager -->
   ```

2. Add the following code immediately after the opening `<body>` tag:
   ```html
   <!-- Google Tag Manager (noscript) -->
   <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
   height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
   <!-- End Google Tag Manager (noscript) -->
   ```

Replace `GTM-XXXXXXX` with your actual GTM ID.

### Step 3: Configure Environment Variables

1. Add your GTM ID to your environment variables:
   ```
   VITE_GTM_ID=GTM-XXXXXXX
   ```

2. This ID will be automatically used by the `GoogleTagManager` component in your React app.

## Adding Tags in GTM

### Google Analytics 4 Setup

1. In GTM, go to "Tags" → "New"
2. Choose "Google Analytics: GA4 Configuration"
3. Enter your Measurement ID (G-XXXXXXXX)
4. Choose "All Pages" as the trigger
5. Click "Save"

### Custom Event Tracking

1. In GTM, go to "Variables" → "User-Defined Variables" → "New"
2. Configure custom variables for tracking specific events
3. Create tags that use these variables
4. Set appropriate triggers for when the tags should fire

## Using the dataLayer

The dataLayer is an array that GTM uses to receive data. You can push data to it like this:

```js
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  'event': 'event_name',
  'variable_name': 'variable_value'
});
```

Our React application includes helper functions for pushing data to the dataLayer:

```jsx
import { trackEvent, trackEcommerceEvent } from '../components/GoogleTagManager';

// Track a simple event
trackEvent('button_click', {
  buttonName: 'add_to_cart',
  productId: '12345'
});

// Track an ecommerce event
trackEcommerceEvent('add_to_cart', [
  {
    item_id: 'SKU_12345',
    item_name: 'Product Name',
    price: 19.99,
    quantity: 1
  }
]);
```

## Common GTM Use Cases

1. **Event Tracking**: Button clicks, form submissions, video views
2. **Ecommerce Tracking**: Product impressions, add to cart, checkout, purchases
3. **Custom Dimensions**: User types, logged-in status, page categories
4. **Cross-Domain Tracking**: Track users across multiple domains
5. **Third-Party Tags**: Social media pixels, marketing tools, etc.

## Best Practices

- Use a consistent naming convention for your tags and variables
- Create a clear trigger strategy
- Test tags thoroughly in GTM's preview mode before publishing
- Use folders to organize your tags, especially in complex implementations
- Regularly audit and clean up unused tags and variables
- Document your GTM implementation for future reference
- Implement data layer version control

## Testing Your Implementation

1. Use the GTM Preview mode to test your tags
2. Verify that data is being sent correctly to Google Analytics
3. Check browser developer tools (Network tab) to ensure tags are firing
4. Use the "GA Debug" Chrome extension for detailed Analytics debugging

## Additional Resources

- [Google Tag Manager Help Center](https://support.google.com/tagmanager/)
- [Google Analytics 4 Developer Documentation](https://developers.google.com/analytics)
- [GTM Fundamentals Course](https://analytics.google.com/analytics/academy/)
