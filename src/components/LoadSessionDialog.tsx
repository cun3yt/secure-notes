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
import { loadExistingSession } from "@/lib/crypto"
import { api } from "@/lib/api"
import { clearExistingSession, storeSessionInfo } from '@/lib/session'

interface LoadSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoadSessionDialog({ open, onOpenChange }: LoadSessionDialogProps) {
  const [key, setKey] = useState("")
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address || !key) {
      setError("Please enter both session address and key")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      // Verify session exists in backend
      const response = await api.validateSession(address)

      // Verify key by attempting to load session
      const isValid = loadExistingSession(address, key)
      if (!isValid) {
        throw new Error("Invalid key for this session")
      }

      // Clear any existing session first
      clearExistingSession()

      // Store new session info
      storeSessionInfo(address, {
        id: address,
        createdAt: response.data.createdAt
      })

      onOpenChange(false)
      router.push(`/s/${address}`)
    } catch (err) {
      console.error('Failed to load session:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Load Session</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="address">Session Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your session address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="key">Session Key</Label>
              <Input
                id="key"
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter your session key"
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