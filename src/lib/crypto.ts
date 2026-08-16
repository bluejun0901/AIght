import CryptoJS from 'crypto-js';

// Default clinical encryption salt/key (can be backed by custom clinician key in settings)
const DEFAULT_SECRET = 'AIGHT_HIPAA_AES256_CLINICAL_VAULT_KEY_2026';

export function encryptSensitiveData(plainText: string, customKey?: string): string {
  if (!plainText) return '';
  const key = customKey || DEFAULT_SECRET;
  return CryptoJS.AES.encrypt(plainText, key).toString();
}

export function decryptSensitiveData(cipherText: string, customKey?: string): string {
  if (!cipherText) return '';
  try {
    const key = customKey || DEFAULT_SECRET;
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || cipherText; // Fallback if already plaintext
  } catch (err) {
    console.warn('Decryption failed, returning sanitized placeholder', err);
    return '[Encrypted Patient Record - Key Restricted]';
  }
}
