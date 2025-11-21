const crypto = require('crypto');

// Use AES-256-GCM for authenticated encryption
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

/**
 * Derives a key from the master key using PBKDF2
 * @param {string} masterKey - The master encryption key from environment
 * @param {Buffer} salt - Random salt for key derivation
 * @returns {Buffer} - Derived key
 */
function deriveKey(masterKey, salt) {
    if (!masterKey) {
        throw new Error('ENCRYPTION_KEY environment variable not set');
    }
    
    // Use PBKDF2 with 100,000 iterations for key derivation
    return crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Encrypts text using AES-256-GCM with random IV and salt
 * @param {string} text - Text to encrypt
 * @returns {string} - Base64 encoded encrypted data with format: salt:iv:tag:encryptedData
 */
function encrypt(text) {
    try {
        if (!text || typeof text !== 'string') {
            throw new Error('Text to encrypt must be a non-empty string');
        }

        const masterKey = process.env.ENCRYPTION_KEY;
        if (!masterKey) {
            throw new Error('ENCRYPTION_KEY environment variable not configured');
        }

        // Generate random salt and IV for each encryption
        const salt = crypto.randomBytes(SALT_LENGTH);
        const iv = crypto.randomBytes(IV_LENGTH);
        
        // Derive key from master key and salt
        const key = deriveKey(masterKey, salt);
        
        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        // Encrypt the text
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        
        // Get the authentication tag
        const tag = cipher.getAuthTag();
        
        // Combine salt, IV, tag, and encrypted data
        const result = Buffer.concat([
            salt,
            iv, 
            tag,
            Buffer.from(encrypted, 'base64')
        ]).toString('base64');
        
        return result;
        
    } catch (error) {
        console.error('Encryption error:', error.message);
        throw new Error('Encryption failed');
    }
}

/**
 * Decrypts text encrypted with the encrypt function
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedData) {
    try {
        if (!encryptedData || typeof encryptedData !== 'string') {
            throw new Error('Encrypted data must be a non-empty string');
        }

        const masterKey = process.env.ENCRYPTION_KEY;
        if (!masterKey) {
            throw new Error('ENCRYPTION_KEY environment variable not configured');
        }

        // Decode the base64 data
        const combined = Buffer.from(encryptedData, 'base64');
        
        // Extract components
        const salt = combined.subarray(0, SALT_LENGTH);
        const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
        const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
        
        // Derive the same key using salt
        const key = deriveKey(masterKey, salt);
        
        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        
        // Decrypt the data
        let decrypted = decipher.update(encrypted, null, 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
        
    } catch (error) {
        console.error('Decryption error:', error.message);
        throw new Error('Decryption failed - data may be corrupted or tampered with');
    }
}

/**
 * Generates a random encryption key for use as ENCRYPTION_KEY
 * @returns {string} - Hex encoded encryption key
 */
function generateEncryptionKey() {
    return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Legacy decrypt function for backward compatibility
 * Attempts to decrypt data encrypted with the old insecure method
 * @param {string} encryptedData - Legacy encrypted data
 * @returns {string} - Decrypted text
 * @deprecated Use the new encrypt/decrypt functions
 */
function legacyDecrypt(encryptedData) {
    console.warn('Using legacy decryption - please re-encrypt this data with the new method');
    
    try {
        const algorithm = 'aes-256-cbc';
        const key = crypto.createHash('sha256').update(String('my_simple_secret_key_123')).digest('base64').substr(0, 32);
        const iv = Buffer.alloc(16, 0);
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error('Legacy decryption failed');
    }
}

module.exports = { 
    encrypt, 
    decrypt, 
    generateEncryptionKey,
    legacyDecrypt // For migration purposes
};