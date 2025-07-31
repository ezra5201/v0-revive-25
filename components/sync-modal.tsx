"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2, Database } from "lucide-react"

interface SyncModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SyncModal({ open, onOpenChange }: SyncModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const handleSync = async () => {
    setIsLoading(true)
    setMessage(null)
    setIsError(false)

    try {
      const response = await fetch("/api/sync-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(`Success: ${result.message}`)
        setIsError(false)
      } else {
        setMessage(`Error: ${result.message}`)
        setIsError(true)
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Monthly Data Sync
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">Synchronize all historical contact data with monthly service summary.</p>

          <Button onClick={handleSync} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sync All Data
          </Button>

          {message && (
            <div className={`text-sm p-3 rounded ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              {message}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
