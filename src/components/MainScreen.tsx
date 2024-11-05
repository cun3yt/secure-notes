'use client'

import { Button } from "@/components/ui/button"
import { LockKeyhole, Upload } from "lucide-react"
import { useState } from "react"
import NewSessionDialog from "./NewSessionDialog"
import LoadSessionDialog from "./LoadSessionDialog"

export default function MainScreen() {
  const [newSessionOpen, setNewSessionOpen] = useState(false)
  const [loadSessionOpen, setLoadSessionOpen] = useState(false)

  return (
    <div className="w-full max-w-md p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Secure Notes</h1>
        <p className="text-muted-foreground">
          End-to-end encrypted note-taking application
        </p>
      </div>

      <div className="space-y-4">
        <Button 
          variant="default" 
          className="w-full"
          onClick={() => setNewSessionOpen(true)}
        >
          <LockKeyhole className="mr-2 h-4 w-4" />
          Start New Session
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setLoadSessionOpen(true)}
        >
          <Upload className="mr-2 h-4 w-4" />
          Load Previous Session
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