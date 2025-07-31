"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Database, CheckCircle, XCircle } from "lucide-react"

interface SyncResult {
  success: boolean
  month: number
  year: number
  recordsProcessed: number
  message: string
  timestamp: string
  duration: number
  error?: string
}

interface DataRange {
  earliest: string | null
  latest: string | null
  totalMonths: number
}

export default function SyncPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isHistoricalLoading, setIsHistoricalLoading] = useState(false)
  const [isDetectingRange, setIsDetectingRange] = useState(false)
  const [results, setResults] = useState<SyncResult[]>([])
  const [dataRange, setDataRange] = useState<DataRange | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize with current month/year
  useEffect(() => {
    const now = new Date()
    setSelectedMonth((now.getMonth() + 1).toString())
    setSelectedYear(now.getFullYear().toString())
  }, [])

  // Generate year options (1900 to current year + 1)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: currentYear - 1900 + 2 }, (_, i) => 1900 + i)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  /**
   * Detect the data range in the contacts table
   */
  const detectDataRange = async () => {
    setIsDetectingRange(true)
    setError(null)

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getDateRange" }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.dateRange) {
        const earliest = data.dateRange.earliest ? new Date(data.dateRange.earliest) : null
        const latest = data.dateRange.latest ? new Date(data.dateRange.latest) : null

        let totalMonths = 0
        if (earliest && latest) {
          const yearDiff = latest.getFullYear() - earliest.getFullYear()
          const monthDiff = latest.getMonth() - earliest.getMonth()
          totalMonths = yearDiff * 12 + monthDiff + 1
        }

        setDataRange({
          earliest: data.dateRange.earliest,
          latest: data.dateRange.latest,
          totalMonths,
        })
      } else {
        setError("Failed to detect data range")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(`Failed to detect data range: ${errorMessage}`)
    } finally {
      setIsDetectingRange(false)
    }
  }

  /**
   * Sync a single month
   */
  const syncSingleMonth = async () => {
    if (!selectedMonth || !selectedYear) {
      setError("Please select both month and year")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/sync-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: Number.parseInt(selectedMonth),
          year: Number.parseInt(selectedYear),
        }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        const result: SyncResult = {
          success: true,
          month: data.data.month,
          year: data.data.year,
          recordsProcessed: data.data.recordsProcessed,
          message: data.data.message,
          timestamp: data.data.timestamp,
          duration: data.data.duration,
        }
        setResults((prev) => [result, ...prev])
      } else {
        setError(data.error || "Sync failed")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(`Sync failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Sync all historical data
   */
  const syncAllHistorical = async () => {
    setIsHistoricalLoading(true)
    setError(null)
    setResults([])

    try {
      // First detect the data range
      await detectDataRange()

      // For now, we'll sync from 2024 onwards as a reasonable default
      // In a real implementation, this would use the detected range
      const startYear = 2024
      const endYear = currentYear
      const currentMonth = new Date().getMonth() + 1

      const monthsToSync: Array<{ month: number; year: number }> = []

      for (let year = startYear; year <= endYear; year++) {
        const maxMonth = year === endYear ? currentMonth : 12
        for (let month = 1; month <= maxMonth; month++) {
          monthsToSync.push({ month, year })
        }
      }

      console.log(`Syncing ${monthsToSync.length} months from ${startYear} to ${endYear}`)

      for (let i = 0; i < monthsToSync.length; i++) {
        const { month, year } = monthsToSync[i]

        try {
          const response = await fetch("/api/sync-services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month, year }),
          })

          const data = await response.json()

          const result: SyncResult = {
            success: data.success,
            month,
            year,
            recordsProcessed: data.data?.recordsProcessed || 0,
            message: data.data?.message || data.error || "Unknown result",
            timestamp: data.data?.timestamp || new Date().toISOString(),
            duration: data.data?.duration || 0,
            error: data.success ? undefined : data.error || "Unknown error",
          }

          setResults((prev) => [result, ...prev])

          // Small delay to prevent overwhelming the database
          if (i < monthsToSync.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100))
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Unknown error"
          const result: SyncResult = {
            success: false,
            month,
            year,
            recordsProcessed: 0,
            message: `Failed: ${errorMessage}`,
            timestamp: new Date().toISOString(),
            duration: 0,
            error: errorMessage,
          }
          setResults((prev) => [result, ...prev])
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(`Historical sync failed: ${errorMessage}`)
    } finally {
      setIsHistoricalLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Service Data Synchronization</h1>
        <p className="text-muted-foreground">
          Sync contact data into monthly service summaries for reporting and analytics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Single Month Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Single Month Sync
            </CardTitle>
            <CardDescription>Sync data for a specific month and year</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((month, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.reverse().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={syncSingleMonth}
              disabled={isLoading || !selectedMonth || !selectedYear}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync Month"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Data Range Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Range Detection
            </CardTitle>
            <CardDescription>Discover the date range of available contact data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dataRange && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Earliest Date:</span>
                  <span>{dataRange.earliest ? new Date(dataRange.earliest).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Latest Date:</span>
                  <span>{dataRange.latest ? new Date(dataRange.latest).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total Months:</span>
                  <span>{dataRange.totalMonths}</span>
                </div>
              </div>
            )}
            <Button
              onClick={detectDataRange}
              disabled={isDetectingRange}
              variant="outline"
              className="w-full bg-transparent"
            >
              {isDetectingRange ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Detecting...
                </>
              ) : (
                "Detect Data Range"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Historical Sync */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Historical Data Sync
          </CardTitle>
          <CardDescription>Sync all available historical data (processes all months from 2024 onwards)</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={syncAllHistorical} disabled={isHistoricalLoading} variant="secondary" className="w-full">
            {isHistoricalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing All Historical Data...
              </>
            ) : (
              "Sync All Historical Data"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="mt-6" variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Sync Results</CardTitle>
            <CardDescription>Recent synchronization operations and their results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="font-medium">
                        {monthNames[result.month - 1]} {result.year}
                      </div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.recordsProcessed} records
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">{result.duration}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
