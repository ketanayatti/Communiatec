/**
 * Redis Client (Singleton)
 * ────────────────────────
 * - If REDIS_URL is 'disabled' or empty → in-memory fallback (no crash)
 * - If REDIS_URL is provided → connect; warn loudly in production on failure
 * - No duplicate dotenv.config() — env is loaded centrally via config/env.js
 */

const { createClient } = require('redis');
const logger = require('./logger');

const isProduction = process.env.NODE_ENV === 'production';

let client;
let isReady = false;

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'disabled';

  if (!redisUrl || redisUrl === 'disabled') {
    isReady = false;
    logger.info('ℹ️  Redis is disabled — using in-memory cache only.');
    return;
  }

  try {
    client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            logger.warn('Redis reconnect retries exhausted, falling back to in-memory cache.');
            return new Error('Retry time exhausted');
          }
          return Math.min(retries * 200, 2000);
        },
        connectTimeout: 5000,
      },
    });

    client.on('error', (err) => {
      if (isReady) {
        logger.error('Redis connection lost:', { error: err.message });
      }
      isReady = false;
    });

    client.on('reconnecting', () => {
      logger.warn('🔄 Redis reconnecting...');
    });

    client.on('ready', () => {
      isReady = true;
      logger.info('✅ Redis connection restored.');
    });

    await client.connect();
    isReady = true;
    logger.info('✅ Connected to Redis');
  } catch (error) {
    isReady = false;
    const msg = `Redis connection failed: ${error.message}`;

    if (isProduction) {
      // In production, Redis failure is critical — log loudly but don't crash
      // (the app can still function with in-memory fallback)
      logger.error(`🚨 PRODUCTION WARNING: ${msg} — falling back to in-memory cache.`);
    } else {
      logger.warn(`⚠️  ${msg} — using in-memory cache.`);
    }
  }
};

// Start connection
connectRedis();

module.exports = {
  get isReady() {
    return isReady;
  },

  async get(key) {
    if (!isReady) return null;
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      logger.error('Redis GET error:', { key, error: err.message });
      return null;
    }
  },

  async set(key, value, ttlSeconds = 900) {
    if (!isReady) return;
    try {
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      logger.error('Redis SET error:', { key, error: err.message });
    }
  },

  async del(key) {
    if (!isReady) return;
    try {
      await client.del(key);
    } catch (err) {
      logger.error('Redis DEL error:', { key, error: err.message });
    }
  },
};