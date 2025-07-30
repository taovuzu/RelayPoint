import crypto from 'crypto';
import logger from '../utils/logger.js';

export class EncryptionService {
  static ALGORITHM = 'aes-256-cbc';
  static IV_LENGTH = 16; // 16 bytes for AES
  static KEY_LENGTH = 32; // 32 bytes for AES-256

  /**
   * Get the encryption key from environment variables
   * @returns {Buffer} 32-byte encryption key
   */
  static getEncryptionKey() {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error('SECRET_KEY environment variable is required for encryption');
    }

    // Create SHA-512 hash of the secret key and take first 32 bytes
    const hash = crypto.createHash('sha512').update(secretKey).digest();
    return hash.slice(0, this.KEY_LENGTH);
  }

  /**
   * Encrypt a string using AES-256-CBC
   * @param {string} text - Plain text to encrypt
   * @returns {string} Encrypted data in format "iv:encryptedData" (both hex encoded)
   */
  static encrypt(text) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: text must be a non-empty string');
      }

      const key = this.getEncryptionKey();

      // Generate a random 16-byte IV for each encryption
      const iv = crypto.randomBytes(this.IV_LENGTH);

      // Create cipher
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Return IV and encrypted data concatenated with colon separator
      return `${iv.toString('hex')}:${encrypted}`;

    } catch (error) {
      logger.error('Encryption failed', { error: error.message });
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt a string using AES-256-CBC
   * @param {string} encryptedData - Encrypted data in format "iv:encryptedData"
   * @returns {string} Decrypted plain text
   */
  static decrypt(encryptedData) {
    try {
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Invalid input: encryptedData must be a non-empty string');
      }

      const key = this.getEncryptionKey();

      // Split the encrypted data to get IV and encrypted content
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivHex, encryptedHex] = parts;

      // Convert hex strings back to buffers
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = encryptedHex;

      // Validate IV length
      if (iv.length !== this.IV_LENGTH) {
        throw new Error('Invalid IV length');
      }

      // Create decipher
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);

      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;

    } catch (error) {
      logger.error('Decryption failed', { error: error.message });
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Encrypt an object by converting it to JSON first
   * @param {Object} obj - Object to encrypt
   * @returns {string} Encrypted JSON string
   */
  static encryptObject(obj) {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString);
    } catch (error) {
      logger.error('Object encryption failed', { error: error.message });
      throw new Error('Failed to encrypt object');
    }
  }

  /**
   * Decrypt and parse an object from encrypted JSON
   * @param {string} encryptedData - Encrypted JSON string
   * @returns {Object} Decrypted object
   */
  static decryptObject(encryptedData) {
    try {
      const jsonString = this.decrypt(encryptedData);
      return JSON.parse(jsonString);
    } catch (error) {
      logger.error('Object decryption failed', { error: error.message });
      throw new Error('Failed to decrypt object');
    }
  }

  /**
   * Generate a cryptographically secure random string
   * @param {number} length - Length of the random string
   * @returns {string} Random hex string
   */
  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create a secure hash of a string (for non-reversible operations)
   * @param {string} text - Text to hash
   * @returns {string} SHA-256 hash
   */
  static hash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}
