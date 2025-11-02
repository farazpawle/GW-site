import * as crypto from 'crypto';

/**
 * Sensitive fields that require encryption
 * These fields will be encrypted before storing in database
 */
const SENSITIVE_FIELDS = [
  'email_smtp_password',
] as const;

/**
 * Get encryption key from environment variable
 */
function getEncryptionKey(): Buffer {
  const key = process.env.SETTINGS_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error(
      'SETTINGS_ENCRYPTION_KEY environment variable is not set. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  if (key.length !== 64) {
    throw new Error(
      'SETTINGS_ENCRYPTION_KEY must be 64 hex characters (32 bytes). ' +
      'Current length: ' + key.length
    );
  }
  
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a value using AES-256-CBC
 * Returns format: IV:EncryptedData (both in hex)
 * 
 * @param plainText - The text to encrypt
 * @returns Encrypted string in format "IV:EncryptedData"
 */
export function encryptValue(plainText: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16); // 16 bytes = 128 bits IV for AES
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV:EncryptedData format
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Decrypt a value encrypted with encryptValue
 * Expects format: IV:EncryptedData (both in hex)
 * 
 * @param encryptedText - The encrypted string in format "IV:EncryptedData"
 * @returns Decrypted plaintext string
 */
export function decryptValue(encryptedText: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encryptedText.split(':');
    
    if (parts.length !== 2) {
      throw new Error(
        'Invalid encrypted value format. Expected "IV:EncryptedData"'
      );
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if a settings key is sensitive and requires encryption
 * 
 * @param key - The settings key to check
 * @returns true if the field should be encrypted
 */
export function isSensitiveField(key: string): boolean {
  return SENSITIVE_FIELDS.includes(key as typeof SENSITIVE_FIELDS[number]);
}

/**
 * Get list of sensitive fields (for reference)
 */
export function getSensitiveFields(): readonly string[] {
  return SENSITIVE_FIELDS;
}
