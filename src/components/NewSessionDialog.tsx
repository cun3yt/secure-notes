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

interface NewSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NewSessionDialog({ open, onOpenChange }: NewSessionDialogProps) {
  const [passphrase, setPassphrase] = useState("")
  const [generatedKey, setGeneratedKey] = useState("")
  const router = useRouter()

  const handleCreateSession = async () => {
    // TODO: Implement key generation and session creation
    // This will be implemented when we add the crypto functionality
    onOpenChange(false)
    // Navigate to session page
    router.push(`/s/${generatedKey}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="passphrase">Enter Passphrase</Label>
            <Input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter a secure passphrase"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateSession}>Create Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 