# Instructions 11/09/24

This document is an update to the instructions given earlier in `cursor-directions/instructions.md`.

We need to change the way crypto is handled in both the frontend and backend. See the ones below for the changes:

- **salt**: Randomly generated (never stored)

- **Key Generation**: salt -> key.

- **Address Generation**: key + "sampleTextHere" -> address (to be used as session ID and the document ID)

- **Encryption**: key + text -> encryptedText (to be used for the document content and the document title)

- **Decryption**: key + encryptedText -> original text (to be used for the document content and the document title)

## Storing the key

The key will be stored in the browser's local storage, as well as IV. But it will NEVER be stored in the backend.

## Encryption/Decryption

The encryption/decryption algorithm will still be AES as currently done.

## Address

The address will be done to be stored in the backend. It will be used to identify the session, as well as the document. The session and the user is interchangeable.

## Backend

Do not store the salt in the backend, as it will not be used again. Passphrase is not needed in the backend. The decryption will never use the passphrase. Passphrase is only used to generate the key.

## Frontend

Drop the passphrase all together. On the session creation, generate a random salt and use it to generate the key. The key will be shown to the user (only once). On the load session, the user will input the key. That key will be stored in the browser's local storage. And the key will be used for encryption/decryption on the frontend.

## The Code Needs To Be Updated

The codes that I can identify that may need to be updated are:

- `src/lib/crypto.ts` and most probably the files that are calling it.

- NewSessionDialog.tsx

- LoadSessionDialog.tsx

- MainScreen.tsx

- `backend/api.py`

There may be more, so just be on the lookout for files that are calling the functions in `src/lib/crypto.ts`. Also, the ones that are using passphrase.

## Important Notes

- After every step, give explicit direction on how to test it manually.
- After every step tell me what some of the next steps can be.
- After every step, if it is a state to be committed to git, suggest a commit message.
- My development environment is MacOS M2 chip.
