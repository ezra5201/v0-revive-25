"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ChangeDateDialogProps {
  isOpen: boolean
  onClose: () => void
  contactId: number
  currentDate: string
  clientName: string
  onDateChanged: () => void
}

export function ChangeDateDialog({
  isOpen,
  onClose,
  contactId,
  currentDate,
  clientName,
  onDateChanged,
}: ChangeDateDialogProps) {
  const [newDate, setNewDate] = useState(currentDate)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/change-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId,
          newDate,
        }),
      })

      if (response.ok) {
        toast({
          title: "Date Updated",
          description: `Contact date changed to ${new Date(newDate).toLocaleDateString()}`,
        })
        onDateChanged()
        onClose()
      } else {
        throw new Error("Failed to update date")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact date",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Change Contact Date</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client">Client</Label>
            <Input id="client" value={clientName} disabled className="bg-gray-50" />
          </div>

          <div>
            <Label htmlFor="currentDate">Current Date</Label>
            <Input
              id="currentDate"
              value={new Date(currentDate).toLocaleDateString()}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="newDate">New Date</Label>
            <Input id="newDate" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || newDate === currentDate}>
              {isLoading ? "Updating..." : "Update Date"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
