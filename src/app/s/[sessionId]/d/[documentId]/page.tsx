'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DocumentEditor from '@/components/DocumentEditor'
import { 
  encryptDocument, 
  decryptDocument,
  loadSessionKey
} from '@/lib/crypto'
import { api } from '@/lib/api'

interface DocumentPageProps {
  params: {
    sessionId: string
    documentId: string
  }
}

interface SessionInfo {
  id: string
  salt: string
  createdAt: string
  passphrase: string
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const isNewDocument = params.documentId === 'new'

  useEffect(() => {
    async function loadDocument() {
      try {
        // Check if session exists
        const storedSession = localStorage.getItem(`session_${params.sessionId}`)
        if (!storedSession) {
          router.replace('/')
          return
        }

        const session = JSON.parse(storedSession) as SessionInfo
        setSessionInfo(session)

        // Load existing document if not new
        if (!isNewDocument) {
          const key = await loadSessionKey(params.sessionId, session.passphrase)
          if (!key) {
            throw new Error("Failed to load session key")
          }

          const response = await api.getDocument(params.sessionId, params.documentId)
          const decryptedContent = await decryptDocument(
            response.data.encryptedContent,
            key
          )
          setContent(decryptedContent)
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
    if (!sessionInfo || isSaving) return

    try {
      setIsSaving(true)
      setError(null)

      const key = await loadSessionKey(params.sessionId, sessionInfo.passphrase)
      if (!key) {
        throw new Error("Failed to load session key")
      }

      const title = content.split('\n')[0] || 'Untitled'
      const encryptedContent = await encryptDocument(content, key)
      const encryptedTitle = await encryptDocument(title, key)
      
      if (isNewDocument) {
        const response = await api.createDocument(
          params.sessionId,
          encryptedContent,
          encryptedTitle
        )
        router.replace(`/s/${params.sessionId}/d/${response.data.id}`)
      } else {
        await api.updateDocument(
          params.sessionId,
          params.documentId,
          encryptedContent,
          encryptedTitle
        )
      }
      
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save document:', error)
      setError('Failed to save document')
    } finally {
      setIsSaving(false)
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-medium truncate">{title}</h1>
          <div className="flex gap-2 sm:gap-4">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="sm:gap-2"
              title="Save"
            >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isSaving ? "Saving..." : "Save"}
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={handleDiscard}
              disabled={isSaving}
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