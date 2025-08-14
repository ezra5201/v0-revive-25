"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Calendar, CheckCircle, AlertCircle } from "lucide-react"

interface Goal {
  id: number
  client_name: string
  goal_text: string
  status: "Not Started" | "In Progress" | "Completed" | "Deferred"
  priority: number
  target_date: string | null
  created_at: string
  updated_at: string
}

interface GoalWidgetProps {
  clientName: string
}

export function GoalWidget({ clientName }: GoalWidgetProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [updatingGoals, setUpdatingGoals] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/goals/by-client/${encodeURIComponent(clientName)}`)

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          // API returned HTML (likely 404) - treat as no goals
          setGoals([])
          return
        }

        if (!response.ok) {
          throw new Error("Failed to fetch goals")
        }

        const data = await response.json()
        setGoals(data.data || [])
      } catch (err) {
        console.error("Error fetching goals:", err)
        if (err instanceof Error && err.message.includes("Unexpected token")) {
          setGoals([])
        } else {
          setError(err instanceof Error ? err.message : "An error occurred")
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (clientName) {
      fetchGoals()
    }
  }, [clientName])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const updateGoalStatus = async (goalId: number, newStatus: Goal["status"]) => {
    // Optimistic update
    const previousGoals = [...goals]
    setGoals(
      goals.map((goal) =>
        goal.id === goalId ? { ...goal, status: newStatus, updated_at: new Date().toISOString() } : goal,
      ),
    )

    // Track updating state
    setUpdatingGoals((prev) => new Set(prev).add(goalId))

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update goal status")
      }

      const data = await response.json()
      if (data.success) {
        setNotification({ type: "success", message: "Goal status updated successfully" })
      } else {
        throw new Error(data.error?.message || "Failed to update goal status")
      }
    } catch (err) {
      // Revert optimistic update on error
      setGoals(previousGoals)
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update goal status",
      })
    } finally {
      setUpdatingGoals((prev) => {
        const newSet = new Set(prev)
        newSet.delete(goalId)
        return newSet
      })
    }
  }

  const getStatusColor = (status: Goal["status"]) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-100 text-gray-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Deferred":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <div className="h-6 w-6 text-red-600">⚠</div>
            </div>
            <p className="text-red-600 font-medium">Error loading goals</p>
            <p className="text-gray-600 text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Goals</span>
          {goals.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {goals.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notification && (
          <div
            className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
              notification.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{notification.message}</span>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Client has no CM goals</p>
            <p className="text-gray-400 text-sm mt-1">
              You can add goals in the relevant contact record in the 'CM Check-Ins' tab.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between space-x-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-5">{goal.goal_text}</p>
                    {goal.target_date && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Target: {formatDate(goal.target_date)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={goal.status}
                      onValueChange={(value) => updateGoalStatus(goal.id, value as Goal["status"])}
                      disabled={updatingGoals.has(goal.id)}
                    >
                      <SelectTrigger className="w-32 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Deferred">Deferred</SelectItem>
                      </SelectContent>
                    </Select>
                    {updatingGoals.has(goal.id) && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
