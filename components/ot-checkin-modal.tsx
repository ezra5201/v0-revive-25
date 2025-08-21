"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ArrowLeft, Target, Calendar, AlertCircle, CheckCircle, ExternalLink } from "lucide-react"

interface OTGoal {
  id: number
  client_name: string
  goal_text: string
  status: string
  target_date: string | null
  priority: number
  created_at: string
  updated_at: string
  progress_note?: string | null
}

interface OTCheckinModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: () => void
  clientName: string
  contactId: number
}

export function OTCheckinModal({ isOpen, onClose, onSubmit, clientName, contactId }: OTCheckinModalProps) {
  const [currentView, setCurrentView] = useState<"checkin" | "new-goal" | "edit-goal">("checkin")
  const [notes, setNotes] = useState("")
  const [checkinType, setCheckinType] = useState("Evaluation")
  const [serviceType, setServiceType] = useState("Direct")
  const [goals, setGoals] = useState<OTGoal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [checkinId, setCheckinId] = useState<number | null>(null)
  const [creatingCheckin, setCreatingCheckin] = useState(false)
  const [savingCheckin, setSavingCheckin] = useState(false)
  const [clientUuid, setClientUuid] = useState<string | null>(null)
  const providerName = "Andrea Leflore" // Hardcoded as requested

  // New goal form state
  const [goalText, setGoalText] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [priority, setPriority] = useState(1)
  const [status, setStatus] = useState("Not Started")
  const [savingGoal, setSavingGoal] = useState(false)

  // Edit goal form state
  const [editingGoal, setEditingGoal] = useState<OTGoal | null>(null)
  const [editGoalText, setEditGoalText] = useState("")
  const [editTargetDate, setEditTargetDate] = useState("")
  const [editPriority, setEditPriority] = useState(1)
  const [editStatus, setEditStatus] = useState("Not Started")
  const [progressNotes, setProgressNotes] = useState("")
  const [savingGoalUpdate, setSavingGoalUpdate] = useState(false)

  useEffect(() => {
    if (isOpen && clientName && !checkinId) {
      fetchClientDataAndCreateCheckin()
    }
  }, [isOpen, clientName])

  // Fetch goals when modal opens
  useEffect(() => {
    if (isOpen && clientName) {
      fetchGoals()
    }
  }, [isOpen, clientName])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentView("checkin")
      setNotes("")
      setCheckinType("Evaluation")
      setServiceType("Direct")
      setGoalText("")
      setTargetDate("")
      setPriority(1)
      setStatus("Not Started")
      setEditingGoal(null)
      setEditGoalText("")
      setEditTargetDate("")
      setEditPriority(1)
      setEditStatus("Not Started")
      setProgressNotes("")
      setError(null)
      setSuccessMessage(null)
      setCheckinId(null)
      setClientUuid(null)
    }
  }, [isOpen])

  const fetchClientDataAndCreateCheckin = async () => {
    setCreatingCheckin(true)
    setError(null)

    try {
      // First, fetch client data to get the UUID
      console.log("DEBUG: Fetching client data for:", clientName)
      const clientResponse = await fetch(`/api/clients/${encodeURIComponent(clientName)}`)
      console.log("DEBUG: Client API response status:", clientResponse.status)

      if (!clientResponse.ok) {
        const errorText = await clientResponse.text()
        console.log("DEBUG: Client API error response:", errorText)
        throw new Error(`Failed to fetch client data: ${clientResponse.status} - ${errorText}`)
      }

      const clientData = await clientResponse.json()
      console.log("DEBUG: Client data received:", clientData)

      if (!clientData.client_uuid) {
        throw new Error("Client UUID not found")
      }

      setClientUuid(clientData.client_uuid)

      console.log("DEBUG: Creating OT check-in with data:", {
        contact_id: contactId,
        client_name: clientName,
        client_uuid: clientData.client_uuid,
        provider_name: providerName,
        notes: "",
        checkin_type: checkinType,
        service_type: serviceType,
      })

      const response = await fetch("/api/ot-checkins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact_id: contactId,
          client_name: clientName,
          client_uuid: clientData.client_uuid,
          provider_name: providerName,
          notes: "",
          checkin_type: checkinType,
          service_type: serviceType,
        }),
      })

      console.log("DEBUG: OT check-in creation response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("DEBUG: OT check-in creation error response:", errorText)
        throw new Error(`Failed to create OT check-in: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("DEBUG: OT check-in creation result:", result)

      if (result.success) {
        setCheckinId(result.data.id)
      } else {
        throw new Error(result.error?.message || "Failed to create OT check-in")
      }
    } catch (err) {
      console.error("DEBUG: Error in fetchClientDataAndCreateCheckin:", err)
      setError(err instanceof Error ? err.message : "Failed to create OT check-in")
    } finally {
      setCreatingCheckin(false)
    }
  }

  const fetchGoals = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("DEBUG: Fetching OT goals for client:", clientName)
      const response = await fetch(`/api/ot-goals/by-client/${encodeURIComponent(clientName)}`)
      console.log("DEBUG: OT goals fetch response status:", response.status)

      const contentType = response.headers.get("content-type")
      const isJson = contentType && contentType.includes("application/json")

      if (!response.ok) {
        const errorText = await response.text()
        console.log("DEBUG: OT goals fetch error response:", errorText)

        // If we get HTML instead of JSON (like a 404 page), treat as no goals
        if (!isJson && errorText.includes("<!DOCTYPE")) {
          console.log("DEBUG: Received HTML response, treating as no OT goals found")
          setGoals([])
          return
        }

        throw new Error(`Failed to fetch OT goals: ${response.status} - ${errorText}`)
      }

      if (!isJson) {
        console.log("DEBUG: Response is not JSON, treating as no OT goals found")
        setGoals([])
        return
      }

      const result = await response.json()
      console.log("DEBUG: OT goals fetch result:", result)

      if (result.success) {
        setGoals(result.data || [])
      } else {
        throw new Error(result.error?.message || "Failed to fetch OT goals")
      }
    } catch (err) {
      console.error("DEBUG: Error in fetchGoals:", err)

      if (err instanceof Error && err.message.includes("Unexpected token")) {
        console.log("DEBUG: JSON parsing error, treating as no OT goals found")
        setGoals([])
        setError(null) // Don't show error for this case
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch OT goals")
        setGoals([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGoal = async () => {
    if (!goalText.trim()) {
      setError("Goal text is required")
      return
    }

    if (!clientUuid) {
      setError("Client UUID not found. Please try again.")
      return
    }

    setSavingGoal(true)
    setError(null)

    try {
      const goalData = {
        client_name: clientName,
        client_uuid: clientUuid,
        goal_text: goalText.trim(),
        target_date: targetDate || null,
        priority: priority,
        status: status,
        checkin_id: checkinId,
      }

      console.log("DEBUG: Creating OT goal with data:", goalData)

      const response = await fetch("/api/ot-goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalData),
      })

      console.log("DEBUG: OT goal creation response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("DEBUG: OT goal creation error response:", errorText)
        throw new Error(`Failed to save OT goal: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("DEBUG: OT goal creation result:", result)

      if (result.success) {
        // Add new goal to the list
        setGoals((prev) => [result.data, ...prev])
        // Reset form and return to main view
        setGoalText("")
        setTargetDate("")
        setPriority(1)
        setStatus("Not Started")
        setCurrentView("checkin")
        setSuccessMessage("OT goal created successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        throw new Error(result.error?.message || "Failed to save OT goal")
      }
    } catch (err) {
      console.error("DEBUG: Error in handleSaveGoal:", err)
      setError(err instanceof Error ? err.message : "Failed to save OT goal")
    } finally {
      setSavingGoal(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!checkinId) {
      setError("No OT check-in record found")
      return
    }

    setSavingCheckin(true)
    setError(null)

    try {
      const updateData = {
        notes: notes,
        checkin_type: checkinType,
        service_type: serviceType,
        status: "Draft",
      }

      console.log("DEBUG: Saving OT draft with data:", updateData)
      console.log("DEBUG: OT Check-in ID:", checkinId)

      const response = await fetch(`/api/ot-checkins/${checkinId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      console.log("DEBUG: Save OT draft response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("DEBUG: Save OT draft error response:", errorText)
        throw new Error(`Failed to save OT draft: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("DEBUG: Save OT draft result:", result)

      if (result.success) {
        setSuccessMessage("OT draft saved successfully!")
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        throw new Error(result.error?.message || "Failed to save OT draft")
      }
    } catch (err) {
      console.error("DEBUG: Error in handleSaveDraft:", err)
      setError(err instanceof Error ? err.message : "Failed to save OT draft")
    } finally {
      setSavingCheckin(false)
    }
  }

  const handleCompleteCheckin = async () => {
    if (!checkinId) {
      setError("No OT check-in record found")
      return
    }

    setSavingCheckin(true)
    setError(null)

    try {
      const updateData = {
        notes: notes,
        checkin_type: checkinType,
        service_type: serviceType,
        status: "Completed",
      }

      console.log("DEBUG: Completing OT check-in with data:", updateData)
      console.log("DEBUG: OT Check-in ID:", checkinId)

      const response = await fetch(`/api/ot-checkins/${checkinId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      console.log("DEBUG: Complete OT check-in response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("DEBUG: Complete OT check-in error response:", errorText)
        throw new Error(`Failed to complete OT check-in: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("DEBUG: Complete OT check-in result:", result)

      if (result.success) {
        setSuccessMessage("OT check-in completed successfully!")
        setTimeout(() => {
          setSuccessMessage(null)
          if (onSubmit) {
            onSubmit()
          } else {
            onClose()
          }
        }, 1500)
      } else {
        throw new Error(result.error?.message || "Failed to complete OT check-in")
      }
    } catch (err) {
      console.error("DEBUG: Error in handleCompleteCheckin:", err)
      setError(err instanceof Error ? err.message : "Failed to complete OT check-in")
    } finally {
      setSavingCheckin(false)
    }
  }

  const handleEditGoal = (goal: OTGoal) => {
    setEditingGoal(goal)
    setEditGoalText(goal.goal_text)
    setEditTargetDate(goal.target_date || "")
    setEditPriority(goal.priority)
    setEditStatus(goal.status)
    setProgressNotes(goal.progress_note || "")
    setCurrentView("edit-goal")
  }

  const handleSaveGoalUpdate = async () => {
    if (!editingGoal) {
      setError("No goal selected for editing")
      return
    }

    if (!editGoalText.trim()) {
      setError("Goal text is required")
      return
    }

    if (!checkinId) {
      setError("No check-in record found")
      return
    }

    setSavingGoalUpdate(true)
    setError(null)

    try {
      const goalUpdateData = {
        goal_text: editGoalText.trim(),
        target_date: editTargetDate || null,
        priority: editPriority,
        status: editStatus,
        progress_note: progressNotes.trim() || null,
      }

      console.log("DEBUG: editingGoal:", editingGoal)
      console.log("DEBUG: editingGoal.id:", editingGoal.id)
      console.log("DEBUG: Updating OT goal with data:", goalUpdateData)

      const goalResponse = await fetch(`/api/ot-goals/${editingGoal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goalUpdateData),
      })

      if (!goalResponse.ok) {
        const errorText = await goalResponse.text()
        console.log("DEBUG: Error in handleSaveGoalUpdate:", errorText)
        throw new Error(`Failed to update goal: ${goalResponse.status} - ${errorText}`)
      }

      const goalResult = await goalResponse.json()
      console.log("DEBUG: Goal update result:", goalResult)

      if (!goalResult.success) {
        throw new Error(goalResult.error?.message || "Failed to update goal")
      }

      setGoals((prev) => prev.map((goal) => (goal.id === editingGoal.id ? { ...goal, ...goalResult.data } : goal)))

      // Reset form and return to main view
      setEditingGoal(null)
      setEditGoalText("")
      setEditTargetDate("")
      setEditPriority(1)
      setEditStatus("Not Started")
      setProgressNotes("")
      setCurrentView("checkin")
      setSuccessMessage("Goal updated successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error("DEBUG: Error in handleSaveGoalUpdate:", err)
      setError(err instanceof Error ? err.message : "Failed to update goal")
    } finally {
      setSavingGoalUpdate(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Deferred":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {currentView === "checkin"
              ? "New OT Check-In"
              : currentView === "new-goal"
                ? "New OT Goal"
                : "Edit OT Goal"}
          </DialogTitle>
        </DialogHeader>

        {creatingCheckin && (
          <div className="text-center py-4">
            <div className="text-sm text-gray-500">Setting up OT check-in...</div>
          </div>
        )}

        {currentView === "checkin" && !creatingCheckin ? (
          <div className="space-y-6">
            {/* Client Name Heading */}
            <div>
              <h2 className="text-lg font-medium text-gray-900">{clientName}</h2>
            </div>

            {/* Notes Field */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Check-In Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your OT check-in notes..."
                className="min-h-[100px] resize-none"
                style={{
                  height: "auto",
                  minHeight: "100px",
                  maxHeight: "200px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = "auto"
                  target.style.height = Math.min(target.scrollHeight, 200) + "px"
                }}
              />
            </div>

            {/* Check-In Type and Service Type dropdowns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkin-type" className="text-sm font-medium">
                  Check-In Type
                </Label>
                <select
                  id="checkin-type"
                  value={checkinType}
                  onChange={(e) => setCheckinType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Evaluation">Evaluation</option>
                  <option value="Follow-UP">Follow-UP</option>
                  <option value="Reassessment">Reassessment</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-type" className="text-sm font-medium">
                  Service Type
                </Label>
                <select
                  id="service-type"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Direct">Direct</option>
                </select>
              </div>
            </div>

            {/* Goals Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">OT Goals</h3>
                <Button variant="outline" size="sm" onClick={() => setCurrentView("new-goal")} className="text-sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New OT Goal
                </Button>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">{successMessage}</span>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Goals List */}
              {loading ? (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-500">Loading OT goals...</div>
                </div>
              ) : goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <Card
                      key={goal.id}
                      className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleEditGoal(goal)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 mb-2">{goal.goal_text}</p>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Target className="h-3 w-3" />
                                <span>Priority {goal.priority}</span>
                              </div>
                              {goal.target_date && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(goal.target_date)}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">Click to edit and add progress notes</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation() // Prevent triggering the card click
                                const url = `/ot?tab=client&name=${encodeURIComponent(clientName)}&section=ot-goals`
                                window.open(url, "_blank")
                              }}
                              title="View in OT Goals tab"
                            >
                              <ExternalLink className="h-3 w-3 text-gray-500" />
                            </Button>
                            <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Client has no OT goals</p>
                  <p className="text-xs text-gray-400 mt-1">Click "New OT Goal" to get started.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} disabled={savingCheckin}>
                Cancel
              </Button>
              <Button variant="outline" onClick={handleSaveDraft} disabled={savingCheckin || !checkinId}>
                {savingCheckin ? "Saving..." : "Save Draft"}
              </Button>
              <Button onClick={handleCompleteCheckin} disabled={savingCheckin || !checkinId}>
                {savingCheckin ? "Completing..." : "Complete Check-In"}
              </Button>
            </div>
          </div>
        ) : currentView === "new-goal" && !creatingCheckin ? (
          /* New Goal Form */
          <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("checkin")} className="text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Check-In
            </Button>

            {/* Goal Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal-text" className="text-sm font-medium">
                  OT Goal Text *
                </Label>
                <Textarea
                  id="goal-text"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="Enter the OT goal description..."
                  className="min-h-[80px]"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">{goalText.length}/500 characters</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-date" className="text-sm font-medium">
                    Target Date
                  </Label>
                  <Input
                    id="target-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">
                    Priority
                  </Label>
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 - Low</option>
                    <option value={2}>2 - Medium Low</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - Medium High</option>
                    <option value={5}>5 - High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Deferred">Deferred</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setCurrentView("checkin")} disabled={savingGoal}>
                Cancel
              </Button>
              <Button onClick={handleSaveGoal} disabled={savingGoal || !goalText.trim()}>
                {savingGoal ? "Saving..." : "Save OT Goal"}
              </Button>
            </div>
          </div>
        ) : currentView === "edit-goal" && !creatingCheckin ? (
          /* Edit Goal Form with Progress Notes */
          <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" size="sm" onClick={() => setCurrentView("checkin")} className="text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Check-In
            </Button>

            {/* Edit Goal Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-goal-text" className="text-sm font-medium">
                  OT Goal Text *
                </Label>
                <Textarea
                  id="edit-goal-text"
                  value={editGoalText}
                  onChange={(e) => setEditGoalText(e.target.value)}
                  placeholder="Enter the OT goal description..."
                  className="min-h-[80px]"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">{editGoalText.length}/500 characters</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-target-date" className="text-sm font-medium">
                    Target Date
                  </Label>
                  <Input
                    id="edit-target-date"
                    type="date"
                    value={editTargetDate}
                    onChange={(e) => setEditTargetDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-priority" className="text-sm font-medium">
                    Priority
                  </Label>
                  <select
                    id="edit-priority"
                    value={editPriority}
                    onChange={(e) => setEditPriority(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 - Low</option>
                    <option value={2}>2 - Medium Low</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - Medium High</option>
                    <option value={5}>5 - High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-medium">
                    Status
                  </Label>
                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Deferred">Deferred</option>
                  </select>
                </div>
              </div>

              {/* Progress Notes Section */}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="progress-notes" className="text-sm font-medium">
                  Progress Notes for This Check-In
                </Label>
                <Textarea
                  id="progress-notes"
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Enter progress notes for this specific check-in session..."
                  className="min-h-[100px]"
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 text-right">{progressNotes.length}/1000 characters</div>
                <div className="text-xs text-gray-600">
                  These notes will be associated with this check-in session and track progress on this goal.
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setCurrentView("checkin")} disabled={savingGoalUpdate}>
                Cancel
              </Button>
              <Button onClick={handleSaveGoalUpdate} disabled={savingGoalUpdate || !editGoalText.trim()}>
                {savingGoalUpdate ? "Saving..." : "Update Goal"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
