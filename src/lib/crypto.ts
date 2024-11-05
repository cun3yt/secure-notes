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