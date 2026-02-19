#!/usr/bin/env node

/**
 * Simple key generator for Communiatec
 * Generates secure JWT_SECRET and ENCRYPTION_KEY
 */

const crypto = require("crypto");

function generateJWTSecret() {
  return crypto.randomBytes(64).toString("base64");
}

function generateEncryptionKey() {
  // Generate a cryptographically secure 256-bit (32-byte) key
  return crypto.randomBytes(32).toString("hex");
}

console.log("🔐 Communiatec Security Keys Generator");
console.log("=====================================");
console.log("");
console.log("Add these to your Server/.env file:");
console.log("");
console.log(`JWT_SECRET=${generateJWTSecret()}`);
console.log(`ENCRYPTION_KEY=${generateEncryptionKey()}`);
console.log("");
console.log("✅ Keys generated successfully!");
console.log("📝 Copy these values to Server/.env");
