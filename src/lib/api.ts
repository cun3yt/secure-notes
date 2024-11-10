import { ApiResponse, DocumentMetadata, EncryptedDocumentData, SessionResponse } from "@/types/api"

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
  const url = `${API_BASE_URL}${endpoint}`
  console.log('Fetching:', url, options)
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()
    console.log('API Response:', { url, data })

    if (!response.ok) {
      console.error('API Error:', { url, status: response.status, data })
      throw new ApiError(data.error || 'An error occurred', response.status)
    }

    return data
  } catch (error) {
    console.error('Fetch Error:', { url, error })
    throw error
  }
}

export const api = {
  // Session endpoints
  createSession: async (address: string) => {
    return fetchApi<SessionResponse>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ address }),
    })
  },

  validateSession: async (address: string) => {
    return fetchApi<SessionResponse>(`/api/sessions/${address}`)
  },

  // Document endpoints
  getDocuments: async (address: string, page = 1) => {
    return fetchApi<{ documents: DocumentMetadata[], total: number, pages: number }>(
      `/api/sessions/${address}/documents?page=${page}`
    )
  },

  getDocument: async (address: string, documentId: string) => {
    return fetchApi<EncryptedDocumentData>(
      `/api/sessions/${address}/documents/${documentId}`
    )
  },

  createDocument: async (
    address: string,
    encryptedTitle: string,
    encryptedContent: string
  ) => {
    return fetchApi<EncryptedDocumentData>(`/api/sessions/${address}/documents`, {
      method: 'POST',
      body: JSON.stringify({
        encryptedTitle,
        encryptedContent,
      }),
    })
  },

  updateDocument: async (
    address: string,
    documentId: string,
    encryptedTitle: string,
    encryptedContent: string
  ) => {
    return fetchApi<EncryptedDocumentData>(
      `/api/sessions/${address}/documents/${documentId}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          encryptedTitle,
          encryptedContent,
        }),
      }
    )
  },

  deleteDocument: async (address: string, documentId: string) => {
    return fetchApi<{ message: string }>(
      `/api/sessions/${address}/documents/${documentId}`,
      {
        method: 'DELETE',
      }
    )
  },
} 