'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Document {
  id: string
  title: string
  createdAt: string
  lastModified: string
}

interface DocumentListProps {
  sessionId: string
}

export default function DocumentList({ sessionId }: DocumentListProps) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [documents, setDocuments] = useState<Document[]>([]) // This will be populated from API
  const documentsPerPage = 10

  const totalPages = Math.ceil(documents.length / documentsPerPage)
  const startIndex = (currentPage - 1) * documentsPerPage
  const endIndex = startIndex + documentsPerPage
  const currentDocuments = documents.slice(startIndex, endIndex)

  const handleDocumentClick = (documentId: string) => {
    router.push(`/s/${sessionId}/d/${documentId}`)
  }

  return (
    <div className="space-y-6">
      {currentDocuments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No documents yet. Click "New Document" to create one.
        </div>
      ) : (
        <div className="divide-y">
          {currentDocuments.map((doc) => (
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