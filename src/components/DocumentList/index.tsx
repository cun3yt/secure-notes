'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { DocumentMetadata } from '@/types/api'
import { loadSessionKey, decryptDocument } from '@/lib/crypto'

interface DocumentListProps {
  sessionId: string
}

interface DocumentListItem {
  id: string;
  encryptedTitle: { iv: string; content: string };
  createdAt: string;
  lastModified: string;
  sessionId: string;
}

export default function DocumentList({ sessionId }: DocumentListProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [documents, setDocuments] = useState<DocumentListItem[]>([])
  const [decryptedTitles, setDecryptedTitles] = useState<{ [key: string]: string }>({})
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const documentsPerPage = 10
  const totalPages = Math.ceil(totalDocuments / documentsPerPage)

  useEffect(() => {
    async function decryptTitles(docs: DocumentListItem[]) {
      try {
        const sessionInfo = localStorage.getItem(`session_${sessionId}`)
        if (!sessionInfo) {
          console.warn('No session info found');
          return;
        }

        const parsed = JSON.parse(sessionInfo);
        if (!parsed || !parsed.passphrase) {
          console.warn('Invalid session info format');
          return;
        }

        const key = await loadSessionKey(sessionId, parsed.passphrase)
        if (!key) {
          console.warn('Failed to load session key');
          return;
        }

        const titles: { [key: string]: string } = {}
        for (const doc of docs) {
          try {
            const decryptedTitle = await decryptDocument(doc.encryptedTitle, key)
            titles[doc.id] = decryptedTitle.split('\n')[0] || 'Untitled'
          } catch (err) {
            console.error('Failed to decrypt title:', err)
            titles[doc.id] = 'Untitled'
          }
        }
        setDecryptedTitles(titles)
      } catch (err) {
        console.error('Failed to decrypt titles:', err);
      }
    }

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
          await decryptTitles(response.data.documents)
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

  const handleKeyNavigation = async (direction: 'up' | 'down') => {
    if (direction === 'down') {
      // If we're at the last item of the current page
      if (selectedIndex === documents.length - 1) {
        // Check if there's a next page
        if (currentPage < totalPages) {
          // Load next page and select first item
          setCurrentPage(prev => prev + 1)
          setSelectedIndex(0)
        }
        // If no next page, keep selection at last item
      } else {
        // Normal within-page navigation
        setSelectedIndex(prev => Math.min(prev + 1, documents.length - 1))
      }
    } else { // direction === 'up'
      // If we're at the first item of the current page
      if (selectedIndex === 0) {
        // Check if there's a previous page
        if (currentPage > 1) {
          // Load previous page and select last item
          setCurrentPage(prev => prev - 1)
          // We'll set selectedIndex to last item after the page loads
          setSelectedIndex(documentsPerPage - 1)
        }
        // If no previous page, keep selection at first item
      } else {
        // Normal within-page navigation
        setSelectedIndex(prev => Math.max(prev - 1, 0))
      }
    }
  }

  // Update keyboard event handler
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement?.tagName.toLowerCase()
      if (activeElement === 'input' || activeElement === 'textarea') {
        return
      }

      switch (event.key.toLowerCase()) {
        case 'j':
        case 'arrowdown':
          event.preventDefault()
          handleKeyNavigation('down')
          break
        
        case 'k':
        case 'arrowup':
          event.preventDefault()
          handleKeyNavigation('up')
          break
        
        case 'enter':
          event.preventDefault()
          if (documents[selectedIndex]) {
            handleDocumentClick(documents[selectedIndex].id)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [documents, selectedIndex, currentPage, totalPages])

  // Reset selection when page changes, but preserve direction
  useEffect(() => {
    // If we came from previous page, select last item
    if (selectedIndex === documentsPerPage - 1 && documents.length > 0) {
      setSelectedIndex(documents.length - 1)
    }
    // If we came from next page, first item is already selected (0)
  }, [currentPage, documents.length, selectedIndex])

  const handleDocumentClick = (documentId: string) => {
    router.push(`/s/${sessionId}/d/${documentId}`)
  }

  // Handle page change from buttons
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setSelectedIndex(0)  // Reset selection to first item
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
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              onClick={() => handleDocumentClick(doc.id)}
              className={`py-4 cursor-pointer px-4 -mx-4 ${
                index === selectedIndex 
                  ? 'bg-accent/100' 
                  : 'hover:bg-accent/50'
              }`}
              tabIndex={0}
              role="button"
              aria-selected={index === selectedIndex}
            >
              <h3 className="font-medium mb-1">
                {decryptedTitles[doc.id] || 'Untitled'}
              </h3>
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
            onClick={() => handlePageChange(currentPage - 1)}
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 