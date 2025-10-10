"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

interface ClientDialogProps {
  isOpen: boolean
  onClose: () => void
  clientName: string
  onCheckInSubmit?: (data: CheckInData) => void
}

interface CheckInData {
  clientName: string
  objectives: string[]
  accessedFood: boolean
  comments: string
  hasAlert: boolean
  alertDetails: string
}

type DialogView = "initial" | "checkin"

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

export function QuickCheckinDialog({ isOpen, onClose, clientName, onCheckInSubmit }: ClientDialogProps) {
  const [currentView, setCurrentView] = useState<DialogView>("initial")
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([])
  const [accessedFood, setAccessedFood] = useState(false)
  const [comments, setComments] = useState("")
  const [hasAlert, setHasAlert] = useState(false)
  const [alertDetails, setAlertDetails] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleClose = () => {
    setCurrentView("initial")
    setSelectedObjectives([])
    setAccessedFood(false)
    setComments("")
    setHasAlert(false)
    setAlertDetails("")
    setIsSubmitting(false)
    setSubmitError(null)
    onClose()
  }

  const handleObjectiveChange = (objective: string, checked: boolean) => {
    if (checked) {
      setSelectedObjectives([...selectedObjectives, objective])
    } else {
      setSelectedObjectives(selectedObjectives.filter((obj) => obj !== objective))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    console.log("Starting check-in submission for:", clientName)

    try {
      // First, submit the check-in (all fields are optional except client name)
      const checkInData = {
        clientName,
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
              clientName,
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

        // Submit the check-in data to parent
        const checkInResult: CheckInData = {
          clientName,
          objectives: selectedObjectives,
          accessedFood,
          comments,
          hasAlert,
          alertDetails,
        }

        console.log("[v0] QuickCheckinDialog: Check-in successful, calling onCheckInSubmit callback")
        onCheckInSubmit?.(checkInResult)
        console.log("[v0] QuickCheckinDialog: onCheckInSubmit callback completed, closing dialog")
        handleClose()
      } else {
        setSubmitError(data.error || "Check-in failed")
      }
    } catch (error) {
      console.error("Check-in submission error:", error)
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
          <DialogTitle>{clientName}</DialogTitle>
          <div id="dialog-description" className="sr-only">
            Client interaction dialog for {clientName}
          </div>
        </DialogHeader>

        {currentView === "initial" && (
          <div className="space-y-6">
            <p className="text-gray-600">What would you like to do?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setCurrentView("checkin")} className="flex-1">
                Quick Check-In
              </Button>
              <Button variant="outline" onClick={handleClose} className="flex-1 sm:flex-none bg-transparent">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {currentView === "checkin" && (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Client objective for visiting today (optional):</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {objectives.map((objective) => (
                  <div key={objective.value} className="flex items-center space-x-3 py-2 px-1 min-h-[44px]">
                    <Checkbox
                      id={objective.value}
                      checked={selectedObjectives.includes(objective.value)}
                      onCheckedChange={(checked) => handleObjectiveChange(objective.value, checked as boolean)}
                    />
                    <Label htmlFor={objective.value} className="text-sm font-normal cursor-pointer">
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasAlert"
                  checked={hasAlert}
                  onCheckedChange={(checked) => {
                    setHasAlert(checked as boolean)
                    if (!checked) {
                      setAlertDetails("")
                    }
                  }}
                />
                <Label htmlFor="hasAlert" className="cursor-pointer flex items-center space-x-2">
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
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded">
                <div className="h-5 w-5 rounded-full bg-red-600 flex items-center justify-center">
                  <div className="h-1 w-3 bg-white rounded" />
                </div>
                <span className="text-sm">{submitError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentView("initial")}
                className="flex-1 sm:flex-none bg-transparent"
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  "Submit Check-In"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
