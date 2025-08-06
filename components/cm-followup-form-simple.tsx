"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface CMFollowupFormSimpleProps {
  clientName: string
  onClose: () => void
  onSubmit: () => void
}

const CASE_MANAGERS = [
  "Andrea Leflore",
  "Jara, Rolando",
  "Burks, Ashley",
  "White, Ashley",
  "Perry, Alexandra",
  "Brown, Tarik",
  "Taylor, Redrick",
  "Moore, Chezeray",
  "Morris, Dave",
]

const MEETING_TYPES = ["In-person", "Phone Call", "Video Call", "Home Visit"]
const STATUS_OPTIONS = ["Stable", "Making Progress", "Struggling", "Crisis"]

export function CMFollowupFormSimple({ clientName, onClose, onSubmit }: CMFollowupFormSimpleProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    followup_date: new Date().toISOString().split("T")[0],
    cm_provider_name: "",
    meeting_type: "",
    current_status: "",
    contact_summary: "",
    client_tasks: "",
    cm_tasks: "",
    // Simple goals as text instead of complex structure
    goals_discussed: "",
    barriers: "",
    next_meeting_date: "",
  })

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (status: "draft" | "submitted") => {
    setIsLoading(true)
    try {
      const submitData = {
        client_name: clientName,
        ...formData,
        status,
      }

      const response = await fetch("/api/cm-checkings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        onSubmit()
        onClose()
      } else {
        throw new Error("Failed to submit form")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Error submitting form. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isValid =
    formData.followup_date &&
    formData.cm_provider_name &&
    formData.meeting_type &&
    formData.current_status &&
    formData.contact_summary &&
    formData.client_tasks &&
    formData.cm_tasks

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">CM Followup: {clientName}</h1>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="followup_date">Date *</Label>
                    <Input
                      id="followup_date"
                      type="date"
                      value={formData.followup_date}
                      onChange={(e) => updateFormData("followup_date", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cm_provider">Case Manager *</Label>
                    <select
                      id="cm_provider"
                      value={formData.cm_provider_name}
                      onChange={(e) => updateFormData("cm_provider_name", e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select case manager</option>
                      {CASE_MANAGERS.map((cm) => (
                        <option key={cm} value={cm}>
                          {cm}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="meeting_type">Meeting Type *</Label>
                    <select
                      id="meeting_type"
                      value={formData.meeting_type}
                      onChange={(e) => updateFormData("meeting_type", e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select meeting type</option>
                      {MEETING_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="current_status">Client Status *</Label>
                    <select
                      id="current_status"
                      value={formData.current_status}
                      onChange={(e) => updateFormData("current_status", e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select status</option>
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="contact_summary">What was discussed? *</Label>
                  <Textarea
                    id="contact_summary"
                    rows={4}
                    value={formData.contact_summary}
                    onChange={(e) => updateFormData("contact_summary", e.target.value)}
                    placeholder="Summarize what was discussed during this contact..."
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Goals & Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Goals & Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="goals_discussed">Goals Discussed</Label>
                  <Textarea
                    id="goals_discussed"
                    rows={3}
                    value={formData.goals_discussed}
                    onChange={(e) => updateFormData("goals_discussed", e.target.value)}
                    placeholder="What goals were discussed and what progress was made?"
                  />
                </div>
                <div>
                  <Label htmlFor="barriers">Current Barriers</Label>
                  <Textarea
                    id="barriers"
                    rows={2}
                    value={formData.barriers}
                    onChange={(e) => updateFormData("barriers", e.target.value)}
                    placeholder="Any barriers impacting progress?"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="client_tasks">Client Tasks *</Label>
                  <Textarea
                    id="client_tasks"
                    rows={3}
                    value={formData.client_tasks}
                    onChange={(e) => updateFormData("client_tasks", e.target.value)}
                    placeholder="What will the client do before next meeting?"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cm_tasks">Case Manager Tasks *</Label>
                  <Textarea
                    id="cm_tasks"
                    rows={3}
                    value={formData.cm_tasks}
                    onChange={(e) => updateFormData("cm_tasks", e.target.value)}
                    placeholder="What will you do to support the client?"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="next_meeting_date">Next Meeting Date</Label>
                  <Input
                    id="next_meeting_date"
                    type="date"
                    value={formData.next_meeting_date}
                    onChange={(e) => updateFormData("next_meeting_date", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={isLoading || !isValid}>
              Save Draft
            </Button>
            <Button onClick={() => handleSubmit("submitted")} disabled={isLoading || !isValid}>
              Submit
            </Button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  )
}
