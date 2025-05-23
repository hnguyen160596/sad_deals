import { createClient } from 'contentful';
import { redis } from './redis-cache';
import { getPlaiceholder } from 'plaiceholder';

// Define Contentful content types
export type DealEntry = {
  title: string;
  slug: string;
  store: string;
  description: string;
  originalPrice: string;
  currentPrice: string;
  discount: number;
  isExpiring: boolean;
  isBestSeller: boolean;
  image: {
    url: string;
    width: number;
    height: number;
    description: string;
  };
  categories: string[];
  url: string;
  postedDate: string;
  expiryDate: string;
};

export type StoreEntry = {
  name: string;
  slug: string;
  logo: {
    url: string;
    width: number;
    height: number;
  };
  description: string;
  featuredDeals: string[];
  categories: string[];
};

export type BlogEntry = {
  title: string;
  slug: string;
  featuredImage: {
    url: string;
    width: number;
    height: number;
    description: string;
  };
  excerpt: string;
  content: any; // Rich text content
  author: {
    name: string;
    avatar: string;
  };
  publishDate: string;
  categories: string[];
  tags: string[];
};

export type BannerEntry = {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: {
    url: string;
    width: number;
    height: number;
  };
  backgroundColor: string;
  textColor: string;
  position: 'top' | 'middle' | 'bottom';
  startDate: string;
  endDate: string;
  isActive: boolean;
};

// Initialize Contentful client
export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || '',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master',
});

// Cache durations in seconds
const CACHE_DURATIONS = {
  deals: 60 * 5, // 5 minutes
  stores: 60 * 60 * 24, // 24 hours
  blogs: 60 * 30, // 30 minutes
  banners: 60 * 15, // 15 minutes
};

// Cache key prefixes
const CACHE_KEYS = {
  deals: 'contentful:deals:',
  stores: 'contentful:stores:',
  blogs: 'contentful:blogs:',
  banners: 'contentful:banners:',
};

/**
 * Get image with blur data URL
 */
async function getImageWithBlurUrl(imageUrl: string) {
  try {
    // Check if blur hash is already cached
    const cacheKey = `blur:${imageUrl}`;
    const cachedBlurHash = await redis.get<string>(cacheKey);

    if (cachedBlurHash) {
      return {
        url: imageUrl,
        blurDataUrl: cachedBlurHash,
      };
    }

    // Generate blur hash
    const { base64 } = await getPlaiceholder(imageUrl);

    // Cache the blur hash for future use
    await redis.set(cacheKey, base64, { ex: 60 * 60 * 24 * 7 }); // 7 days

    return {
      url: imageUrl,
      blurDataUrl: base64,
    };
  } catch (error) {
    console.error(`Error generating blur hash for ${imageUrl}:`, error);
    return {
      url: imageUrl,
      blurDataUrl: undefined,
    };
  }
}

/**
 * Get all deals from Contentful with caching
 */
export async function getDeals(limit = 10, skip = 0, filter?: { [key: string]: any }) {
  // Generate cache key
  const filterString = filter ? JSON.stringify(filter) : '';
  const cacheKey = `${CACHE_KEYS.deals}${limit}:${skip}:${filterString}`;

  try {
    // Check cache first
    const cachedDeals = await redis.get(cacheKey);
    if (cachedDeals) return JSON.parse(cachedDeals);

    // Build query
    const query: any = {
      content_type: 'deal',
      limit,
      skip,
      order: '-sys.createdAt',
    };

    // Add filters if provided
    if (filter) {
      if (filter.store) query['fields.store'] = filter.store;
      if (filter.category) query['fields.categories[in]'] = filter.category;
      if (filter.isExpiring) query['fields.isExpiring'] = true;
      if (filter.isBestSeller) query['fields.isBestSeller'] = true;
    }

    // Fetch data
    const response = await contentfulClient.getEntries(query);

    // Map entries to DealEntry type
    const deals = await Promise.all(response.items.map(async (item: any) => {
      // Process image with blur hash
      const imageUrl = item.fields.image?.fields?.file?.url
        ? `https:${item.fields.image.fields.file.url}`
        : null;

      const image = imageUrl
        ? await getImageWithBlurUrl(imageUrl)
        : null;

      return {
        id: item.sys.id,
        title: item.fields.title,
        slug: item.fields.slug,
        store: item.fields.store,
        description: item.fields.description,
        originalPrice: item.fields.originalPrice,
        currentPrice: item.fields.currentPrice,
        discount: item.fields.discount,
        isExpiring: item.fields.isExpiring || false,
        isBestSeller: item.fields.isBestSeller || false,
        image: image ? {
          url: image.url,
          blurDataUrl: image.blurDataUrl,
          width: item.fields.image.fields.file.details.image.width,
          height: item.fields.image.fields.file.details.image.height,
          description: item.fields.image.fields.description || '',
        } : null,
        categories: item.fields.categories || [],
        url: item.fields.url,
        postedDate: item.fields.postedDate || item.sys.createdAt,
        expiryDate: item.fields.expiryDate,
      };
    }));

    // Cache results
    await redis.set(cacheKey, JSON.stringify(deals), { ex: CACHE_DURATIONS.deals });

    return deals;
  } catch (error) {
    console.error('Error fetching deals from Contentful:', error);
    return [];
  }
}

/**
 * Get a single deal by slug
 */
export async function getDealBySlug(slug: string) {
  const cacheKey = `${CACHE_KEYS.deals}slug:${slug}`;

  try {
    // Check cache first
    const cachedDeal = await redis.get(cacheKey);
    if (cachedDeal) return JSON.parse(cachedDeal);

    // Fetch data
    const response = await contentfulClient.getEntries({
      content_type: 'deal',
      'fields.slug': slug,
      limit: 1,
    });

    if (!response.items.length) return null;

    const item = response.items[0];

    // Process image with blur hash
    const imageUrl = item.fields.image?.fields?.file?.url
      ? `https:${item.fields.image.fields.file.url}`
      : null;

    const image = imageUrl
      ? await getImageWithBlurUrl(imageUrl)
      : null;

    const deal = {
      id: item.sys.id,
      title: item.fields.title,
      slug: item.fields.slug,
      store: item.fields.store,
      description: item.fields.description,
      originalPrice: item.fields.originalPrice,
      currentPrice: item.fields.currentPrice,
      discount: item.fields.discount,
      isExpiring: item.fields.isExpiring || false,
      isBestSeller: item.fields.isBestSeller || false,
      image: image ? {
        url: image.url,
        blurDataUrl: image.blurDataUrl,
        width: item.fields.image.fields.file.details.image.width,
        height: item.fields.image.fields.file.details.image.height,
        description: item.fields.image.fields.description || '',
      } : null,
      categories: item.fields.categories || [],
      url: item.fields.url,
      postedDate: item.fields.postedDate || item.sys.createdAt,
      expiryDate: item.fields.expiryDate,
    };

    // Cache result
    await redis.set(cacheKey, JSON.stringify(deal), { ex: CACHE_DURATIONS.deals });

    return deal;
  } catch (error) {
    console.error(`Error fetching deal with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Get all stores from Contentful with caching
 */
export async function getStores(limit = 50) {
  const cacheKey = `${CACHE_KEYS.stores}all:${limit}`;

  try {
    // Check cache first
    const cachedStores = await redis.get(cacheKey);
    if (cachedStores) return JSON.parse(cachedStores);

    // Fetch data
    const response = await contentfulClient.getEntries({
      content_type: 'store',
      limit,
      order: 'fields.name',
    });

    // Map entries to StoreEntry type
    const stores = await Promise.all(response.items.map(async (item: any) => {
      // Process logo with blur hash
      const logoUrl = item.fields.logo?.fields?.file?.url
        ? `https:${item.fields.logo.fields.file.url}`
        : null;

      const logo = logoUrl
        ? await getImageWithBlurUrl(logoUrl)
        : null;

      return {
        id: item.sys.id,
        name: item.fields.name,
        slug: item.fields.slug,
        logo: logo ? {
          url: logo.url,
          blurDataUrl: logo.blurDataUrl,
          width: item.fields.logo.fields.file.details.image.width,
          height: item.fields.logo.fields.file.details.image.height,
        } : null,
        description: item.fields.description,
        featuredDeals: item.fields.featuredDeals || [],
        categories: item.fields.categories || [],
      };
    }));

    // Cache results
    await redis.set(cacheKey, JSON.stringify(stores), { ex: CACHE_DURATIONS.stores });

    return stores;
  } catch (error) {
    console.error('Error fetching stores from Contentful:', error);
    return [];
  }
}

/**
 * Get all blog posts from Contentful with caching
 */
export async function getBlogPosts(limit = 10, skip = 0, category?: string) {
  const cacheKey = `${CACHE_KEYS.blogs}${limit}:${skip}:${category || 'all'}`;

  try {
    // Check cache first
    const cachedPosts = await redis.get(cacheKey);
    if (cachedPosts) return JSON.parse(cachedPosts);

    // Build query
    const query: any = {
      content_type: 'blogPost',
      limit,
      skip,
      order: '-fields.publishDate',
    };

    // Add category filter if provided
    if (category) {
      query['fields.categories[in]'] = category;
    }

    // Fetch data
    const response = await contentfulClient.getEntries(query);

    // Map entries to BlogEntry type
    const posts = await Promise.all(response.items.map(async (item: any) => {
      // Process image with blur hash
      const imageUrl = item.fields.featuredImage?.fields?.file?.url
        ? `https:${item.fields.featuredImage.fields.file.url}`
        : null;

      const image = imageUrl
        ? await getImageWithBlurUrl(imageUrl)
        : null;

      return {
        id: item.sys.id,
        title: item.fields.title,
        slug: item.fields.slug,
        featuredImage: image ? {
          url: image.url,
          blurDataUrl: image.blurDataUrl,
          width: item.fields.featuredImage.fields.file.details.image.width,
          height: item.fields.featuredImage.fields.file.details.image.height,
          description: item.fields.featuredImage.fields.description || '',
        } : null,
        excerpt: item.fields.excerpt,
        content: item.fields.content,
        author: {
          name: item.fields.author?.fields?.name || 'Anonymous',
          avatar: item.fields.author?.fields?.avatar?.fields?.file?.url
            ? `https:${item.fields.author.fields.avatar.fields.file.url}`
            : null,
        },
        publishDate: item.fields.publishDate,
        categories: item.fields.categories || [],
        tags: item.fields.tags || [],
      };
    }));

    // Cache results
    await redis.set(cacheKey, JSON.stringify(posts), { ex: CACHE_DURATIONS.blogs });

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts from Contentful:', error);
    return [];
  }
}

/**
 * Get active banners for display
 */
export async function getActiveBanners(position?: 'top' | 'middle' | 'bottom') {
  const cacheKey = `${CACHE_KEYS.banners}${position || 'all'}`;

  try {
    // Check cache first
    const cachedBanners = await redis.get(cacheKey);
    if (cachedBanners) return JSON.parse(cachedBanners);

    // Build query
    const query: any = {
      content_type: 'banner',
      'fields.isActive': true,
    };

    // Add position filter if provided
    if (position) {
      query['fields.position'] = position;
    }

    // Fetch data
    const response = await contentfulClient.getEntries(query);

    // Map entries to BannerEntry type
    const banners = await Promise.all(response.items.map(async (item: any) => {
      // Process image with blur hash
      const imageUrl = item.fields.image?.fields?.file?.url
        ? `https:${item.fields.image.fields.file.url}`
        : null;

      const image = imageUrl
        ? await getImageWithBlurUrl(imageUrl)
        : null;

      return {
        id: item.sys.id,
        title: item.fields.title,
        subtitle: item.fields.subtitle,
        ctaText: item.fields.ctaText,
        ctaLink: item.fields.ctaLink,
        image: image ? {
          url: image.url,
          blurDataUrl: image.blurDataUrl,
          width: item.fields.image.fields.file.details.image.width,
          height: item.fields.image.fields.file.details.image.height,
        } : null,
        backgroundColor: item.fields.backgroundColor || '#f0f0f0',
        textColor: item.fields.textColor || '#000000',
        position: item.fields.position,
        startDate: item.fields.startDate,
        endDate: item.fields.endDate,
        isActive: item.fields.isActive,
      };
    }));

    // Cache results
    await redis.set(cacheKey, JSON.stringify(banners), { ex: CACHE_DURATIONS.banners });

    return banners;
  } catch (error) {
    console.error('Error fetching banners from Contentful:', error);
    return [];
  }
}

/**
 * Invalidate Contentful cache by type
 */
export async function invalidateContentfulCache(type: 'deals' | 'stores' | 'blogs' | 'banners' | 'all') {
  try {
    if (type === 'all') {
      await redis.del(await redis.keys(`contentful:*`));
      return true;
    }

    await redis.del(await redis.keys(`${CACHE_KEYS[type]}*`));
    return true;
  } catch (error) {
    console.error(`Error invalidating Contentful cache for ${type}:`, error);
    return false;
  }
}
