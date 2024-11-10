import { Buffer } from 'buffer';
import { AES, enc, lib, PBKDF2 } from 'crypto-js';

// Constants
const KEY_PREFIX = 'secure_notes_key_';
const IV_PREFIX = 'secure_notes_iv_';

// Generate a random salt
export function generateSalt(): string {
    const salt = lib.WordArray.random(128/8);
    return salt.toString();
}

// Generate key from salt
export function generateKey(salt: string): string {
    const key = PBKDF2(salt, '', {
        keySize: 256/32,
        iterations: 1000
    });
    return key.toString();
}

// Generate address from key
export function generateAddress(key: string): string {
    const address = PBKDF2(key + "sampleTextHere", '', {
        keySize: 256/32,
        iterations: 1
    });
    return address.toString();
}

// Store key in localStorage
export function storeKey(address: string, key: string): void {
    localStorage.setItem(`${KEY_PREFIX}${address}`, key);
}

// Get key from localStorage
export function getKey(address: string): string | null {
    return localStorage.getItem(`${KEY_PREFIX}${address}`);
}

// Remove key from localStorage
export function removeKey(address: string): void {
    localStorage.removeItem(`${KEY_PREFIX}${address}`);
}

// Store IV in localStorage
export function storeIV(documentId: string, iv: string): void {
    localStorage.setItem(`${IV_PREFIX}${documentId}`, iv);
}

// Get IV from localStorage
export function getIV(documentId: string): string | null {
    return localStorage.getItem(`${IV_PREFIX}${documentId}`);
}

// Remove IV from localStorage
export function removeIV(documentId: string): void {
    localStorage.removeItem(`${IV_PREFIX}${documentId}`);
}

// Encrypt text using key
export function encrypt(text: string, key: string): string {
    const iv = lib.WordArray.random(128/8);
    const encrypted = AES.encrypt(text, key, {
        iv: iv
    });
    return JSON.stringify({
        iv: iv.toString(),
        content: encrypted.toString()
    });
}

// Decrypt text using key
export function decrypt(encryptedData: string, key: string): string {
    const parsed = JSON.parse(encryptedData);
    const decrypted = AES.decrypt(parsed.content, key, {
        iv: enc.Hex.parse(parsed.iv)
    });
    return decrypted.toString(enc.Utf8);
}

// Create a new session
export async function createNewSession(): Promise<{address: string, key: string}> {
    const salt = generateSalt();
    const key = generateKey(salt);
    const address = generateAddress(key);
    storeKey(address, key);
    return { address, key };
}

// Load existing session
export function loadExistingSession(address: string, key: string): boolean {
    try {
        // Verify the key by attempting to generate the same address
        const generatedAddress = generateAddress(key);
        if (generatedAddress !== address) {
            return false;
        }
        storeKey(address, key);
        return true;
    } catch (error) {
        return false;
    }
}