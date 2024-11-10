'use client'

import { useRouter } from 'next/navigation'
import { FilePlus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DocumentList from '@/components/DocumentList'
import { clearExistingSession } from '@/lib/session'

interface SessionPageProps {
  params: {
    sessionId: string
  }
}

export default function SessionPage({ params }: SessionPageProps) {
  const router = useRouter()

  const handleNewDocument = () => {
    router.push(`/s/${params.sessionId}/d/new`)
  }

  const handleEndSession = () => {
    // Just clear local storage - don't delete from backend
    clearExistingSession()
    router.push('/')
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
            title="End Session (Esc)"
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