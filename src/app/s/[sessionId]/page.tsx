'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FilePlus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DocumentList from '@/components/DocumentList'

interface SessionInfo {
  id: string
  salt: string
  createdAt: string
}

export default function SessionPage({
  params
}: {
  params: { sessionId: string }
}) {
  const router = useRouter()
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)

  useEffect(() => {
    // Check if session exists in localStorage
    const storedSession = localStorage.getItem(`session_${params.sessionId}`)
    if (!storedSession) {
      router.replace('/')
      return
    }

    const session = JSON.parse(storedSession)
    setSessionInfo(session)

    // Check session age
    const sessionAge = Date.now() - new Date(session.createdAt).getTime()
    const maxAge = 12 * 60 * 60 * 1000 // 12 hours in milliseconds
    
    if (sessionAge > maxAge) {
      handleEndSession()
    }
  }, [params.sessionId, router])

  const handleEndSession = () => {
    if (sessionInfo) {
      localStorage.removeItem(`session_${sessionInfo.id}`)
    }
    router.replace('/')
  }

  const handleNewDocument = () => {
    router.push(`/s/${params.sessionId}/d/new`)
  }

  if (!sessionInfo) {
    return null // or a loading spinner
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Secure Notes</h1>
        <div className="flex gap-2 sm:gap-4">
          <Button
            onClick={handleNewDocument}
            className="sm:gap-2"
            title="New Document"
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