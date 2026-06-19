import NodeCache from 'node-cache';

// In-memory cache for API routes
const cache = new NodeCache({
  stdTTL: 3600, // 1 hour default
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Performance optimization
});

// Cache wrapper for API routes
export async function withCache<T>(
  key: string, 
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    console.log(`\x1b[32m%s\x1b[0m`, `✅ Cache hit: ${key}`);
    return cached;
  }
  
  console.log(`\x1b[33m%s\x1b[0m`, `🔄 Cache miss: ${key}, fetching...`);
  const data = await fetcher();
  
  // Store in cache
  cache.set(key, data, ttl);
  console.log(`\x1b[34m%s\x1b[0m`, `💾 Cached: ${key}`);
  
  return data;
}

// Clear specific cache
export function clearCache(key: string): void {
  cache.del(key);
  console.log(`🗑️ Cache cleared: ${key}`);
}

// Clear all cache
export function clearAllCache(): void {
  cache.flushAll();
  console.log('🗑️ All cache cleared');
}

// Get cache stats
export function getCacheStats(): { keys: number; hits: number; misses: number } {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses
  };
}
