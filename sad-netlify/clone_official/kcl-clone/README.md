# Sales Aholics Deals - Deep Clone Project

This project is a comprehensive deep clone of a popular deals and coupons website, implemented with React, Vite, TypeScript, and Tailwind CSS.

## Features

### Core Pages & Components
- **Homepage**: Featured deals, promotions, and store highlights
- **Stores**: Browse stores alphabetically with logo icons
- **Deals**: Browse deals by category with filters
- **Coupons**: Coupon listings by category
- **Tips**: Money-saving tips and articles
- **Detail Pages**: Individual store, deal, coupon, and tip pages
- **Search**: Comprehensive search functionality with advanced filters and sorting
- **User Accounts**: Login, signup, profile, and favorites management
- **Comments**: Comment and reply system for deals and articles
- **Email Notifications**: Email preferences and subscription management
- **Dark Mode**: Full dark mode support with system preference detection

### Technical Highlights
- **SEO Optimization**: Complete meta tags, JSON-LD structured data
- **Dynamic Routing**: All paths properly handled
- **Responsive Design**: Mobile-first with Tailwind CSS, optimized for all device sizes
- **Code Splitting**: React.lazy + Suspense for optimal loading
- **ClonedPage Component**: Renders HTML content from scraped pages
- **Sample Page Generation**: Scripts to create test content
- **Analytics Tracking**: Comprehensive event tracking for page views, searches, and interactions
- **Accessibility**: Semantic HTML and ARIA attributes for better screen reader support
- **Internationalization**: Multilingual support with i18next
- **A/B Testing**: Components for UI experimentation
- **Unit Testing**: Vitest and React Testing Library
- **Theme Context**: Context API for theme management and persistence

## Navigation

### Main Sections
- **Homepage**: `/`
- **Stores List**: `/stores`
- **Today's Deals**: `/deals`
- **Tips & Hacks**: `/tips`
- **Search**: `/search?q=your-query`

### User Account Pages
- **Login**: `/login`
- **Signup**: `/signup`
- **Forgot Password**: `/forgot-password`
- **User Profile**: `/profile`
- **Email Preferences**: `/email-preferences`

### Store Pages
- **Amazon**: `/coupons-for/amazon`
- **Target**: `/coupons-for/target`
- **Walmart**: `/coupons-for/walmart`
- **CVS**: `/coupons-for/cvs`
- **Costco**: `/coupons-for/costco`
- **Other Stores**: `/coupons-for/[store-name]`

### Deal Categories
- **Online Deals**: `/deals/online`
- **Freebies**: `/deals/freebies`
- **Clearance**: `/deals/clearance`
- **Gift Cards**: `/deals/gift-card`
- **Other Categories**: `/deals/[category]`

### Coupon Categories
- **Diapers**: `/coupons/diapers`
- **Food**: `/coupons/food`
- **Toilet Paper**: `/coupons/toilet-paper`
- **Other Categories**: `/coupons/[category]`

### Tips Categories
- **Home**: `/tips/home`
- **Couponing**: `/tips/couponing`
- **Travel**: `/tips/travel`
- **Store Hacks**: `/tips/store-hacks`
- **Other Categories**: `/tips/[category]`

## Sample Pages

The project includes sample pages at `/clone/*` paths, which demonstrate the ClonedPage component in action. These include:

- `/clone/home`
- `/clone/deals`
- `/clone/stores`
- `/clone/coupons-for/amazon`
- `/clone/coupons/diapers`

## Mobile Features

The application is fully responsive with mobile-optimized features:

- **Mobile Menu**: Hamburger menu for navigation on small screens
- **Responsive Grid Layout**: Adapts to different screen sizes
- **Touch-Friendly UI**: Larger touch targets for mobile users
- **Mobile Search**: Optimized search experience for mobile devices
- **Scroll-to-Top Button**: Easy navigation on long pages

## Analytics

The application includes a comprehensive analytics system:

- **Page View Tracking**: Tracks user navigation between pages
- **Search Analytics**: Monitors search terms and result counts
- **Event Tracking**: Records user interactions with key UI elements
- **Ecommerce Tracking**: For tracking product views and interactions
- **Performance Monitoring**: Measures and reports on application performance

## Internationalization

The application supports multiple languages:

- **English**: Default language
- **Spanish**: Full translations available
- **Language Switcher**: Easily switch between languages
- **Automatic Detection**: Detects user's preferred language

## Theme System

The app includes a comprehensive theme system:

- **Light/Dark Mode**: Full support for light and dark themes
- **System Preference**: Automatically follows system preference
- **Manual Selection**: Users can override system preference
- **Theme Persistence**: Remembers user's theme preference
- **Smooth Transitions**: CSS transitions between theme changes

## A/B Testing

The app includes components for UI experimentation:

- **ABTestWrapper**: Component for rendering different UI variants
- **Variant Tracking**: Analytics integration for variant performance
- **Predefined Tests**: Several tests for key UI components

## Development

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Run tests
bun run test

# Run tests with coverage
bun run test:coverage

# Preview production build
bun run preview
```

## Scraper Script

The project includes a script for scraping and saving content from the original site:

```bash
# Run the scraper script
node scripts/clone-site.js

# Generate test pages
node scripts/create-sample-pages.js
```

## Latest Updates

### Version 18: Dark Mode and Theme System
- Added dark mode support throughout the application
- Implemented theme switching with light, dark, and system options
- Enhanced Footer component with improved dark mode styling
- Added theme transition effects for smooth theme changes
- Added unit tests for ThemeContext and ThemeSwitcher

### Version 17: Internationalization and Testing
- Added advanced search filters and sorting options
- Integrated A/B testing for UI components
- Added internationalization with i18next
- Improved performance with lazy loading
- Added unit tests with Vitest and React Testing Library

### Version 16: Advanced Features and Optimization
- Added advanced search filters and sorting options
- Integrated A/B testing for UI components
- Added internationalization with i18next
- Improved performance with lazy loading
- Added unit tests with Vitest and React Testing Library

### Version 14-15: User Engagement Features
- Added comment system for deals and articles
- Implemented email notification system with preferences
- Enhanced user accounts with favorites management

### Version 12-13: User Accounts and Authentication
- Added user login, signup, password reset
- Implemented user profiles with favorites
- Enhanced header with user menu

### Version 10-11: Analytics Implementation
- Added comprehensive analytics tracking system
- Integrated event tracking for user interactions
- Added page view and search tracking

### Version 8-9: Search and Mobile Improvements
- Implemented global search feature with advanced filters
- Enhanced responsive design for all device sizes
- Improved mobile navigation and menus
- Added touch-friendly UI elements and scroll-to-top button
