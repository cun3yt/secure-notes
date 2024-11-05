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
import { generateSessionKey } from "@/lib/crypto"
import { Copy } from "lucide-react"

interface NewSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NewSessionDialog({ open, onOpenChange }: NewSessionDialogProps) {
  const [passphrase, setPassphrase] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedKey, setGeneratedKey] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleCreateSession = async () => {
    if (!passphrase) {
      setError("Please enter a passphrase");
      return;
    }

    try {
      setIsGenerating(true);
      setError("");
      
      const { sessionId, salt, key } = await generateSessionKey(passphrase);
      
      // Store the session info in localStorage
      const sessionInfo = {
        id: sessionId,
        salt,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(`session_${sessionId}`, JSON.stringify(sessionInfo));
      
      // Show the generated key to the user
      setGeneratedKey(sessionId);
      
    } catch (err) {
      setError("Failed to generate session key");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(generatedKey);
    } catch (err) {
      console.error("Failed to copy key", err);
    }
  }

  const handleContinue = () => {
    onOpenChange(false);
    router.push(`/s/${generatedKey}`);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedKey) {
      handleCreateSession();
    } else {
      handleContinue();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!generatedKey ? (
              <div className="grid gap-2">
                <Label htmlFor="passphrase">Enter Passphrase</Label>
                <Input
                  id="passphrase"
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter a secure passphrase"
                  autoFocus
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Your Session Key</Label>
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
            {!generatedKey ? (
              <Button 
                type="submit"
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Create Session"}
              </Button>
            ) : (
              <Button type="submit">
                Continue to Session
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 