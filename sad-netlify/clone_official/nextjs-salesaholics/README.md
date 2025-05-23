# Sales Aholics Deals - Enhanced Next.js Application

A high-performance, feature-rich deals and coupons platform built with Next.js and modern web technologies.

## Key Features

- **Server-Side Rendering (SSR)** with Next.js for optimal SEO and performance
- **Authentication System** with JWT and social login providers
- **Redis Caching** for API responses to improve load times
- **Headless CMS Integration** with Contentful for content management
- **Comprehensive Testing** with Playwright for E2E and visual regression tests

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API with server actions
- **Authentication**: NextAuth.js with JWT tokens
- **Caching**: Redis/Upstash for high-performance data caching
- **CMS**: Contentful headless CMS
- **Testing**: Playwright for E2E, React Testing Library for component tests
- **TypeScript**: For type safety
- **Deployment**: Prepared for Vercel/Netlify/AWS deployment

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- Bun (recommended) or npm
- Contentful account (or mock data mode for development)
- Redis instance (Upstash recommended for serverless) or mock cache mode

### Environment Variables

Create a `.env.local` file with the following variables:

```
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Social Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# Contentful
CONTENTFUL_SPACE_ID=your-contentful-space-id
CONTENTFUL_ACCESS_TOKEN=your-contentful-access-token
CONTENTFUL_ENVIRONMENT=master

# Redis/Upstash
UPSTASH_REDIS_URL=your-upstash-redis-url
UPSTASH_REDIS_TOKEN=your-upstash-redis-token
```

### Installation

```bash
# Clone the repository (if not already done)
git clone https://github.com/yourusername/salesaholics-deals.git
cd salesaholics-deals

# Install dependencies
bun install
# or
npm install

# Run the development server
bun run dev
# or
npm run dev
```

## Project Structure

```
nextjs-salesaholics/
├── .github/             # GitHub Actions workflows
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # Reusable UI components
│   │   └── ui/          # shadcn/ui components
│   ├── lib/             # Utility functions and libraries
│   │   ├── auth.ts      # Authentication configuration
│   │   ├── contentful.ts # CMS integration
│   │   └── redis-cache.ts # Caching utilities
│   └── types/           # TypeScript types and interfaces
├── tests/
│   ├── e2e/             # End-to-end tests
│   ├── unit/            # Unit tests
│   └── visual/          # Visual regression tests
├── .env.example         # Example environment variables
├── next.config.js       # Next.js configuration
└── tailwind.config.ts   # Tailwind CSS configuration
```

## Features Explained

### Server-Side Rendering (SSR)

The application leverages Next.js App Router for server-side rendering, providing:

- Improved SEO through server-rendered HTML
- Better performance with streaming and suspense
- Enhanced user experience with fast initial load times
- Reduced client-side JavaScript

### Authentication System

User authentication is handled by NextAuth.js with:

- Multiple providers (credentials, Google, Facebook)
- JWT token-based sessions
- Role-based access control
- Rate limiting for security
- Persistent sessions with secure cookies

### Redis Caching

API response caching with Redis/Upstash provides:

- Drastically reduced API response times
- Lower load on backend services
- Tag-based cache invalidation
- TTL (Time To Live) for auto-expiry
- Pattern-based cache clearing

### Headless CMS Integration

Contentful integration allows:

- Non-technical content management
- Structured content with rich media support
- Content versioning and scheduling
- Image optimization with blur placeholders
- Localization support

### Comprehensive Testing

Testing infrastructure includes:

- E2E tests with Playwright across multiple browsers
- Visual regression testing for UI consistency
- Component unit tests with React Testing Library
- Continuous integration via GitHub Actions

## Development Guidelines

- Follow the TypeScript conventions throughout the codebase
- Write unit tests for all new components
- Use server components where possible in the App Router
- Ensure accessibility standards are met
- Run the test suite before submitting PRs

## Performance Optimization

- Images are optimized using Next.js Image component with blur placeholders
- Redis caching reduces API calls and improves response times
- Code-splitting and lazy loading for optimal bundle sizes
- Server components reduce client JavaScript
- CDN-friendly with proper cache headers

## Deployment

The application is configured for deployment on Vercel, Netlify, or AWS:

- Automatic deployments via GitHub integration
- Environment variable management
- Preview deployments for PRs
- Serverless function support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- The shadcn/ui team for their excellent component library
- The Next.js team for their powerful framework
- The Contentful team for their headless CMS
- The Upstash team for their serverless Redis solution
