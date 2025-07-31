"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Alert {
  id: string
  client_name: string
  alert_type: string
  message: string
  severity: "low" | "medium" | "high"
  created_at: string
}

export function AlertHeaderIndicator() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const dismissAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setAlerts(alerts.filter((alert) => alert.id !== alertId))
      }
    } catch (error) {
      console.error("Failed to dismiss alert:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading || alerts.length === 0) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <AlertTriangle className="h-4 w-4" />
          {alerts.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {alerts.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-2">
          <h4 className="font-medium">Active Alerts</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.client_name}</p>
                  <p className="text-xs text-gray-600">{alert.message}</p>
                  <p className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
