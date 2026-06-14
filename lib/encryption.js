/**
 * AES-256-GCM encryption for account credentials stored in the database.
 * The key is a 32-byte hex string read from ENCRYPTION_KEY env var.
 *
 * Format on disk:  <iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM

function getKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Encrypt plaintext credentials before storing in DB.
 * @param {string} plaintext
 * @returns {string}  "<iv>:<authTag>:<ciphertext>" all hex-encoded
 */
export function encrypt(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

/**
 * Decrypt credentials fetched from DB before emailing to buyer.
 * @param {string} encoded  "<iv>:<authTag>:<ciphertext>"
 * @returns {string}  original plaintext
 */
export function decrypt(encoded) {
  const key = getKey();
  const [ivHex, authTagHex, ciphertextHex] = encoded.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
