const { createClient } = require('redis');
require('dotenv').config();

// Singleton Redis client
let client;
let isReady = false;

(async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  if (redisUrl === 'disabled') {
    isReady = false;
    console.log('Redis is disabled, using in-memory cache only.');
    return;
  }

  try {
    client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: retries => {
          if (retries > 2) {
            console.warn('Redis reconnect retries exhausted, falling back to in-memory cache.');
            return new Error('Retry time exhausted');
          }
          return Math.min(retries * 200, 1000);
        }
      }
    });

    client.on('error', (err) => {
      isReady = false;
    });

    await client.connect();
    isReady = true;
    console.log('✅ Connected to Redis');
  } catch (error) {
    isReady = false;
    // The reconnectStrategy and error handler will log messages.
  }
})();

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
      console.error('Redis GET error:', err);
      return null;
    }
  },
  async set(key, value, ttlSeconds = 900) {
    if (!isReady) return;
    try {
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      console.error('Redis SET error:', err);
    }
  },
};