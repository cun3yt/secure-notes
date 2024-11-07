'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LockKeyhole, Upload } from "lucide-react"
import NewSessionDialog from "./NewSessionDialog"
import LoadSessionDialog from "./LoadSessionDialog"

export default function MainScreen() {
  const [newSessionOpen, setNewSessionOpen] = useState(false)
  const [loadSessionOpen, setLoadSessionOpen] = useState(false)

  // Add keyboard shortcut handler
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Only trigger if no input/textarea is focused
      const activeElement = document.activeElement?.tagName.toLowerCase()
      if (activeElement === 'input' || activeElement === 'textarea') {
        return
      }

      switch (event.key.toLowerCase()) {
        case 'n':
          event.preventDefault()
          setNewSessionOpen(true)
          break
        case 'l':
          event.preventDefault()
          setLoadSessionOpen(true)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-4xl font-bold mb-8">Secure Notes</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => setNewSessionOpen(true)}
          className="gap-2"
          title="Start New Session (N)"
          {...{}}
        >
          <LockKeyhole className="h-4 w-4" />
          New Session
        </Button>
        <Button
          variant="outline"
          onClick={() => setLoadSessionOpen(true)}
          className="gap-2"
          title="Load Previous Session (L)"
          {...{}}
        >
          <Upload className="h-4 w-4" />
          Load Session
        </Button>
      </div>

      <NewSessionDialog
        open={newSessionOpen}
        onOpenChange={setNewSessionOpen}
      />

      <LoadSessionDialog
        open={loadSessionOpen}
        onOpenChange={setLoadSessionOpen}
      />
    </div>
  )
} 