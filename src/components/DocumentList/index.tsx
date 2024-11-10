'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { decrypt, getKey } from '@/lib/crypto'
import { DocumentMetadata } from '@/types/api'

interface DocumentListProps {
  sessionId: string
}

export default function DocumentList({ sessionId }: DocumentListProps) {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([])
  const [decryptedTitles, setDecryptedTitles] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function decryptTitles(docs: DocumentMetadata[]) {
      try {
        const key = getKey(sessionId)
        if (!key) {
          console.warn('No session key found');
          return;
        }

        const titles: { [key: string]: string } = {}
        for (const doc of docs) {
          try {
            const decryptedTitle = decrypt(doc.encryptedTitle, key)
            titles[doc.id] = decryptedTitle || 'Untitled'
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
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await api.getDocuments(sessionId, currentPage)
        
        if (response.data) {
          setDocuments(response.data.documents)
          await decryptTitles(response.data.documents)
          setTotalPages(response.data.pages)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load documents'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [sessionId, currentPage])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Only trigger if no input/textarea is focused
      const activeElement = document.activeElement?.tagName.toLowerCase()
      if (activeElement === 'input' || activeElement === 'textarea') {
        return
      }

      switch (event.key.toLowerCase()) {
        case 'j':
        case 'arrowdown':
          event.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, documents.length - 1))
          break
        case 'k':
        case 'arrowup':
          event.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
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
  }, [documents, selectedIndex])

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex] as HTMLElement
    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      })
    }
  }, [selectedIndex])

  const handleDocumentClick = (documentId: string) => {
    router.push(`/s/${sessionId}/d/${documentId}`)
  }

  if (isLoading) {
    return <div>Loading documents...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <p className="text-muted-foreground">No documents yet. Create one to get started!</p>
      ) : (
        <div className="space-y-1" ref={listRef}>
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              onClick={() => handleDocumentClick(doc.id)}
              className={`p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                index === selectedIndex ? 'bg-accent' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium truncate">
                  {decryptedTitles[doc.id] || 'Untitled'}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {new Date(doc.lastModified).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 