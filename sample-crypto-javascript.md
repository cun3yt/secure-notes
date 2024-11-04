# Sample Javascript Code to Encrypt and Decrypt a Document:

The following is a sample javascript code to encrypt and decrypt a document. Use as a reference to implement the document encryption and decryption:

```javascript
// Utility function to encode string to ArrayBuffer
function encodeString(str) {
  return new TextEncoder().encode(str);
}

// Utility function to decode ArrayBuffer to string
function decodeString(buffer) {
  return new TextDecoder().decode(buffer);
}

// Function to derive a key from a passphrase
async function deriveKeyFromPassphrase(passphrase, salt) {
  // Convert passphrase to ArrayBuffer
  const passphraseKey = encodeString(passphrase);

  // Derive a key using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passphraseKey,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encodeString(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Function to encrypt a document
async function encryptDocument(key, documentText) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector

  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodeString(documentText)
  );

  return {
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(encryptedContent)),
  };
}

// Function to decrypt a document
async function decryptDocument(key, iv, ciphertext) {
  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv),
    },
    key,
    new Uint8Array(ciphertext)
  );

  return decodeString(decryptedContent);
}

// Example usage
(async () => {
  const passphrase = "securepassphrase";
  const salt = "random_salt";
  const documentText = "This is a secure note.";

  // Derive key
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  // Encrypt document
  const { iv, ciphertext } = await encryptDocument(key, documentText);
  console.log("Encrypted:", { iv, ciphertext });

  // Decrypt document
  const decryptedText = await decryptDocument(key, iv, ciphertext);
  console.log("Decrypted:", decryptedText);
})();
```
