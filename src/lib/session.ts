// New utility file for session management
export function clearExistingSession() {
  // Find and remove any existing session
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('session_')) {
      localStorage.removeItem(key);
    }
  }
} 