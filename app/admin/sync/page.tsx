"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Clock, Shield } from "lucide-react"

interface SyncOperation {
  id: string
  timestamp: string
  month: number
  year: number
  status: "success" | "error" | "running"
  duration: number
  processedRecords: number
  message: string
}

interface SyncResult {
  success: boolean
  message: string
  data?: {
    processedRecords: number
    targetMonth: number
    targetYear: number
    syncDuration: number
    errors: string[]
    details: Array<{
      serviceName: string
      requested: number
      provided: number
      completionRate: number
    }>
  }
  timestamp: string
  duration: number
}

export default function AdminSyncPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [forceResync, setForceResync] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [syncHistory, setSyncHistory] = useState<SyncOperation[]>([])

  // Load sync history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("syncHistory")
    if (saved) {
      try {
        setSyncHistory(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to load sync history:", error)
      }
    }
  }, [])

  // Save sync history to localStorage
  const saveSyncHistory = (history: SyncOperation[]) => {
    localStorage.setItem("syncHistory", JSON.stringify(history.slice(0, 10))) // Keep last 10
    setSyncHistory(history)
  }

  // Authentication
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"

    if (password === adminPassword) {
      setIsAuthenticated(true)
      setAuthError("")
    } else {
      setAuthError("Invalid password")
    }
  }

  // Trigger sync
  const handleSync = async () => {
    setIsLoading(true)
    setSyncResult(null)

    const operationId = `sync-${Date.now()}`
    const startTime = Date.now()

    // Add running operation to history
    const runningOperation: SyncOperation = {
      id: operationId,
      timestamp: new Date().toISOString(),
      month: selectedMonth,
      year: selectedYear,
      status: "running",
      duration: 0,
      processedRecords: 0,
      message: "Sync in progress...",
    }

    const newHistory = [runningOperation, ...syncHistory]
    saveSyncHistory(newHistory)

    try {
      const response = await fetch("/api/admin/sync-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": process.env.NEXT_PUBLIC_ADMIN_API_KEY || "default-key",
        },
        body: JSON.stringify({
          month: selectedMonth,
          year: selectedYear,
          force: forceResync,
        }),
      })

      const result: SyncResult = await response.json()
      setSyncResult(result)

      // Update operation in history
      const completedOperation: SyncOperation = {
        id: operationId,
        timestamp: new Date().toISOString(),
        month: selectedMonth,
        year: selectedYear,
        status: result.success ? "success" : "error",
        duration: Date.now() - startTime,
        processedRecords: result.data?.processedRecords || 0,
        message: result.message,
      }

      const updatedHistory = newHistory.map((op) => (op.id === operationId ? completedOperation : op))
      saveSyncHistory(updatedHistory)
    } catch (error) {
      const errorMessage = `Network error: ${error}`
      setSyncResult({
        success: false,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      })

      // Update operation with error
      const errorOperation: SyncOperation = {
        id: operationId,
        timestamp: new Date().toISOString(),
        month: selectedMonth,
        year: selectedYear,
        status: "error",
        duration: Date.now() - startTime,
        processedRecords: 0,
        message: errorMessage,
      }

      const updatedHistory = newHistory.map((op) => (op.id === operationId ? errorOperation : op))
      saveSyncHistory(updatedHistory)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2024, i).toLocaleString("default", { month: "long" }),
  }))

  // Generate year options
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>Enter the admin password to access the sync dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              {authError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Monthly Service Sync</h1>
          <p className="text-gray-600 mt-2">Manually trigger synchronization of monthly service summary data</p>
        </div>

        {/* Sync Form */}
        <Card>
          <CardHeader>
            <CardTitle>Trigger Sync</CardTitle>
            <CardDescription>Select the month and year to synchronize service data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="month">Month</Label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="force"
                checked={forceResync}
                onCheckedChange={(checked) => setForceResync(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="force" className="text-sm">
                Force resync (overwrite existing data)
              </Label>
            </div>

            <Button onClick={handleSync} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Start Sync"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Sync Result */}
        {syncResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {syncResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Sync Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant={syncResult.success ? "default" : "destructive"}>
                <AlertDescription>{syncResult.message}</AlertDescription>
              </Alert>

              {syncResult.data && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Processed:</span>
                      <div className="text-lg font-bold">{syncResult.data.processedRecords}</div>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <div className="text-lg font-bold">{syncResult.data.syncDuration}ms</div>
                    </div>
                    <div>
                      <span className="font-medium">Month:</span>
                      <div className="text-lg font-bold">
                        {syncResult.data.targetYear}-{syncResult.data.targetMonth.toString().padStart(2, "0")}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Errors:</span>
                      <div className="text-lg font-bold text-red-600">{syncResult.data.errors.length}</div>
                    </div>
                  </div>

                  {syncResult.data.details.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Service Details:</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-200 px-3 py-2 text-left">Service</th>
                              <th className="border border-gray-200 px-3 py-2 text-right">Requested</th>
                              <th className="border border-gray-200 px-3 py-2 text-right">Provided</th>
                              <th className="border border-gray-200 px-3 py-2 text-right">Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {syncResult.data.details.map((detail, index) => (
                              <tr key={index}>
                                <td className="border border-gray-200 px-3 py-2">{detail.serviceName}</td>
                                <td className="border border-gray-200 px-3 py-2 text-right">{detail.requested}</td>
                                <td className="border border-gray-200 px-3 py-2 text-right">{detail.provided}</td>
                                <td className="border border-gray-200 px-3 py-2 text-right">
                                  {detail.completionRate}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sync History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sync Operations</CardTitle>
            <CardDescription>Last 10 sync operations with status and timing</CardDescription>
          </CardHeader>
          <CardContent>
            {syncHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sync operations yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Timestamp</th>
                      <th className="text-left py-2">Period</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-right py-2">Records</th>
                      <th className="text-right py-2">Duration</th>
                      <th className="text-left py-2">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {syncHistory.map((operation) => (
                      <tr key={operation.id} className="border-b">
                        <td className="py-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {new Date(operation.timestamp).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-2">
                          {operation.year}-{operation.month.toString().padStart(2, "0")}
                        </td>
                        <td className="py-2">
                          <Badge
                            variant={
                              operation.status === "success"
                                ? "default"
                                : operation.status === "error"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {operation.status}
                          </Badge>
                        </td>
                        <td className="py-2 text-right">{operation.processedRecords}</td>
                        <td className="py-2 text-right">{operation.duration}ms</td>
                        <td className="py-2 text-sm text-gray-600 max-w-xs truncate">{operation.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
