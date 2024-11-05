'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { DocumentMetadata } from '@/types/api'

interface DocumentListProps {
  sessionId: string
}

export default function DocumentList({ sessionId }: DocumentListProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [documents, setDocuments] = useState<DocumentMetadata[]>([])
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const documentsPerPage = 10
  const totalPages = Math.ceil(totalDocuments / documentsPerPage)

  useEffect(() => {
    async function fetchDocuments() {
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
      console.log('Fetching documents for session:', sessionId)
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await api.getDocuments(sessionId, currentPage)
        console.log('Raw API Response:', response)
        
        if (response.data) {
          console.log('Setting documents:', response.data.documents)
          setDocuments(response.data.documents)
          setTotalDocuments(response.data.total)
          console.log('Documents loaded:', response.data.documents.length)
        } else {
          console.error('Invalid API response:', response)
          setError('Invalid response format')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load documents'
        console.error('Document fetch error:', err)
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionId) {
      fetchDocuments()
    } else {
      console.warn('No sessionId provided')
    }
  }, [sessionId, currentPage])

  const handleDocumentClick = (documentId: string) => {
    router.push(`/s/${sessionId}/d/${documentId}`)
  }

  console.log('DocumentList render state:', {
    isLoading,
    error,
    documentsCount: documents.length,
    totalDocuments,
    sessionId
  })

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading documents...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {documents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No documents yet. Click "New Document" to create one.
        </div>
      ) : (
        <div className="divide-y">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => handleDocumentClick(doc.id)}
              className="py-4 cursor-pointer hover:bg-accent/50 px-4 -mx-4"
            >
              <h3 className="font-medium mb-1">{doc.title}</h3>
              <div className="text-sm text-muted-foreground flex gap-4">
                <span>Created: {new Date(doc.createdAt).toLocaleDateString()}</span>
                <span>Modified: {new Date(doc.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 