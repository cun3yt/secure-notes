'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createNewSession, generateAddress } from "@/lib/crypto"
import { Copy } from "lucide-react"
import { api } from "@/lib/api"
import { clearExistingSession, storeSessionInfo } from '@/lib/session'

interface NewSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NewSessionDialog({ open, onOpenChange }: NewSessionDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedKey, setGeneratedKey] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleCreateSession = async () => {
    try {
      setIsGenerating(true)
      setError("")
      
      // Clear any existing session first
      clearExistingSession()
      
      // Generate new session
      const { address, key } = await createNewSession()
      
      // Create session in backend
      const response = await api.createSession(address)
      
      // Store session info
      storeSessionInfo(address, {
        id: address,
        createdAt: new Date().toISOString()
      })
      
      setGeneratedKey(key)
      
    } catch (err) {
      console.error('Failed to create session:', err)
      setError("Failed to create session. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(generatedKey)
    } catch (err) {
      console.error("Failed to copy key", err)
    }
  }

  const handleContinue = () => {
    if (!generatedKey) return
    
    const address = generateAddress(generatedKey)
    onOpenChange(false)
    router.push(`/s/${address}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!generatedKey ? (
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">
                Click Generate Key to create a new secure session.
              </p>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Your Secure Key</Label>
                <div className="flex gap-2">
                  <Input
                    value={generatedKey}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={handleCopyKey}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Save this key securely. You'll need it to access your notes later.
                </p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button 
            onClick={!generatedKey ? handleCreateSession : handleContinue}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : !generatedKey ? "Generate Key" : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 