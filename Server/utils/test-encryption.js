#!/usr/bin/env node

/**
 * Encryption Test Suite
 * Tests the new secure encryption implementation
 */

// Set a test encryption key
process.env.ENCRYPTION_KEY = 'test_encryption_key_for_testing_32_chars_long';

const { encrypt, decrypt, generateEncryptionKey, legacyDecrypt } = require('./simpleEncryption');

console.log('🔐 Testing Secure Encryption Implementation');
console.log('==========================================');

function testBasicEncryption() {
    console.log('\n📝 Test 1: Basic Encryption/Decryption');
    
    const testData = 'Hello, this is a secret message!';
    console.log(`Original: ${testData}`);
    
    try {
        const encrypted = encrypt(testData);
        console.log(`Encrypted: ${encrypted.substring(0, 50)}...`);
        
        const decrypted = decrypt(encrypted);
        console.log(`Decrypted: ${decrypted}`);
        
        if (testData === decrypted) {
            console.log('✅ Basic encryption test PASSED');
        } else {
            console.log('❌ Basic encryption test FAILED');
        }
    } catch (error) {
        console.log(`❌ Basic encryption test FAILED: ${error.message}`);
    }
}

function testRandomness() {
    console.log('\n🎲 Test 2: Encryption Randomness');
    
    const testData = 'Same input text';
    
    try {
        const encrypted1 = encrypt(testData);
        const encrypted2 = encrypt(testData);
        
        console.log(`Encryption 1: ${encrypted1.substring(0, 50)}...`);
        console.log(`Encryption 2: ${encrypted2.substring(0, 50)}...`);
        
        if (encrypted1 !== encrypted2) {
            console.log('✅ Randomness test PASSED - Same input produces different ciphertext');
        } else {
            console.log('❌ Randomness test FAILED - Same input produces same ciphertext');
        }
        
        // Both should decrypt to same text
        const decrypted1 = decrypt(encrypted1);
        const decrypted2 = decrypt(encrypted2);
        
        if (decrypted1 === decrypted2 && decrypted1 === testData) {
            console.log('✅ Consistency test PASSED - Both decrypt to original text');
        } else {
            console.log('❌ Consistency test FAILED');
        }
    } catch (error) {
        console.log(`❌ Randomness test FAILED: ${error.message}`);
    }
}

function testTampering() {
    console.log('\n🛡️ Test 3: Tamper Detection');
    
    const testData = 'This message should detect tampering';
    
    try {
        const encrypted = encrypt(testData);
        
        // Tamper with the encrypted data (change last character)
        const tamperedData = encrypted.slice(0, -1) + (encrypted.slice(-1) === 'A' ? 'B' : 'A');
        
        console.log('Attempting to decrypt tampered data...');
        
        try {
            const decrypted = decrypt(tamperedData);
            console.log('❌ Tamper detection FAILED - Tampered data was decrypted');
        } catch (error) {
            console.log('✅ Tamper detection PASSED - Tampered data rejected');
        }
    } catch (error) {
        console.log(`❌ Tamper test setup FAILED: ${error.message}`);
    }
}

function testKeyGeneration() {
    console.log('\n🔑 Test 4: Key Generation');
    
    try {
        const key1 = generateEncryptionKey();
        const key2 = generateEncryptionKey();
        
        console.log(`Generated key 1: ${key1.substring(0, 16)}...`);
        console.log(`Generated key 2: ${key2.substring(0, 16)}...`);
        
        if (key1 !== key2 && key1.length === 64 && key2.length === 64) {
            console.log('✅ Key generation PASSED - Unique 64-character keys generated');
        } else {
            console.log('❌ Key generation FAILED');
        }
    } catch (error) {
        console.log(`❌ Key generation test FAILED: ${error.message}`);
    }
}

function testErrorHandling() {
    console.log('\n⚠️ Test 5: Error Handling');
    
    try {
        // Test empty input
        try {
            encrypt('');
            console.log('❌ Empty input test FAILED - Should have thrown error');
        } catch (error) {
            console.log('✅ Empty input test PASSED - Error thrown for empty input');
        }
        
        // Test invalid encrypted data
        try {
            decrypt('invalid_encrypted_data');
            console.log('❌ Invalid data test FAILED - Should have thrown error');
        } catch (error) {
            console.log('✅ Invalid data test PASSED - Error thrown for invalid data');
        }
        
    } catch (error) {
        console.log(`❌ Error handling test FAILED: ${error.message}`);
    }
}

// Run all tests
function runAllTests() {
    testBasicEncryption();
    testRandomness();
    testTampering();
    testKeyGeneration();
    testErrorHandling();
    
    console.log('\n🎯 Encryption Test Summary');
    console.log('==========================');
    console.log('All tests completed. Check results above.');
    console.log('\n💡 Usage in your application:');
    console.log('1. Set ENCRYPTION_KEY environment variable');
    console.log('2. Import { encrypt, decrypt } from "./utils/simpleEncryption"');
    console.log('3. Use encrypt(text) and decrypt(encryptedText)');
    console.log('\n🔐 Your encryption is now secure with:');
    console.log('- AES-256-GCM authenticated encryption');
    console.log('- Random IV and salt for each encryption');
    console.log('- PBKDF2 key derivation with 100,000 iterations');
    console.log('- Tamper detection and integrity protection');
}

// Run tests only if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = { runAllTests };
