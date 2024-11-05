export interface DocumentMetadata {
  id: string
  title: string
  createdAt: string
  lastModified: string
  sessionId: string
}

export interface EncryptedDocumentData {
  id: string
  encryptedContent: {
    iv: string
    content: string
  }
  sessionId: string
  createdAt: string
  lastModified: string
}

export interface ApiResponse<T> {
  data: T
  error?: string
} 