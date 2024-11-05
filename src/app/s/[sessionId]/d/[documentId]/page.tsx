'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DocumentEditor from '@/components/DocumentEditor'

interface DocumentPageProps {
  params: {
    sessionId: string
    documentId: string
  }
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const isNewDocument = params.documentId === 'new'

  useEffect(() => {
    // Check if session exists
    const sessionInfo = localStorage.getItem(`session_${params.sessionId}`)
    if (!sessionInfo) {
      router.replace('/')
      return
    }

    // Load existing document if not new
    if (!isNewDocument) {
      // TODO: Load document content from API
      // For now, we'll use localStorage for demo
      const savedContent = localStorage.getItem(
        `doc_${params.sessionId}_${params.documentId}`
      )
      if (savedContent) {
        setContent(savedContent)
      }
    }
  }, [params.sessionId, params.documentId, isNewDocument, router])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      // TODO: Save to API
      // For now, save to localStorage
      localStorage.setItem(
        `doc_${params.sessionId}_${params.documentId}`,
        content
      )
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save document:', error)
    }
  }

  const handleDiscard = () => {
    if (hasChanges) {
      if (window.confirm('Are you sure you want to discard your changes?')) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  // Extract title from first line of content
  const title = content.split('\n')[0] || 'Untitled'

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-medium truncate">{title}</h1>
          <div className="flex gap-2 sm:gap-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="sm:gap-2"
              title="Save"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="sm:gap-2"
              title="Discard"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Discard</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto max-w-4xl px-4 py-4">
        <DocumentEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start typing your note here..."
        />
      </div>
    </main>
  )
} 