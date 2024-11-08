export interface DocumentMetadata {
  id: string
  encryptedTitle: { iv: string; content: string }
  createdAt: string
  lastModified: string
}

export interface EncryptedDocumentData {
  id: string
  encryptedContent: {
    iv: string
    content: string
  }
  encryptedTitle: {
    iv: string
    content: string
  }
  sessionId: string
  createdAt: string
  lastModified: string
}

export interface SessionResponse {
  id: string
  salt: string
  createdAt: string
  lastAccessed: string
}

export interface ApiResponse<T> {
  data: T
  error?: string
} 