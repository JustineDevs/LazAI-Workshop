const NodeCache = require('node-cache');

/**
 * Caching middleware for API responses
 */
class CacheManager {
  constructor() {
    // Create cache with 5 minute default TTL
    this.cache = new NodeCache({ 
      stdTTL: 300, // 5 minutes
      checkperiod: 60, // Check for expired keys every minute
      useClones: false // Don't clone objects for better performance
    });

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Middleware to check cache before processing request
   */
  checkCache(keyGenerator) {
    return (req, res, next) => {
      const cacheKey = keyGenerator(req);
      
      if (!cacheKey) {
        return next();
      }

      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        this.stats.hits++;
        res.set('X-Cache', 'HIT');
        return res.json(cached);
      }

      this.stats.misses++;
      res.set('X-Cache', 'MISS');
      
      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = (data) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(cacheKey, data, req.cacheTTL);
        }
        return originalJson.call(res, data);
      };

      next();
    };
  }

  /**
   * Set cache value
   */
  set(key, value, ttl) {
    this.cache.set(key, value, ttl);
    this.stats.sets++;
  }

  /**
   * Get cache value
   */
  get(key) {
    const value = this.cache.get(key);
    if (value) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    return value;
  }

  /**
   * Delete cache value
   */
  del(key) {
    const deleted = this.cache.del(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Clear all cache
   */
  flush() {
    this.cache.flushAll();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0 
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100 
      : 0;

    return {
      ...this.stats,
      hitRate: hitRate.toFixed(2) + '%',
      keys: this.cache.keys().length,
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Generate cache key for blockchain data
   */
  generateBlockchainKey(req) {
    const { method, path, query } = req;
    
    if (path.includes('/blockchain/network')) {
      return 'blockchain:network';
    }
    
    if (path.includes('/blockchain/balance/')) {
      const address = path.split('/').pop();
      return `blockchain:balance:${address}`;
    }
    
    if (path.includes('/blockchain/contract/')) {
      const address = path.split('/').pop();
      return `blockchain:contract:${address}`;
    }
    
    return null;
  }

  /**
   * Generate cache key for user data
   */
  generateUserKey(req) {
    const { method, path, user } = req;
    
    if (user && path.includes('/users/profile')) {
      return `user:profile:${user.id}`;
    }
    
    return null;
  }
}

// Create singleton instance
const cacheManager = new CacheManager();

module.exports = {
  cacheManager,
  checkCache: cacheManager.checkCache.bind(cacheManager),
  generateBlockchainKey: cacheManager.generateBlockchainKey.bind(cacheManager),
  generateUserKey: cacheManager.generateUserKey.bind(cacheManager)
};
