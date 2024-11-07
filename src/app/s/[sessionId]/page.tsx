'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DocumentList from '@/components/DocumentList'
import { api } from '@/lib/api'

interface SessionInfo {
  id: string
  salt: string
  createdAt: string
  passphrase: string
}

export default function SessionPage({
  params
}: {
  params: { sessionId: string }
}) {
  const router = useRouter()
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function validateAndLoadSession() {
      console.log('Validating session:', params.sessionId)
      try {
        // Check if session exists in localStorage
        const storedSession = localStorage.getItem(`session_${params.sessionId}`)
        if (!storedSession) {
          console.log('No session found in localStorage')
          router.replace('/')
          return
        }

        const session = JSON.parse(storedSession)
        
        // Validate session with backend
        try {
          await api.validateSession(params.sessionId)
          console.log('Session validated with backend')
        } catch (err) {
          console.error('Session validation failed:', err)
          localStorage.removeItem(`session_${params.sessionId}`)
          router.replace('/')
          return
        }

        setSessionInfo(session)
      } catch (err) {
        console.error('Error loading session:', err)
        router.replace('/')
      } finally {
        setIsLoading(false)
      }
    }

    validateAndLoadSession()
  }, [params.sessionId, router])

  const handleEndSession = async () => {
    if (!sessionInfo) return

    // Add confirmation dialog
    const confirmed = window.confirm('Are you sure to end the current session?')
    if (!confirmed) return

    try {
      await api.endSession(params.sessionId)
      localStorage.removeItem(`session_${sessionInfo.id}`)
      router.replace('/')
    } catch (err) {
      console.error('Failed to end session:', err)
    }
  }

  const handleNewDocument = () => {
    router.push(`/s/${params.sessionId}/d/new`)
  }

  // Keyboard shortcut handler
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Only trigger if no input/textarea is focused
      const activeElement = document.activeElement?.tagName.toLowerCase()
      if (activeElement === 'input' || activeElement === 'textarea') {
        return
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault()
        handleNewDocument()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [params.sessionId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    )
  }

  if (!sessionInfo) {
    return null
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Secure Notes</h1>
        <div className="flex gap-2 sm:gap-4">
          <Button
            onClick={handleNewDocument}
            className="sm:gap-2"
            title="New Document (N)"
          >
            <FilePlus className="h-4 w-4" />
            <span className="hidden sm:inline">New Document</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleEndSession}
            className="sm:gap-2"
            title="End Session"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">End Session</span>
          </Button>
        </div>
      </div>

      <DocumentList sessionId={params.sessionId} />
    </main>
  )
} 