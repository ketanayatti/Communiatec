/**
 * Database Connection
 * ───────────────────
 * - Fail-fast in production if DATABASE_URL is missing or connection fails
 * - Graceful fallback in development (server starts, DB features disabled)
 */

const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger');

// Google public DNS for reliable MongoDB Atlas resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const isProduction = process.env.NODE_ENV === 'production';

const dbConnect = async () => {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    const msg = 'DATABASE_URL is not defined in environment variables.';
    if (isProduction) {
      logger.error(`❌ FATAL: ${msg}`);
      process.exit(1);
    }
    logger.warn(`⚠️  ${msg} Database features will be disabled.`);
    return;
  }

  try {
    const conn = await mongoose.connect(DATABASE_URL, {
      serverSelectionTimeoutMS: 10000, // 10s in prod, 5s in dev
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Listen for runtime disconnects
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime error:', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected successfully.');
    });
  } catch (error) {
    const msg = `Database connection failed: ${error.message}`;
    if (isProduction) {
      logger.error(`❌ FATAL: ${msg}`);
      process.exit(1);
    }
    logger.warn(`⚠️  ${msg} Server starting without database connection.`);
  }
};

module.exports = dbConnect;
