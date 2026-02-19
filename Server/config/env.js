/**
 * Environment Configuration Loader
 * ─────────────────────────────────
 * Loads the correct .env file based on NODE_ENV and validates
 * that all critical variables are present before the app starts.
 *
 * MUST be required at the very top of server.js, before anything else.
 */

const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// ── 1. Determine environment ──────────────────────────────────────────
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// ── 2. Load the env file ──────────────────────────────────────────────
const envFile = `.env.${NODE_ENV}`;
const envPath = path.resolve(__dirname, '..', envFile);

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`✅ Loaded environment from: ${envFile}`);
} else if (isProduction) {
  // In production on platforms like Render/Railway, env vars are injected
  // directly — no .env file needed. Only warn, don't crash.
  console.warn(
    `⚠️  No ${envFile} file found. Expecting environment variables to be set by the platform.`
  );
} else {
  // In development, a missing file is a problem
  console.error(`❌ Environment file not found: ${envPath}`);
  console.error(`   Create ${envFile} from .env.example and try again.`);
  process.exit(1);
}

// ── 3. Define critical variables per environment ──────────────────────
const CRITICAL_VARS = [
  'JWT_SECRET',
  'DATABASE_URL',
  'ENCRYPTION_KEY',
];

const PRODUCTION_CRITICAL_VARS = [
  ...CRITICAL_VARS,
  'CLIENT_URL',
  'SERVER_URL',
  'CORS_ALLOWED_ORIGINS',
];

// ── 4. Validate ───────────────────────────────────────────────────────
const requiredVars = isProduction ? PRODUCTION_CRITICAL_VARS : CRITICAL_VARS;
const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('');
  console.error('══════════════════════════════════════════════════════');
  console.error('  ❌ FATAL: Missing critical environment variables');
  console.error('══════════════════════════════════════════════════════');
  missing.forEach((key) => console.error(`  • ${key}`));
  console.error('');
  console.error(`  Environment : ${NODE_ENV}`);
  console.error(`  Env file    : ${envFile}`);
  console.error('══════════════════════════════════════════════════════');
  console.error('');
  process.exit(1);
}

// ── 5. Export helpers ─────────────────────────────────────────────────
module.exports = {
  NODE_ENV,
  isProduction,
  isDevelopment: NODE_ENV === 'development',
  PORT: parseInt(process.env.PORT, 10) || 4000,
};
