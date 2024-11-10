import { getKey, removeKey } from './crypto';

// Constants
const SESSION_PREFIX = 'session_';

interface SessionInfo {
  id: string;
  createdAt: string;
}

export function storeSessionInfo(sessionId: string, info: SessionInfo): void {
  localStorage.setItem(`${SESSION_PREFIX}${sessionId}`, JSON.stringify(info));
}

export function getSessionInfo(sessionId: string): SessionInfo | null {
  const data = localStorage.getItem(`${SESSION_PREFIX}${sessionId}`);
  if (!data) return null;
  return JSON.parse(data);
}

export function clearExistingSession(): void {
  // Find current session
  const currentSession = getCurrentSession();
  if (currentSession) {
    // Remove session info
    localStorage.removeItem(`${SESSION_PREFIX}${currentSession.id}`);
    // Remove key
    removeKey(currentSession.id);
  }
}

export function getCurrentSession(): SessionInfo | null {
  // Find the first session_ key in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(SESSION_PREFIX)) {
      const sessionId = key.replace(SESSION_PREFIX, '');
      const sessionInfo = getSessionInfo(sessionId);
      if (sessionInfo && getKey(sessionId)) {
        return sessionInfo;
      }
    }
  }
  return null;
}

export function isSessionValid(sessionInfo: SessionInfo): boolean {
  const createdAt = new Date(sessionInfo.createdAt);
  const now = new Date();
  const hours = Math.abs(now.getTime() - createdAt.getTime()) / 36e5;
  return hours < 12; // Session expires after 12 hours
}

export function checkAndClearExpiredSession(): void {
  const currentSession = getCurrentSession();
  if (currentSession && !isSessionValid(currentSession)) {
    clearExistingSession();
  }
} 