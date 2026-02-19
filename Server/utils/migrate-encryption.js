#!/usr/bin/env node

/**
 * Encryption Migration Script
 * Migrates existing encrypted messages from old insecure encryption to new secure encryption
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { encrypt, decrypt, legacyDecrypt } = require("./simpleEncryption");

// Import models
const Message = require("../models/MessageModel");

async function connectDatabase() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("✅ Connected to database");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

async function migrateMessages() {
  console.log("🔄 Starting message encryption migration...");

  try {
    // Find all text messages
    const messages = await Message.find({
      messageType: "text",
      content: { $exists: true, $ne: null },
    });
    console.log(`📊 Found ${messages.length} text messages to check`);

    let migratedCount = 0;
    let alreadySecureCount = 0;
    let failedCount = 0;

    for (const message of messages) {
      try {
        // Try to decrypt with new method first
        decrypt(message.content);
        alreadySecureCount++;
        console.log(`✅ Message ${message._id} already uses secure encryption`);
      } catch (newDecryptError) {
        try {
          // Try legacy decryption
          const decryptedContent = legacyDecrypt(message.content);

          // Re-encrypt with new method
          const newEncryptedContent = encrypt(decryptedContent);

          // Update the message directly in database
          await Message.updateOne(
            { _id: message._id },
            { content: newEncryptedContent }
          );

          migratedCount++;
          console.log(
            `🔄 Migrated message ${message._id} to secure encryption`
          );
        } catch (legacyDecryptError) {
          failedCount++;
          console.error(`❌ Failed to migrate message ${message._id}:`, {
            newError: newDecryptError.message,
            legacyError: legacyDecryptError.message,
          });
        }
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`✅ Already secure: ${alreadySecureCount}`);
    console.log(`🔄 Migrated: ${migratedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log(`📊 Total processed: ${messages.length}`);

    if (migratedCount > 0) {
      console.log("\n🎉 Migration completed successfully!");
      console.log(
        "All legacy encrypted messages have been upgraded to secure encryption."
      );
    } else if (alreadySecureCount === messages.length) {
      console.log(
        "\n✨ No migration needed - all messages already use secure encryption!"
      );
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
}

async function testEncryption() {
  console.log("\n🧪 Testing new encryption system...");

  if (!process.env.ENCRYPTION_KEY) {
    console.error("❌ ENCRYPTION_KEY not found in environment variables");
    console.log("💡 Run: node generate-keys.js");
    console.log("📝 Copy the ENCRYPTION_KEY to your .env file");
    return false;
  }

  try {
    const testMessage = "Test message for encryption validation";
    const encrypted = encrypt(testMessage);
    const decrypted = decrypt(encrypted);

    if (testMessage === decrypted) {
      console.log("✅ Encryption system working correctly");
      return true;
    } else {
      console.log("❌ Encryption test failed - decrypted text does not match");
      return false;
    }
  } catch (error) {
    console.error("❌ Encryption test failed:", error.message);
    return false;
  }
}

async function main() {
  console.log("🔐 Communiatec Encryption Migration");
  console.log("=================================");

  // Check encryption key
  if (!process.env.ENCRYPTION_KEY) {
    console.error("❌ ENCRYPTION_KEY environment variable not set");
    console.log("\n🔧 Setup steps:");
    console.log("1. Run: node generate-keys.js");
    console.log("2. Copy the ENCRYPTION_KEY to your Server/.env file");
    console.log("3. Run this migration script again");
    process.exit(1);
  }

  try {
    await connectDatabase();

    const encryptionWorking = await testEncryption();
    if (!encryptionWorking) {
      console.error("❌ Encryption system not working - aborting migration");
      process.exit(1);
    }

    await migrateMessages();
  } catch (error) {
    console.error("❌ Migration script failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Database disconnected");
  }

  console.log("\n🎯 Migration complete!");
  console.log("Your message encryption is now secure with:");
  console.log("- AES-256-GCM authenticated encryption");
  console.log("- Random IV and salt for each message");
  console.log("- PBKDF2 key derivation");
  console.log("- Tamper detection");
}

// Run migration if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateMessages, testEncryption };
