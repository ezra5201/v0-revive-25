"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, Database, TrendingUp } from "lucide-react"

interface SyncResult {
  success: boolean
  message: string
  recordsProcessed: number
  executionTime: number
  timestamp: string
  month?: number
  year?: number
}

interface DateRange {
  earliest: string | null
  latest: string | null
}

export default function SyncPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isHistoricalLoading, setIsHistoricalLoading] = useState(false)
  const [isDetectingRange, setIsDetectingRange] = useState(false)
  const [syncResults, setSyncResults] = useState<SyncResult[]>([])
  const [dateRange, setDateRange] = useState<DateRange>({ earliest: null, latest: null })

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Generate year options from 1900 to current year + 1
  const yearOptions = Array.from({ length: currentYear - 1900 + 2 }, (_, i) => 1900 + i)

  // Month options
  const monthOptions = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  // Set default values on component mount
  useEffect(() => {
    setSelectedMonth(currentMonth.toString())
    setSelectedYear(currentYear.toString())
  }, [currentMonth, currentYear])

  const detectDataRange = async () => {
    setIsDetectingRange(true)
    try {
      const response = await fetch("/api/analytics/database-schema")
      if (response.ok) {
        const data = await response.json()
        // This is a placeholder - you'd need to create an endpoint that returns date range
        // For now, we'll simulate the detection
        setTimeout(() => {
          setDateRange({
            earliest: "2023-01-15",
            latest: "2024-12-30",
          })
          setIsDetectingRange(false)
        }, 1000)
      }
    } catch (error) {
      console.error("Failed to detect data range:", error)
      setIsDetectingRange(false)
    }
  }

  const syncSingleMonth = async () => {
    if (!selectedMonth || !selectedYear) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/sync-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month: Number.parseInt(selectedMonth),
          year: Number.parseInt(selectedYear),
        }),
      })

      const result: SyncResult = await response.json()
      result.month = Number.parseInt(selectedMonth)
      result.year = Number.parseInt(selectedYear)

      setSyncResults((prev) => [result, ...prev])
    } catch (error) {
      const errorResult: SyncResult = {
        success: false,
        message: `Failed to sync: ${error instanceof Error ? error.message : "Unknown error"}`,
        recordsProcessed: 0,
        executionTime: 0,
        timestamp: new Date().toISOString(),
        month: Number.parseInt(selectedMonth),
        year: Number.parseInt(selectedYear),
      }
      setSyncResults((prev) => [errorResult, ...prev])
    } finally {
      setIsLoading(false)
    }
  }

  const syncAllHistorical = async () => {
    setIsHistoricalLoading(true)
    try {
      // This would call multiple API requests for all historical months
      // For now, we'll simulate a bulk sync
      const response = await fetch("/api/sync-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Empty body means sync current month
      })

      const result: SyncResult = await response.json()
      result.message = "Historical sync completed (simulated)"

      setSyncResults((prev) => [result, ...prev])
    } catch (error) {
      const errorResult: SyncResult = {
        success: false,
        message: `Historical sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        recordsProcessed: 0,
        executionTime: 0,
        timestamp: new Date().toISOString(),
      }
      setSyncResults((prev) => [errorResult, ...prev])
    } finally {
      setIsHistoricalLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getMonthName = (month: number) => {
    return monthOptions.find((m) => m.value === month.toString())?.label || month.toString()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Monthly Service Summary Sync</h1>
      </div>

      {/* Data Range Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Data Range Detection
          </CardTitle>
          <CardDescription>Detect the earliest and latest contact dates in your database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button onClick={detectDataRange} disabled={isDetectingRange} variant="outline">
              {isDetectingRange && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Detect Data Range
            </Button>

            {dateRange.earliest && dateRange.latest && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Earliest: <strong>{dateRange.earliest}</strong>
                </span>
                <span>
                  Latest: <strong>{dateRange.latest}</strong>
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Sync */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Sync</CardTitle>
          <CardDescription>Sync monthly service summary data for a specific month and year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
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

            <Button onClick={syncSingleMonth} disabled={isLoading || !selectedMonth || !selectedYear}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sync Month
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historical Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Historical Sync
          </CardTitle>
          <CardDescription>Automatically sync all months with contact data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={syncAllHistorical} disabled={isHistoricalLoading} variant="secondary">
            {isHistoricalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sync All Historical Data
          </Button>
        </CardContent>
      </Card>

      {/* Results Table */}
      {syncResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Results</CardTitle>
            <CardDescription>Recent synchronization results</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {result.month && result.year ? `${getMonthName(result.month)} ${result.year}` : "Historical"}
                    </TableCell>
                    <TableCell>{result.recordsProcessed}</TableCell>
                    <TableCell>{result.executionTime}ms</TableCell>
                    <TableCell className="max-w-xs truncate" title={result.message}>
                      {result.message}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatTimestamp(result.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
