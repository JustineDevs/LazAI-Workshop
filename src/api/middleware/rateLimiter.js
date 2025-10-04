const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');

/**
 * Rate limiting middleware with Redis support
 */
class RateLimiter {
  constructor() {
    this.redis = null;
    this.memoryStore = new Map();
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
        console.log('✅ Redis connected for rate limiting');
      } else {
        console.log('⚠️  Redis not configured, using memory store for rate limiting');
      }
    } catch (error) {
      console.warn('⚠️  Redis connection failed, using memory store:', error.message);
    }
  }

  /**
   * Create rate limiter middleware
   */
  createLimiter(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      max = 100, // limit each IP to 100 requests per windowMs
      message = 'Too many requests from this IP, please try again later.',
      standardHeaders = true,
      legacyHeaders = false,
      store = this.createStore()
    } = options;

    return rateLimit({
      windowMs,
      max,
      message: {
        success: false,
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      },
      standardHeaders,
      legacyHeaders,
      store,
      keyGenerator: (req) => {
        // Use IP address or user ID if available
        return req.user?.id || req.ip;
      },
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/api/v1/monitoring/health';
      }
    });
  }

  /**
   * Create custom store
   */
  createStore() {
    if (this.redis) {
      return new RedisStore(this.redis);
    }
    return new MemoryStore();
  }

  /**
   * API rate limiter (100 requests per 15 minutes)
   */
  apiLimiter() {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: 'Too many API requests, please try again later.'
    });
  }

  /**
   * Strict rate limiter (10 requests per minute)
   */
  strictLimiter() {
    return this.createLimiter({
      windowMs: 60 * 1000, // 1 minute
      max: 10,
      message: 'Too many requests, please slow down.'
    });
  }

  /**
   * Upload rate limiter (5 uploads per hour)
   */
  uploadLimiter() {
    return this.createLimiter({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5,
      message: 'Upload limit exceeded, please try again later.'
    });
  }

  /**
   * Auth rate limiter (5 attempts per 15 minutes)
   */
  authLimiter() {
    return this.createLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: 'Too many authentication attempts, please try again later.'
    });
  }
}

/**
 * Redis store for rate limiting
 */
class RedisStore {
  constructor(redis) {
    this.redis = redis;
  }

  async increment(key, cb) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const window = Math.floor(now / windowMs);
    const redisKey = `rate_limit:${key}:${window}`;
    
    try {
      const count = await this.redis.incr(redisKey);
      if (count === 1) {
        await this.redis.expire(redisKey, Math.ceil(windowMs / 1000));
      }
      
      cb(null, count, new Date(now + windowMs));
    } catch (error) {
      cb(error);
    }
  }

  async decrement(key) {
    // Not implemented for Redis
  }

  async resetKey(key) {
    const pattern = `rate_limit:${key}:*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

/**
 * Memory store for rate limiting
 */
class MemoryStore {
  constructor() {
    this.store = new Map();
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  async increment(key, cb) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const window = Math.floor(now / windowMs);
    const storeKey = `${key}:${window}`;
    
    const current = this.store.get(storeKey) || { count: 0, resetTime: now + windowMs };
    current.count++;
    this.store.set(storeKey, current);
    
    cb(null, current.count, new Date(current.resetTime));
  }

  async decrement(key) {
    // Not implemented for memory store
  }

  async resetKey(key) {
    const pattern = new RegExp(`^${key}:`);
    for (const [storeKey] of this.store.entries()) {
      if (pattern.test(storeKey)) {
        this.store.delete(storeKey);
      }
    }
  }

  cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

module.exports = {
  rateLimiter,
  apiLimiter: rateLimiter.apiLimiter.bind(rateLimiter),
  strictLimiter: rateLimiter.strictLimiter.bind(rateLimiter),
  uploadLimiter: rateLimiter.uploadLimiter.bind(rateLimiter),
  authLimiter: rateLimiter.authLimiter.bind(rateLimiter)
};
