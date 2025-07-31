"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Clock, User } from "lucide-react"

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

export function UpdateServicesDialog({ isOpen, onClose, contactData, onServicesUpdate }: UpdateServicesDialogProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [serviceProviders, setServiceProviders] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Initialize selected services when dialog opens
  useEffect(() => {
    if (isOpen && contactData) {
      const currentlyProvided = contactData.servicesProvided.map((sp) => sp.service)
      setSelectedServices(currentlyProvided)

      // Initialize providers for services that need them
      const initialProviders: { [key: string]: string } = {}
      contactData.servicesProvided.forEach((sp) => {
        if (sp.provider && (sp.service === "Case Management" || sp.service === "Occupational")) {
          initialProviders[sp.service] = sp.provider
        }
      })
      setServiceProviders(initialProviders)
    }
  }, [isOpen, contactData])

  const handleClose = () => {
    setSelectedServices([])
    setServiceProviders({})
    setIsSubmitting(false)
    setSubmitError(null)
    onClose()
  }

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, service])
      // Set default provider for CM and OT services
      if ((service === "Case Management" || service === "Occupational") && !serviceProviders[service]) {
        setServiceProviders((prev) => ({ ...prev, [service]: "Andrea Leflore" }))
      }
    } else {
      setSelectedServices(selectedServices.filter((s) => s !== service))
      // Remove provider when service is unchecked
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
      // Build the updated services provided array
      const updatedServicesProvided = selectedServices.map((service) => {
        const serviceRecord: any = {
          service,
          completedAt: new Date().toISOString(),
        }

        // Add provider for CM and OT services
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
          updatedBy: "Andrea Leflore", // TODO: Get from current user context
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

  if (!contactData) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Update Services - {contactData.client}</DialogTitle>
          <div id="dialog-description" className="sr-only">
            Update services provided for {contactData.client} on {contactData.date}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Info */}
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

          {/* Services Requested (Read-only) */}
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

          {/* Services Provided (Editable) */}
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

                  {/* Provider selection for CM and OT services */}
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

          {/* Warning about CM/OT providers */}
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
  )
}
