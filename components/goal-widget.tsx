"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Calendar } from "lucide-react"

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

  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/goals/${encodeURIComponent(clientName)}`)
        if (!response.ok) {
          throw new Error("Failed to fetch goals")
        }
        const data = await response.json()
        setGoals(data.goals || [])
      } catch (err) {
        console.error("Error fetching goals:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (clientName) {
      fetchGoals()
    }
  }, [clientName])

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
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No goals set</p>
            <p className="text-gray-400 text-sm mt-1">Goals will appear here when added</p>
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
                  <Badge className={getStatusColor(goal.status)} variant="secondary">
                    {goal.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
