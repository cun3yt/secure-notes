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
  // Create a new session (no salt needed anymore)
  createSession: async (address: string) => {
    const response = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ address }),
    })
    if (!response.ok) throw new Error('Failed to create session')
    return response.json()
  },

  // Validate session exists
  validateSession: async (address: string) => {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${address}`)
    if (!response.ok) throw new Error('Session not found')
    return response.json()
  },

  // Get documents for a session
  getDocuments: async (address: string, page = 1) => {
    const response = await fetch(
      `${API_BASE_URL}/api/sessions/${address}/documents?page=${page}`
    )
    if (!response.ok) throw new Error('Failed to fetch documents')
    return response.json()
  },

  // Create a new document
  createDocument: async (address: string, encryptedTitle: string, encryptedContent: string) => {
    const response = await fetch(`${API_BASE_URL}/api/sessions/${address}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        encryptedTitle,
        encryptedContent,
      }),
    })
    if (!response.ok) throw new Error('Failed to create document')
    return response.json()
  },

  // Update a document
  updateDocument: async (
    address: string,
    documentId: string,
    encryptedTitle: string,
    encryptedContent: string
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/api/sessions/${address}/documents/${documentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedTitle,
          encryptedContent,
        }),
      }
    )
    if (!response.ok) throw new Error('Failed to update document')
    return response.json()
  },

  // Delete a document
  deleteDocument: async (address: string, documentId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/sessions/${address}/documents/${documentId}`,
      {
        method: 'DELETE',
      }
    )
    if (!response.ok) throw new Error('Failed to delete document')
    return response.json()
  },
} 