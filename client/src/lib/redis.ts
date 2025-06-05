import { Redis } from '@upstash/redis';

// Create a single Redis client instance to be used throughout the app
// Use environment variables for configuration
let redis: Redis | null = null;

export function getRedisClient() {
  if (!redis) {
    // Only initialize Redis on the server side
    if (typeof window === 'undefined') {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL || '',
        token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
      });
    }
  }
  return redis;
}

// Utility function to generate a cache key for map bounds
export function generateMapBoundsCacheKey(sw_lat: number, sw_lng: number, ne_lat: number, ne_lng: number): string {
  // Round coordinates to reduce number of unique cache keys
  // 2 decimal places ≈ 1.1 km precision at the equator (increased granularity for better cache hits)
  const precision = 2;
  return `map:bounds:${sw_lat.toFixed(precision)}:${sw_lng.toFixed(precision)}:${ne_lat.toFixed(precision)}:${ne_lng.toFixed(precision)}`;
}

// Generate a cache key for user reports
export function generateUserReportsCacheKey(userId: string): string {
  return `user:reports:${userId}`;
}

// Generate a cache key for user saved reports
export function generateUserSavedReportsCacheKey(userId: string): string {
  return `user:saved-reports:${userId}`;
}

// Generate a cache key for a single report
export function generateReportCacheKey(reportId: string): string {
  return `report:${reportId}`;
}

// Function to cache pins data
export async function cachePinsData(cacheKey: string, data: any, expirationInSeconds = 300): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    await client.set(cacheKey, JSON.stringify(data), { ex: expirationInSeconds });
  } catch (error) {
    console.error('Redis caching error:', error);
    // Fail silently - the application should continue to work even if caching fails
  }
}

// Function to get cached pins data
export async function getCachedPinsData(cacheKey: string): Promise<any | null> {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    const cachedData = await client.get(cacheKey);
    if (!cachedData) return null;
    return JSON.parse(cachedData as string);
  } catch (error) {
    console.error('Redis fetch error:', error);
    return null;
  }
}

// Generic function to cache any data
export async function cacheData(cacheKey: string, data: any, expirationInSeconds = 300): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    await client.set(cacheKey, JSON.stringify(data), { ex: expirationInSeconds });
  } catch (error) {
    console.error(`Redis caching error for key ${cacheKey}:`, error);
    // Fail silently - the application should continue to work even if caching fails
  }
}

// Generic function to get cached data
export async function getCachedData(cacheKey: string): Promise<any | null> {
  const client = getRedisClient();
  if (!client) return null;
  
  try {
    const cachedData = await client.get(cacheKey);
    if (!cachedData) return null;
    return JSON.parse(cachedData as string);
  } catch (error) {
    console.error(`Redis fetch error for key ${cacheKey}:`, error);
    return null;
  }
}

// Function to invalidate cache by key
export async function invalidateCache(cacheKey: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  
  try {
    // Check if the key contains a wildcard pattern
    if (cacheKey.includes('*')) {
      // For wildcard patterns, we need to use the keys command to find matching keys
      const keys = await client.keys(cacheKey);
      if (keys && keys.length > 0) {
        // Delete all matching keys
        await Promise.all(keys.map((key: string) => client.del(key)));
        console.log(`Invalidated ${keys.length} cache keys matching pattern: ${cacheKey}`);
      }
    } else {
      // For exact key matches, use del directly
      await client.del(cacheKey);
    }
  } catch (error) {
    console.error(`Redis cache invalidation error for key ${cacheKey}:`, error);
  }
}
