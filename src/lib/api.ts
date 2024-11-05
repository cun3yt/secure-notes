import { ApiResponse, DocumentMetadata, EncryptedDocumentData } from "@/types/api"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(data.error || 'An error occurred', response.status)
  }

  return data
}

export const api = {
  // Get list of documents for a session
  async getDocuments(sessionId: string, page: number = 1): Promise<ApiResponse<{
    documents: DocumentMetadata[]
    total: number
  }>> {
    return fetchApi(`/api/sessions/${sessionId}/documents?page=${page}`)
  },

  // Get a single document
  async getDocument(sessionId: string, documentId: string): Promise<ApiResponse<EncryptedDocumentData>> {
    return fetchApi(`/api/sessions/${sessionId}/documents/${documentId}`)
  },

  // Create a new document
  async createDocument(
    sessionId: string,
    encryptedContent: { iv: string; content: string }
  ): Promise<ApiResponse<EncryptedDocumentData>> {
    return fetchApi(`/api/sessions/${sessionId}/documents`, {
      method: 'POST',
      body: JSON.stringify({ encryptedContent }),
    })
  },

  // Update a document
  async updateDocument(
    sessionId: string,
    documentId: string,
    encryptedContent: { iv: string; content: string }
  ): Promise<ApiResponse<EncryptedDocumentData>> {
    return fetchApi(`/api/sessions/${sessionId}/documents/${documentId}`, {
      method: 'PUT',
      body: JSON.stringify({ encryptedContent }),
    })
  },

  // Delete a document
  async deleteDocument(
    sessionId: string,
    documentId: string
  ): Promise<ApiResponse<void>> {
    return fetchApi(`/api/sessions/${sessionId}/documents/${documentId}`, {
      method: 'DELETE',
    })
  },

  // Create a new session
  async createSession(sessionId: string): Promise<ApiResponse<{
    id: string;
    createdAt: string;
    lastAccessed: string;
  }>> {
    return fetchApi('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ address: sessionId }),
    })
  },

  // Validate a session
  async validateSession(sessionId: string): Promise<ApiResponse<{
    id: string;
    createdAt: string;
    lastAccessed: string;
  }>> {
    return fetchApi(`/api/sessions/${sessionId}`)
  },

  // End a session
  async endSession(sessionId: string): Promise<ApiResponse<{
    message: string;
  }>> {
    return fetchApi(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    })
  },
} 