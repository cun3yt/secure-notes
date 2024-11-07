// Utility functions for crypto operations
export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseBytes = encoder.encode(passphrase);

  // Import passphrase as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passphraseBytes,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive the actual key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function generateSessionKey(passphrase: string): Promise<{
  key: CryptoKey;
  salt: string;
  sessionId: string;
}> {
  // Generate a random salt
  const salt = generateRandomBytes(16);
  
  // Derive key from passphrase
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  
  // Generate a random session ID
  const sessionIdBytes = generateRandomBytes(32);
  
  return {
    key,
    salt: bytesToHex(salt),
    sessionId: bytesToHex(sessionIdBytes),
  };
}

// Interface for encrypted document data
export interface EncryptedDocument {
  iv: string;  // Initialization vector in hex
  content: string;  // Encrypted content in hex
}

// Function to encrypt document content
export async function encryptDocument(
  content: string,
  key: CryptoKey
): Promise<EncryptedDocument> {
  const encoder = new TextEncoder();
  const contentBytes = encoder.encode(content);
  
  // Generate a random IV for each encryption
  const iv = generateRandomBytes(12);
  
  // Encrypt the content
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    contentBytes
  );
  
  return {
    iv: bytesToHex(iv),
    content: bytesToHex(new Uint8Array(encryptedContent))
  };
}

// Function to decrypt document content
export async function decryptDocument(
  encryptedDoc: EncryptedDocument,
  key: CryptoKey
): Promise<string> {
  try {
    const iv = hexToBytes(encryptedDoc.iv);
    const encryptedContent = hexToBytes(encryptedDoc.content);
    
    const decryptedContent = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encryptedContent
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedContent);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt document');
  }
}

// Function to load session key from storage
export async function loadSessionKey(
  sessionId: string,
  passphrase: string
): Promise<CryptoKey | null> {
  try {
    const sessionInfo = localStorage.getItem(`session_${sessionId}`);
    if (!sessionInfo) {
      console.warn('No session info found in localStorage');
      return null;
    }
    
    const parsed = JSON.parse(sessionInfo);
    if (!parsed || !parsed.salt) {
      console.warn('Invalid session info format:', parsed);
      return null;
    }
    
    const saltBytes = hexToBytes(parsed.salt);
    return await deriveKeyFromPassphrase(passphrase, saltBytes);
  } catch (error) {
    console.error('Failed to load session key:', error);
    return null;
  }
} 