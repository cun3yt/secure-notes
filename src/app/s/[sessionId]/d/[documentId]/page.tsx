'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DocumentEditor from '@/components/DocumentEditor'
import { 
  encrypt, 
  decrypt,
  getKey
} from '@/lib/crypto'
import { api } from '@/lib/api'
import { getCurrentSession } from '@/lib/session'

interface DocumentPageProps {
  params: {
    sessionId: string
    documentId: string
  }
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const [content, setContent] = useState("")
  const [originalContent, setOriginalContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loadDocument = useCallback(async () => {
    try {
      const key = getKey(params.sessionId)
      if (!key) {
        router.push('/')
        return
      }

      if (params.documentId === 'new') {
        setContent("")
        setOriginalContent("")
        return
      }

      const response = await api.getDocument(params.sessionId, params.documentId)
      const decryptedContent = decrypt(response.data.encryptedContent, key)
      
      setContent(decryptedContent)
      setOriginalContent(decryptedContent)
      setError(null)
    } catch (err) {
      console.error('Failed to load document:', err)
      setError('Failed to load document')
    }
  }, [params.sessionId, params.documentId, router])

  useEffect(() => {
    loadDocument()
  }, [loadDocument])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const key = getKey(params.sessionId)
      if (!key) {
        router.push('/')
        return
      }

      const title = content.split('\n')[0] || 'Untitled'
      
      const encryptedContent = encrypt(content, key)
      const encryptedTitle = encrypt(title, key)

      if (params.documentId === 'new') {
        const response = await api.createDocument(
          params.sessionId,
          encryptedTitle,
          encryptedContent
        )
        router.push(`/s/${params.sessionId}/d/${response.data.id}`)
      } else {
        await api.updateDocument(
          params.sessionId,
          params.documentId,
          encryptedTitle,
          encryptedContent
        )
      }

      setOriginalContent(content)
    } catch (err) {
      console.error('Failed to save document:', err)
      setError('Failed to save document')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    setContent(originalContent)
  }

  const hasChanges = content !== originalContent

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDiscard}
            disabled={!hasChanges}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Discard
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-2 rounded mb-4">
          {error}
        </div>
      )}

      <DocumentEditor
        content={content}
        onChange={setContent}
        placeholder="Start typing..."
      />
    </div>
  )
} 