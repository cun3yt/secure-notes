'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DocumentEditor from '@/components/DocumentEditor'
import { 
  encryptDocument, 
  decryptDocument, 
  type EncryptedDocument,
  loadSessionKey
} from '@/lib/crypto'

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isNewDocument = params.documentId === 'new'

  useEffect(() => {
    async function loadDocument() {
      try {
        // Check if session exists
        const sessionInfo = localStorage.getItem(`session_${params.sessionId}`)
        if (!sessionInfo) {
          router.replace('/')
          return
        }

        // Load existing document if not new
        if (!isNewDocument) {
          const encryptedDoc = localStorage.getItem(
            `doc_${params.sessionId}_${params.documentId}`
          )
          
          if (encryptedDoc) {
            // TODO: In production, we'd get the passphrase from a secure session store
            // For demo, we'll use a fixed passphrase
            const demoPassphrase = "demo123" // This should come from secure session storage
            const key = await loadSessionKey(params.sessionId, demoPassphrase)
            
            if (!key) {
              throw new Error("Failed to load session key")
            }

            const decryptedContent = await decryptDocument(
              JSON.parse(encryptedDoc),
              key
            )
            setContent(decryptedContent)
          }
        }
      } catch (err) {
        console.error('Failed to load document:', err)
        setError('Failed to load document')
      } finally {
        setIsLoading(false)
      }
    }

    loadDocument()
  }, [params.sessionId, params.documentId, isNewDocument, router])

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      // TODO: In production, get passphrase from secure session storage
      const demoPassphrase = "demo123"
      const key = await loadSessionKey(params.sessionId, demoPassphrase)
      
      if (!key) {
        throw new Error("Failed to load session key")
      }

      const encryptedDoc = await encryptDocument(content, key)
      
      // TODO: Save to API
      // For now, save to localStorage
      localStorage.setItem(
        `doc_${params.sessionId}_${params.documentId}`,
        JSON.stringify(encryptedDoc)
      )
      
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save document:', error)
      setError('Failed to save document')
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

  if (isLoading) {
    return <div>Loading...</div> // TODO: Add proper loading spinner
  }

  if (error) {
    return <div>Error: {error}</div> // TODO: Add proper error component
  }

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