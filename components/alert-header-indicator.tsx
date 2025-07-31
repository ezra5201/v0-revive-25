"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, UserX } from "lucide-react"

interface Alert {
  id: number
  contact_id?: number
  client_name: string
  provider_name: string
  alert_type: string
  alert_details: string
  severity: "low" | "medium" | "high" | "critical"
  status: string
  expires_at: string
  created_at: string
}

export function AlertHeaderIndicator() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/alerts")
      const data = await response.json()
      if (response.ok && data.alerts) {
        console.log("Fetched alerts:", data.alerts) // Debug log
        setAlerts(data.alerts)
      } else {
        console.log("No alerts or error:", data)
        setAlerts([])
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
      setAlerts([])
    }
  }

  // Poll for alerts every 30 seconds
  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleResolveAlert = async (alertId: number, action: "resolved" | "dismissed") => {
    setLoading(true)
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: action,
          resolvedBy: "Andrea Leflore", // TODO: Get from current user context
        }),
      })

      if (response.ok) {
        // Refresh alerts
        await fetchAlerts()
      }
    } catch (error) {
      console.error(`Failed to ${action} alert:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearClientAlerts = async (clientName: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/alerts/clear-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName,
          resolvedBy: "Andrea Leflore", // TODO: Get from current user context
        }),
      })

      if (response.ok) {
        // Refresh alerts
        await fetchAlerts()
      }
    } catch (error) {
      console.error("Failed to clear client alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-100"
      case "high":
        return "text-orange-600 bg-orange-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const formatExpiresAt = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.getTime() === tomorrow.getTime()) {
      return "Expires tomorrow"
    }
    return `Expires ${date.toLocaleDateString()}`
  }

  // Group alerts by client
  const alertsByClient = alerts.reduce(
    (acc, alert) => {
      if (!acc[alert.client_name]) {
        acc[alert.client_name] = []
      }
      acc[alert.client_name].push(alert)
      return acc
    },
    {} as Record<string, Alert[]>,
  )

  // Always show the alert indicator if there are any alerts
  const shouldShowIndicator = alerts.length > 0

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Always visible alert button when there are alerts */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative ${shouldShowIndicator ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-gray-400"}`}
      >
        <AlertTriangle className={`h-5 w-5 ${shouldShowIndicator ? "text-red-600" : "text-gray-400"}`} />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </Button>

      {showDropdown && alerts.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 bg-red-50">
            <h3 className="font-medium text-red-900">🚨 Active Alerts ({alerts.length})</h3>
            <p className="text-xs text-red-600 mt-1">Alerts auto-expire at start of new day</p>
          </div>

          <div className="divide-y divide-gray-100">
            {Object.entries(alertsByClient).map(([clientName, clientAlerts]) => (
              <div key={clientName} className="p-3 hover:bg-red-50 border-l-4 border-red-500">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-red-900">{clientName}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(clientAlerts[0].severity)}`}>
                        {clientAlerts[0].severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Provider: {clientAlerts[0].provider_name}</p>
                    <p className="text-sm text-red-800 font-medium mb-2 bg-red-100 p-2 rounded border border-red-200">
                      {clientAlerts[0].alert_details}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatTimeAgo(clientAlerts[0].created_at)}</span>
                      <span>{formatExpiresAt(clientAlerts[0].expires_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClearClientAlerts(clientName)}
                    disabled={loading}
                    className="text-xs h-7 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <UserX className="h-3 w-3 mr-1" />
                    Clear All for {clientName}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveAlert(clientAlerts[0].id, "resolved")}
                    disabled={loading}
                    className="text-xs h-7"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResolveAlert(clientAlerts[0].id, "dismissed")}
                    disabled={loading}
                    className="text-xs h-7"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 text-center">
            <Button variant="ghost" size="sm" onClick={() => setShowDropdown(false)} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
