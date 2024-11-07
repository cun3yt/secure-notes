'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { deriveKeyFromPassphrase, hexToBytes } from "@/lib/crypto"
import { clearExistingSession } from '@/lib/session'

interface LoadSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoadSessionDialog({ open, onOpenChange }: LoadSessionDialogProps) {
  const [sessionId, setSessionId] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId || !passphrase) {
      setError("Please enter both session key and passphrase")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Get session info including salt from backend
      const sessionResponse = await api.validateSession(sessionId)
      const { salt, createdAt } = sessionResponse.data

      // Try to derive the key to verify passphrase
      const saltBytes = hexToBytes(salt)
      const key = await deriveKeyFromPassphrase(passphrase, saltBytes)
      
      if (!key) {
        throw new Error("Failed to derive key")
      }

      // Clear any existing session first
      clearExistingSession();

      // Store session info in localStorage with original salt
      const sessionInfo = {
        id: sessionId,
        salt,
        passphrase,
        createdAt
      }
      localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionInfo))

      onOpenChange(false)
      router.push(`/s/${sessionId}`)
    } catch (err) {
      console.error('Failed to load session:', err)
      setError("Invalid session key or passphrase")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Load Previous Session</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sessionId">Session Key</Label>
              <Input
                id="sessionId"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter your session key"
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="passphrase">Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter your passphrase"
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Load Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 