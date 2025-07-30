"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar, AlertCircle } from "lucide-react"
import { getMaxAllowedDate } from "@/lib/date-utils"

interface ChangeDateDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  onDateChange?: (newDate: string) => void
}

export function ChangeDateDialog({ isOpen, onClose, selectedCount, onDateChange }: ChangeDateDialogProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get today's date in Chicago time (06/30/2025) for max date validation
  const maxDate = getMaxAllowedDate()

  const handleClose = () => {
    setSelectedDate("")
    setIsSubmitting(false)
    setError(null)
    onClose()
  }

  const handleSubmit = async () => {
    if (!selectedDate) {
      setError("Please select a date")
      return
    }

    // Validate that the selected date is not in the future
    if (selectedDate > maxDate) {
      setError("Cannot select a future date")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      onDateChange?.(selectedDate)
      handleClose()
    } catch (error) {
      setError("Failed to update date")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
    setError(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Change Contact Date</DialogTitle>
          <div id="dialog-description" className="sr-only">
            Change the contact date for {selectedCount} selected contact{selectedCount > 1 ? "s" : ""}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span>
              This will update the contact date for {selectedCount} selected contact{selectedCount > 1 ? "s" : ""}.
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-date">New Contact Date *</Label>
            <div className="relative">
              <Input
                id="contact-date"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                max={maxDate}
                className="w-full pr-10"
                placeholder="Select date"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500">
              Select a date on or before today (
              {new Date().toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                timeZone: "America/Chicago",
              })}
              )
            </p>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={!selectedDate || isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
