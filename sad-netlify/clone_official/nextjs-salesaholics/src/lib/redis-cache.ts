import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || "",
  token: process.env.UPSTASH_REDIS_TOKEN || "",
});

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Cache key prefix
  tags?: string[]; // Tags for cache invalidation
}

// Type for cached response
interface CachedResponse {
  data: any;
  timestamp: number;
  tags: string[];
}

// Default options
const DEFAULT_OPTIONS: CacheOptions = {
  ttl: 60 * 60, // 1 hour
  prefix: "api-cache:",
  tags: [],
};

/**
 * Cache middleware for API routes
 * @param handler - API route handler
 * @param options - Cache options
 */
export function withCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: CacheOptions
) {
  const { ttl, prefix, tags } = { ...DEFAULT_OPTIONS, ...options };

  return async (req: NextRequest) => {
    // Don't cache non-GET requests
    if (req.method !== "GET") {
      return handler(req);
    }

    // Generate cache key from URL
    const url = new URL(req.url);
    const cacheKey = `${prefix}${url.pathname}${url.search}`;

    try {
      // Check cache first
      const cachedResponse = await redis.get<CachedResponse>(cacheKey);

      if (cachedResponse) {
        // Check if cache is still valid
        const now = Date.now();
        const age = now - cachedResponse.timestamp;

        if (age < ttl! * 1000) {
          console.log(`Cache hit for ${cacheKey}`);
          return NextResponse.json(cachedResponse.data, {
            headers: {
              "X-Cache": "HIT",
              "X-Cache-Age": `${Math.floor(age / 1000)}s`,
            },
          });
        }
        console.log(`Cache expired for ${cacheKey}`);
      }
    } catch (error) {
      console.error(`Cache error for ${cacheKey}:`, error);
      // Continue on cache error
    }

    // Cache miss or error, call handler
    try {
      const response = await handler(req);
      const responseData = await response.json();

      // Only cache successful responses
      if (response.status >= 200 && response.status < 300) {
        try {
          // Store in cache
          await redis.set(
            cacheKey,
            {
              data: responseData,
              timestamp: Date.now(),
              tags: tags || [],
            },
            { ex: ttl }
          );

          // If tags are provided, store cache key in tag sets
          if (tags && tags.length > 0) {
            for (const tag of tags) {
              await redis.sadd(`${prefix}tag:${tag}`, cacheKey);
            }
          }
        } catch (error) {
          console.error(`Error setting cache for ${cacheKey}:`, error);
        }
      }

      // Return the response with cache miss header
      return NextResponse.json(responseData, {
        headers: {
          "X-Cache": "MISS",
        },
      });
    } catch (error) {
      console.error(`Handler error for ${cacheKey}:`, error);
      throw error;
    }
  };
}

/**
 * Invalidate cache by tags
 * @param tags - Tags to invalidate
 * @param prefix - Cache key prefix
 */
export async function invalidateCacheTags(
  tags: string[],
  prefix: string = DEFAULT_OPTIONS.prefix!
) {
  try {
    for (const tag of tags) {
      const cacheKeys = await redis.smembers<string[]>(`${prefix}tag:${tag}`);

      if (cacheKeys && cacheKeys.length > 0) {
        // Delete all cache entries with this tag
        await redis.del(cacheKeys);
        // Remove tag set
        await redis.del(`${prefix}tag:${tag}`);
        console.log(`Invalidated ${cacheKeys.length} entries for tag ${tag}`);
      }
    }
    return true;
  } catch (error) {
    console.error("Cache invalidation error:", error);
    return false;
  }
}

/**
 * Invalidate cache by key pattern
 * @param pattern - Key pattern to invalidate
 * @param prefix - Cache key prefix
 */
export async function invalidateCachePattern(
  pattern: string,
  prefix: string = DEFAULT_OPTIONS.prefix!
) {
  try {
    const cacheKeys = await redis.keys(`${prefix}${pattern}`);

    if (cacheKeys && cacheKeys.length > 0) {
      await redis.del(cacheKeys);
      console.log(`Invalidated ${cacheKeys.length} entries matching ${pattern}`);
    }
    return true;
  } catch (error) {
    console.error("Cache invalidation error:", error);
    return false;
  }
}

/**
 * Get cache analytics
 */
export async function getCacheAnalytics(
  prefix: string = DEFAULT_OPTIONS.prefix!
) {
  try {
    const keys = await redis.keys(`${prefix}*`);
    const tagKeys = await redis.keys(`${prefix}tag:*`);

    return {
      totalEntries: keys.length - tagKeys.length,
      totalTags: tagKeys.length,
      tags: tagKeys.map(key => key.replace(`${prefix}tag:`, "")),
    };
  } catch (error) {
    console.error("Cache analytics error:", error);
    return {
      totalEntries: 0,
      totalTags: 0,
      tags: [],
    };
  }
}

/**
 * Cache manager middleware for Next.js App Router
 */
export function cacheMiddleware(options?: CacheOptions) {
  return async (req: NextRequest) => {
    // Skip middleware for non-GET requests or non-API routes
    if (req.method !== "GET" || !req.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    const { prefix } = { ...DEFAULT_OPTIONS, ...options };
    const url = new URL(req.url);
    const cacheKey = `${prefix}${url.pathname}${url.search}`;

    try {
      // Check cache
      const cachedResponse = await redis.get<CachedResponse>(cacheKey);

      if (cachedResponse) {
        // Check if cache is still valid
        const now = Date.now();
        const age = now - cachedResponse.timestamp;
        const ttl = options?.ttl || DEFAULT_OPTIONS.ttl!;

        if (age < ttl * 1000) {
          console.log(`Middleware cache hit for ${cacheKey}`);

          // Return cached response
          return NextResponse.json(cachedResponse.data, {
            headers: {
              "X-Cache": "HIT",
              "X-Cache-Age": `${Math.floor(age / 1000)}s`,
            },
          });
        }
      }
    } catch (error) {
      console.error(`Middleware cache error for ${cacheKey}:`, error);
    }

    // Cache miss or error, proceed with request
    return NextResponse.next();
  };
}
