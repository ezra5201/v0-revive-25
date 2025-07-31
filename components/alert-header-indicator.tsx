"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

interface Alert {
  id: number
  type: string
  message: string
  client_name?: string
  severity: string
  created_at: string
}

export function AlertHeaderIndicator() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showAlerts, setShowAlerts] = useState(false)

  useEffect(() => {
    fetchAlerts()
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts")
      const data = await response.json()
      setAlerts(data.alerts || [])
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
    }
  }

  const dismissAlert = async (alertId: number) => {
    try {
      await fetch(`/api/alerts/${alertId}`, { method: "DELETE" })
      setAlerts((prev) => prev.filter((alert) => alert.id !== alertId))
    } catch (error) {
      console.error("Failed to dismiss alert:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (alerts.length === 0) return null

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setShowAlerts(!showAlerts)} className="relative">
        <AlertTriangle className="h-4 w-4" />
        {alerts.length > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">{alerts.length}</Badge>}
      </Button>

      {showAlerts && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b">
            <h3 className="font-semibold">System Alerts</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 border-b last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      <span className="text-xs text-gray-500">{alert.type}</span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                    {alert.client_name && <p className="text-xs text-gray-500 mt-1">Client: {alert.client_name}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(alert.created_at).toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => dismissAlert(alert.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
