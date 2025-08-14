"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Clock, User, Plus, Edit } from "lucide-react"
import { CMCheckinModal } from "./cm-checkin-modal"

interface UpdateServicesDialogProps {
  isOpen: boolean
  onClose: () => void
  contactData: {
    id: number
    client: string
    date: string
    servicesRequested: string[]
    servicesProvided: Array<{
      service: string
      provider?: string
      completedAt: string
    }>
  } | null
  onServicesUpdate?: () => void
  isFromCMTab?: boolean
}

const services = [
  { value: "Case Management", label: "Case Management (CM)", needsProvider: true },
  { value: "Employment", label: "Employment Services", needsProvider: false },
  { value: "Food", label: "Food", needsProvider: false },
  { value: "Healthcare", label: "Healthcare Support", needsProvider: false },
  { value: "Housing", label: "Housing Support", needsProvider: false },
  { value: "ID", label: "ID/Documentation", needsProvider: false },
  { value: "Laundry", label: "Laundry", needsProvider: false },
  { value: "Occupational", label: "Occupational Therapy (OT)", needsProvider: true },
  { value: "Recreation", label: "Recreation", needsProvider: false },
  { value: "Other", label: "Other", needsProvider: false },
]

const providers = [
  "Elena Ahmed",
  "Sofia Cohen",
  "Jamal Silva",
  "Mohammed Ahmed",
  "Sonia Singh",
  "Leila Garcia",
  "Andrea Leflore",
]

export function UpdateServicesDialog({
  isOpen,
  onClose,
  contactData,
  onServicesUpdate,
  isFromCMTab = false,
}: UpdateServicesDialogProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [serviceProviders, setServiceProviders] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isCMCheckinModalOpen, setIsCMCheckinModalOpen] = useState(false)
  const [hasCheckinToday, setHasCheckinToday] = useState(false)
  const [checkingCheckin, setCheckingCheckin] = useState(false)

  useEffect(() => {
    if (isOpen && contactData) {
      const currentlyProvided = contactData.servicesProvided.map((sp) => sp.service)
      setSelectedServices(currentlyProvided)

      const initialProviders: { [key: string]: string } = {}
      contactData.servicesProvided.forEach((sp) => {
        if (sp.provider && (sp.service === "Case Management" || sp.service === "Occupational")) {
          initialProviders[sp.service] = sp.provider
        }
      })
      setServiceProviders(initialProviders)

      if (isFromCMTab) {
        checkForTodaysCheckin()
      }
    }
  }, [isOpen, contactData, isFromCMTab])

  const checkForTodaysCheckin = async () => {
    if (!contactData) return

    setCheckingCheckin(true)
    try {
      const response = await fetch(`/api/checkins/by-contact/${contactData.id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const today = new Date().toDateString()
          const todaysCheckin = result.data.find((checkin: any) => {
            const checkinDate = new Date(checkin.created_at).toDateString()
            return checkinDate === today
          })
          setHasCheckinToday(!!todaysCheckin)
        }
      }
    } catch (error) {
      console.error("Failed to check for today's check-in:", error)
    } finally {
      setCheckingCheckin(false)
    }
  }

  const handleClose = () => {
    setSelectedServices([])
    setServiceProviders({})
    setIsSubmitting(false)
    setSubmitError(null)
    setIsCMCheckinModalOpen(false)
    setHasCheckinToday(false)
    setCheckingCheckin(false)
    onClose()
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, service])
      if ((service === "Case Management" || service === "Occupational") && !serviceProviders[service]) {
        setServiceProviders((prev) => ({ ...prev, [service]: "Andrea Leflore" }))
      }
    } else {
      setSelectedServices(selectedServices.filter((s) => s !== service))
      if (serviceProviders[service]) {
        const newProviders = { ...serviceProviders }
        delete newProviders[service]
        setServiceProviders(newProviders)
      }
    }
  }

  const handleProviderChange = (service: string, provider: string) => {
    setServiceProviders((prev) => ({ ...prev, [service]: provider }))
  }

  const handleSubmit = async () => {
    if (!contactData) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const updatedServicesProvided = selectedServices.map((service) => {
        const serviceRecord: any = {
          service,
          completedAt: new Date().toISOString(),
        }

        if ((service === "Case Management" || service === "Occupational") && serviceProviders[service]) {
          serviceRecord.provider = serviceProviders[service]
        }

        return serviceRecord
      })

      const response = await fetch("/api/update-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contactId: contactData.id,
          servicesProvided: updatedServicesProvided,
          updatedBy: "Andrea Leflore",
        }),
      })

      const result = await response.json()

      if (response.ok) {
        console.log("Services updated successfully:", result)
        onServicesUpdate?.()
        handleClose()
      } else {
        setSubmitError(result.error || "Failed to update services")
      }
    } catch (error) {
      console.error("Services update error:", error)
      setSubmitError("Failed to connect to server")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCMCheckinClick = () => {
    setIsCMCheckinModalOpen(true)
  }

  const handleCMCheckinClose = () => {
    setIsCMCheckinModalOpen(false)
    if (isFromCMTab) {
      checkForTodaysCheckin()
    }
  }

  const handleCMCheckinSubmit = () => {
    // Auto-check Case Management service if not already checked
    if (!selectedServices.includes("Case Management")) {
      setSelectedServices((prev) => [...prev, "Case Management"])
      // Set provider to the logged-in user (Andrea Leflore)
      setServiceProviders((prev) => ({ ...prev, "Case Management": "Andrea Leflore" }))
    }

    setIsCMCheckinModalOpen(false)
    if (isFromCMTab) {
      checkForTodaysCheckin()
    }
  }

  if (!contactData) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Update Services - {contactData.client}</span>
              {isFromCMTab && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCMCheckinClick}
                  disabled={checkingCheckin}
                  className="ml-4 bg-transparent"
                >
                  {checkingCheckin ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent mr-2" />
                  ) : hasCheckinToday ? (
                    <Edit className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {checkingCheckin ? "Checking..." : hasCheckinToday ? "Edit CM Check-In" : "+ CM Check-In"}
                </Button>
              )}
            </DialogTitle>
            <div id="dialog-description" className="sr-only">
              Update services provided for {contactData.client} on {contactData.date}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-800">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Check-in: {contactData.date}</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-700 mt-1">
                <User className="h-4 w-4" />
                <span>Client: {contactData.client}</span>
              </div>
            </div>

            {contactData.servicesRequested.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-medium">Services Originally Requested:</Label>
                <div className="bg-gray-50 p-3 rounded border">
                  <div className="flex flex-wrap gap-2">
                    {contactData.servicesRequested.map((service) => (
                      <span
                        key={service}
                        className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-base font-medium">Services Provided Today:</Label>
              <div className="grid grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.value} className="space-y-2 break-inside-avoid">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={service.value}
                        checked={selectedServices.includes(service.value)}
                        onCheckedChange={(checked) => handleServiceChange(service.value, checked as boolean)}
                      />
                      <Label htmlFor={service.value} className="text-sm font-normal cursor-pointer flex-1">
                        {service.label}
                      </Label>
                    </div>

                    {service.needsProvider && selectedServices.includes(service.value) && (
                      <div className="ml-6 space-y-2">
                        <Label className="text-xs text-gray-600">Provider:</Label>
                        <select
                          value={serviceProviders[service.value] || ""}
                          onChange={(e) => handleProviderChange(service.value, e.target.value)}
                          className="w-full max-w-xs px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select provider...</option>
                          {providers.map((provider) => (
                            <option key={provider} value={provider}>
                              {provider}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Provider Required</p>
                  <p>Case Management and Occupational Therapy services require a provider to be selected.</p>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{submitError}</span>
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
              <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  "Update Services"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isFromCMTab && (
        <CMCheckinModal
          isOpen={isCMCheckinModalOpen}
          onClose={handleCMCheckinClose}
          onSubmit={handleCMCheckinSubmit}
          clientName={contactData?.client || ""}
          contactId={contactData?.id || 0}
        />
      )}
    </>
  )
}
