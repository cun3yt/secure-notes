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

interface LoadSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoadSessionDialog({ open, onOpenChange }: LoadSessionDialogProps) {
  const [key, setKey] = useState("")
  const [passphrase, setPassphrase] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLoadSession = async () => {
    // TODO: Implement session loading and validation
    // This will be implemented when we add the crypto functionality
    onOpenChange(false)
    // Navigate to session page
    router.push(`/s/${key}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Load Previous Session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="key">Session Key</Label>
            <Input
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter your session key"
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
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleLoadSession}>Load Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 