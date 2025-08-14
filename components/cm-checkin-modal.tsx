"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, ArrowLeft, Target, Calendar, AlertCircle } from "lucide-react"

interface Goal {
  id: number
  client_name: string
  goal_text: string
  status: string
  target_date: string | null
  priority: number
  created_at: string
  updated_at: string
}

interface CMCheckinModalProps {
  isOpen: boolean
  onClose: () => void
  clientName: string
  contactId: number
}

export function CMCheckinModal({ isOpen, onClose, clientName, contactId }: CMCheckinModalProps) {
  const [currentView, setCurrentView] = useState<"checkin" | "new-goal">("checkin")
  const [notes, setNotes] = useState("")
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // New goal form state
  const [goalText, setGoalText] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [priority, setPriority] = useState(1)
  const [savingGoal, setSavingGoal] = useState(false)

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
      setGoalText("")
      setTargetDate("")
      setPriority(1)
      setError(null)
    }
  }, [isOpen])

  const fetchGoals = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/goals/${encodeURIComponent(clientName)}`)
      if (!response.ok) {
        throw new Error("Failed to fetch goals")
      }
      const result = await response.json()
      if (result.success) {
        setGoals(result.data || [])
      } else {
        throw new Error(result.error?.message || "Failed to fetch goals")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch goals")
      setGoals([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGoal = async () => {
    if (!goalText.trim()) {
      setError("Goal text is required")
      return
    }

    setSavingGoal(true)
    setError(null)

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_name: clientName,
          goal_text: goalText.trim(),
          target_date: targetDate || null,
          priority: priority,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save goal")
      }

      const result = await response.json()
      if (result.success) {
        // Add new goal to the list
        setGoals((prev) => [result.data, ...prev])
        // Reset form and return to main view
        setGoalText("")
        setTargetDate("")
        setPriority(1)
        setCurrentView("checkin")
      } else {
        throw new Error(result.error?.message || "Failed to save goal")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save goal")
    } finally {
      setSavingGoal(false)
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
            {currentView === "checkin" ? "New CM Check-In" : "New Goal"}
          </DialogTitle>
        </DialogHeader>

        {currentView === "checkin" ? (
          <div className="space-y-6">
            {/* Client Name Heading */}
            <div>
              <h2 className="text-lg font-medium text-gray-900">{clientName}</h2>
            </div>

            {/* Notes Field */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter your check-in notes..."
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

            {/* Goals Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">Goals</h3>
                <Button variant="outline" size="sm" onClick={() => setCurrentView("new-goal")} className="text-sm">
                  <Plus className="h-4 w-4 mr-1" />
                  New Goal
                </Button>
              </div>

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
                  <div className="text-sm text-gray-500">Loading goals...</div>
                </div>
              ) : goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <Card key={goal.id} className="shadow-sm">
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
                          </div>
                          <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No goals set for this client yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Click "New Goal" to get started.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onClose}>Save Check-In</Button>
            </div>
          </div>
        ) : (
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
                  Goal Text *
                </Label>
                <Textarea
                  id="goal-text"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="Enter the goal description..."
                  className="min-h-[80px]"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">{goalText.length}/500 characters</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                {savingGoal ? "Saving..." : "Save Goal"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
