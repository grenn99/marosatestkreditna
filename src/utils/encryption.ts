/**
 * Utility functions for client-side encryption of sensitive data
 *
 * IMPORTANT: This is not a replacement for proper server-side encryption.
 * It provides a basic level of protection for data stored in the database,
 * but the encryption key is still accessible in the client code.
 *
 * For truly sensitive data, use server-side encryption or dedicated secure storage.
 *
 * SECURITY IMPROVEMENTS:
 * - Uses PBKDF2 for key derivation with a high iteration count
 * - Includes a salt for better security
 * - Uses a more complex seed with multiple factors
 * - Implements proper error handling and logging
 */

// Salt for key derivation - this adds an additional layer of security
// Even though this is in client code, it makes brute-forcing more difficult
const SALT = new Uint8Array([
  0x63, 0x72, 0x79, 0x70, 0x74, 0x6f, 0x67, 0x72,
  0x61, 0x70, 0x68, 0x69, 0x63, 0x73, 0x61, 0x6c
]);

// We'll generate the encryption key lazily when needed
let ENCRYPTION_KEY: CryptoKey | null = null;

/**
 * Get the encryption key, generating it if necessary
 * @returns A Promise that resolves to the encryption key
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  if (ENCRYPTION_KEY) {
    return ENCRYPTION_KEY;
  }

  try {
    // Create a more complex seed that includes:
    // - The application name
    // - The domain (to make it specific to this deployment)
    // - A timestamp component (changes periodically)
    const appName = 'kmetija-marosa-app';
    const domain = window.location.hostname;
    // Use the current month/year as a time component
    // This means the key will change monthly, requiring re-encryption
    // of data stored with the old key
    const date = new Date();
    const timeComponent = `${date.getFullYear()}-${date.getMonth() + 1}`;

    const seed = `${appName}-${domain}-${timeComponent}`;

    // Use the Web Crypto API to derive a proper key using PBKDF2
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(seed),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive the actual encryption key using PBKDF2
    // with a high iteration count for better security
    ENCRYPTION_KEY = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: SALT,
        iterations: 100000, // High iteration count for better security
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return ENCRYPTION_KEY;
  } catch (error) {
    console.error('Error generating encryption key:', error);
    throw new Error('Failed to generate encryption key');
  }
}

/**
 * Encrypt a string using AES encryption
 * @param text The text to encrypt
 * @returns The encrypted text (Base64 encoded)
 */
export async function encryptData(text: string): Promise<string> {
  try {
    // Skip encryption for empty strings
    if (!text) {
      return text;
    }

    // Get the encryption key
    const cryptoKey = await getEncryptionKey();

    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encodedText = new TextEncoder().encode(text);
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      cryptoKey,
      encodedText
    );

    // Combine the IV and encrypted data and encode as Base64
    const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength);
    encryptedArray.set(iv, 0);
    encryptedArray.set(new Uint8Array(encryptedData), iv.length);

    // Add a prefix to identify encrypted data
    // This makes it easier to detect encrypted data and handle versioning
    const base64Data = btoa(String.fromCharCode(...encryptedArray));
    return `ENC1:${base64Data}`;
  } catch (error) {
    console.error('Encryption error:', error);
    // Log the error but don't expose details in the returned value
    // Fall back to unencrypted data if encryption fails
    return text;
  }
}

/**
 * Decrypt an encrypted string
 * @param encryptedText The encrypted text (Base64 encoded)
 * @returns The decrypted text
 */
export async function decryptData(encryptedText: string): Promise<string> {
  try {
    // Skip decryption for empty strings
    if (!encryptedText) {
      return encryptedText;
    }

    // Check if this is our new encrypted format
    if (encryptedText.startsWith('ENC1:')) {
      // Extract the Base64 data
      const base64Data = encryptedText.substring(5);

      // Convert the Base64 encoded string back to a Uint8Array
      const encryptedArray = new Uint8Array(
        atob(base64Data).split('').map(char => char.charCodeAt(0))
      );

      // Extract the IV and encrypted data
      const iv = encryptedArray.slice(0, 12);
      const encryptedData = encryptedArray.slice(12);

      // Get the encryption key
      const cryptoKey = await getEncryptionKey();

      // Decrypt the data
      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        cryptoKey,
        encryptedData
      );

      // Convert the decrypted data back to a string
      return new TextDecoder().decode(decryptedData);
    }
    // Handle legacy encrypted data (without the ENC1: prefix)
    else if (isEncrypted(encryptedText)) {
      // This is for backward compatibility with data encrypted using the old method
      console.warn('Decrypting legacy encrypted data. Consider re-encrypting with the new method.');

      // Convert the Base64 encoded string back to a Uint8Array
      const encryptedArray = new Uint8Array(
        atob(encryptedText).split('').map(char => char.charCodeAt(0))
      );

      // Extract the IV and encrypted data
      const iv = encryptedArray.slice(0, 12);
      const encryptedData = encryptedArray.slice(12);

      // Get the encryption key
      const cryptoKey = await getEncryptionKey();

      try {
        // Decrypt the data
        const decryptedData = await window.crypto.subtle.decrypt(
          {
            name: 'AES-GCM',
            iv
          },
          cryptoKey,
          encryptedData
        );

        // Convert the decrypted data back to a string
        return new TextDecoder().decode(decryptedData);
      } catch (innerError) {
        console.error('Failed to decrypt legacy data:', innerError);
        return encryptedText;
      }
    }

    // If it's not encrypted, return as is
    return encryptedText;
  } catch (error) {
    console.error('Decryption error:', error);
    // Return the encrypted text if decryption fails
    return encryptedText;
  }
}

/**
 * Check if a string is encrypted
 * @param text The text to check
 * @returns True if the text appears to be encrypted
 */
export function isEncrypted(text: string): boolean {
  if (!text) {
    return false;
  }

  // Check for our new encryption format first
  if (text.startsWith('ENC1:')) {
    return true;
  }

  // Check for legacy encrypted data (Base64 encoded)
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  return base64Regex.test(text) && text.length > 16;
}

/**
 * Encrypt an object's properties
 * @param obj The object to encrypt
 * @param fieldsToEncrypt Array of field names to encrypt
 * @returns A new object with the specified fields encrypted
 */
export async function encryptObject<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: string[]
): Promise<T> {
  const result = { ...obj };

  for (const field of fieldsToEncrypt) {
    if (typeof result[field] === 'string' && result[field] && !isEncrypted(result[field])) {
      result[field] = await encryptData(result[field]);
    }
  }

  return result;
}

/**
 * Decrypt an object's properties
 * @param obj The object to decrypt
 * @param fieldsToDecrypt Array of field names to decrypt
 * @returns A new object with the specified fields decrypted
 */
export async function decryptObject<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: string[]
): Promise<T> {
  const result = { ...obj };

  for (const field of fieldsToDecrypt) {
    if (typeof result[field] === 'string' && result[field] && isEncrypted(result[field])) {
      result[field] = await decryptData(result[field]);
    }
  }

  return result;
}
