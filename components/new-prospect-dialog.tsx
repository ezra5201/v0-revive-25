"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, AlertCircle } from "lucide-react"

interface NewProspectDialogProps {
  isOpen: boolean
  onClose: () => void
  onProspectCreated?: (prospectData: ProspectData) => void
  onCheckInSubmit?: (data: any) => void
  prefilledName?: string
  existingClients?: { name: string }[]
}

interface ProspectData {
  name: string
  objectives: string[]
  accessedFood: boolean
  comments: string
  hasAlert: boolean
  alertDetails: string
}

const objectives = [
  { value: "Case Management", label: "Case Management (CM)" },
  { value: "Employment", label: "Employment Services" },
  { value: "Food", label: "Food" },
  { value: "Healthcare", label: "Healthcare Support" },
  { value: "Housing", label: "Housing Support" },
  { value: "ID", label: "ID/Documentation" },
  { value: "Laundry", label: "Laundry" },
  { value: "Occupational", label: "Occupational Therapy (OT)" },
  { value: "Recreation", label: "Recreation" },
  { value: "Other", label: "Other" },
]

// Helper function to properly capitalize names
function capitalizeFullName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(" ")
}

export function NewProspectDialog({
  isOpen,
  onClose,
  onProspectCreated,
  onCheckInSubmit,
  prefilledName = "",
  existingClients = [],
}: NewProspectDialogProps) {
  const [name, setName] = useState("")
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([])
  const [accessedFood, setAccessedFood] = useState(false)
  const [comments, setComments] = useState("")
  const [hasAlert, setHasAlert] = useState(false)
  const [alertDetails, setAlertDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  // Update name field when prefilledName changes
  useEffect(() => {
    if (prefilledName && isOpen) {
      console.log("Setting prefilled name:", prefilledName)
      setName(prefilledName)
    }
  }, [prefilledName, isOpen])

  // Check for duplicates when name changes
  useEffect(() => {
    if (name.trim()) {
      const trimmedName = name.trim()
      const existingClient = existingClients.find((client) => client.name.toLowerCase() === trimmedName.toLowerCase())

      if (existingClient) {
        setDuplicateWarning(`A client named "${existingClient.name}" already exists in the system.`)
      } else {
        setDuplicateWarning(null)
      }
    } else {
      setDuplicateWarning(null)
    }
  }, [name, existingClients])

  const handleClose = () => {
    setName("")
    setSelectedObjectives([])
    setAccessedFood(false)
    setComments("")
    setHasAlert(false)
    setAlertDetails("")
    setIsSubmitting(false)
    setSubmitError(null)
    setDuplicateWarning(null)
    onClose()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    // Clear previous errors when user starts typing
    setSubmitError(null)
  }

  const handleNameBlur = () => {
    // Auto-capitalize the name when user finishes typing
    if (name.trim()) {
      const capitalizedName = capitalizeFullName(name)
      setName(capitalizedName)
    }
  }

  const handleObjectiveChange = (objective: string, checked: boolean) => {
    if (checked) {
      setSelectedObjectives([...selectedObjectives, objective])
    } else {
      setSelectedObjectives(selectedObjectives.filter((obj) => obj !== objective))
    }
  }

  const handleSubmit = async () => {
    const trimmedName = name.trim()

    if (!trimmedName) {
      setSubmitError("Prospect name is required")
      return
    }

    // Check for duplicates before submitting
    const existingClient = existingClients.find((client) => client.name.toLowerCase() === trimmedName.toLowerCase())

    if (existingClient) {
      setSubmitError(
        `Cannot create prospect: A client named "${existingClient.name}" already exists in the system. Please use a different name or check in the existing client.`,
      )
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    console.log("Starting prospect creation and check-in for:", trimmedName)

    try {
      // Ensure the name is properly capitalized before submitting
      const finalName = capitalizeFullName(trimmedName)

      // First, submit the check-in (all fields are optional except client name)
      const checkInData = {
        clientName: finalName,
        objectives: selectedObjectives, // Can be empty array
        accessedFood: false,
        comments: comments || "", // Can be empty string
        providerName: "Andrea Leflore", // TODO: Get from current user context
      }

      console.log("Sending check-in data:", checkInData)

      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkInData),
      })

      console.log("Check-in response status:", response.status)

      const isJson = response.headers.get("content-type")?.toLowerCase().includes("application/json")

      const data = isJson ? await response.json().catch(() => ({})) : await response.text()

      if (!response.ok) {
        // API returned an error
        setSubmitError((isJson && (data?.error as string)) || (typeof data === "string" && data) || "Check-in failed")
        return
      }

      console.log("Check-in response data:", data)

      if (response.ok) {
        let alertCreated = false

        // If there's an alert, create it and link it to the contact
        if (hasAlert) {
          try {
            const alertData = {
              contactId: data.contact.id,
              clientName: finalName,
              providerName: "Andrea Leflore", // TODO: Get from current user context
              alertType: "behavioral",
              alertDetails: alertDetails.trim() || "Alert flagged - no details provided",
              severity: "medium",
            }

            console.log("Creating alert with data:", alertData)

            const alertResponse = await fetch("/api/alerts", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(alertData),
            })

            const alertResult = await alertResponse.json()
            console.log("Alert response:", alertResult)

            if (alertResponse.ok) {
              alertCreated = true
              console.log("Alert created successfully")
            } else {
              console.error("Failed to create alert:", alertResult)
            }
          } catch (alertError) {
            console.error("Alert creation failed:", alertError)
          }
        }

        // Submit the prospect data to parent
        const prospectData: ProspectData = {
          name: finalName,
          objectives: selectedObjectives,
          accessedFood,
          comments,
          hasAlert,
          alertDetails,
        }

        // Trigger table refresh
        onCheckInSubmit?.(prospectData)
        onProspectCreated?.(prospectData)
        handleClose()
      } else {
        setSubmitError(data.error || "Prospect creation failed")
      }
    } catch (error) {
      console.error("Prospect creation error:", error)
      setSubmitError("Failed to connect to server")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto"
        aria-describedby="dialog-description"
      >
        <DialogHeader>
          <DialogTitle>Create New Prospect</DialogTitle>
          <div id="dialog-description" className="sr-only">
            Create a new prospect and check them in for today
          </div>
        </DialogHeader>

        <div className="space-y-6 pb-4">
          <div className="space-y-2">
            <Label htmlFor="prospect-name">Full Name *</Label>
            <Input
              id="prospect-name"
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              placeholder="Enter prospect's full name"
              className={`w-full ${duplicateWarning ? "border-orange-300 focus:border-orange-500" : ""}`}
            />

            {/* Duplicate Warning */}
            {duplicateWarning && (
              <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 p-3 rounded border border-orange-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{duplicateWarning}</span>
              </div>
            )}
          </div>

          <div>
            <Label className="text-base font-medium">Client objective for visiting today (optional):</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {objectives.map((objective) => (
                <div key={objective.value} className="flex items-center space-x-3 py-2 px-1 min-h-[44px]">
                  <Checkbox
                    id={objective.value}
                    checked={selectedObjectives.includes(objective.value)}
                    onCheckedChange={(checked) => handleObjectiveChange(objective.value, checked as boolean)}
                    className="h-5 w-5"
                  />
                  <Label
                    htmlFor={objective.value}
                    className="text-sm font-normal cursor-pointer flex-1 leading-relaxed"
                  >
                    {objective.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Section */}
          <div
            className={`space-y-3 p-4 rounded-lg border-2 ${hasAlert ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"}`}
          >
            <div className="flex items-center space-x-3 py-2 min-h-[44px]">
              <Checkbox
                id="hasAlert"
                checked={hasAlert}
                onCheckedChange={(checked) => {
                  setHasAlert(checked as boolean)
                  if (!checked) {
                    setAlertDetails("")
                  }
                }}
                className="h-5 w-5"
              />
              <Label htmlFor="hasAlert" className="cursor-pointer flex items-center space-x-2 flex-1">
                <AlertTriangle className={`h-4 w-4 ${hasAlert ? "text-red-600" : "text-gray-400"}`} />
                <span className={hasAlert ? "text-red-800 font-medium" : "text-gray-700"}>
                  Flag as Alert - Client displaying concerning behavior
                </span>
              </Label>
            </div>

            {hasAlert && (
              <div className="space-y-2">
                <Label htmlFor="alertDetails" className="text-sm font-medium text-red-800">
                  Describe the concerning behavior (optional):
                </Label>
                <Textarea
                  id="alertDetails"
                  value={alertDetails}
                  onChange={(e) => setAlertDetails(e.target.value)}
                  placeholder="Please describe what you observed that is concerning (behavior, statements, appearance, etc.)"
                  rows={3}
                  className="border-red-300 focus:border-red-500 focus:ring-red-500"
                />
                <p className="text-xs text-red-600">
                  This alert will be visible to all staff members immediately. Details are optional.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Comments (optional):</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter any additional notes or comments here..."
              rows={4}
            />
          </div>

          {submitError && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded border border-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{submitError}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none bg-transparent min-h-[44px]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 min-h-[44px]"
              disabled={isSubmitting || !!duplicateWarning}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                "Create & Check In"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
