import crypto from 'crypto';
import envConfig from '#config/env.config.js';
import logger from '#util/logger.js';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;

const encryptionKey = Buffer.from(envConfig.ENCRYPTION_KEY, 'hex');

export const encrypt = (plaintext) => {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('encrypt() requires a non-empty string');
  }

  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

  let encryptedCredentials = cipher.update(plaintext, 'utf8', 'hex');
  encryptedCredentials += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encryptedCredentials,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
};

export const decrypt = ({ encryptedCredentials, iv, authTag }) => {
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encryptedCredentials, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Decryption failed', { error: error.message });
    throw new Error('Decryption failed — data may be tampered or key mismatch');
  }
};

export default { encrypt, decrypt };

// ref: https://coreui.io/answers/how-to-encrypt-data-in-node-js/
// ref: https://gist.github.com/rjz/15baffeab434b8125ca4d783f4116d81
// ref: https://nodejs.org/api/crypto.html#class-cipheriv

