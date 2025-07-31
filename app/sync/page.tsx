"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Calendar, Database, CheckCircle, XCircle } from "lucide-react"

interface SyncResult {
  success: boolean
  message: string
  recordsProcessed: number
  timestamp?: string
}

interface DateRange {
  minDate: string
  maxDate: string
}

export default function SyncPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDetectingRange, setIsDetectingRange] = useState(false)
  const [isSyncingAll, setIsSyncingAll] = useState(false)
  const [syncResults, setSyncResults] = useState<SyncResult[]>([])
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [error, setError] = useState<string>("")

  // Generate year options from 1900 to current year + 1
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1900 + 2 }, (_, i) => 1900 + i)

  const months = [
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

  // Set default to current month/year
  useEffect(() => {
    const now = new Date()
    setSelectedMonth((now.getMonth() + 1).toString())
    setSelectedYear(now.getFullYear().toString())
  }, [])

  const detectDataRange = async () => {
    setIsDetectingRange(true)
    setError("")

    try {
      const response = await fetch("/api/contacts")
      if (!response.ok) throw new Error("Failed to fetch contact data")

      const data = await response.json()

      if (data.contacts && data.contacts.length > 0) {
        const dates = data.contacts
          .map((contact: any) => new Date(contact.contact_date))
          .filter((date: Date) => !isNaN(date.getTime()))

        if (dates.length > 0) {
          const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
          const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

          setDateRange({
            minDate: minDate.toISOString().slice(0, 10),
            maxDate: maxDate.toISOString().slice(0, 10),
          })
        } else {
          setError("No valid contact dates found")
        }
      } else {
        setError("No contacts found in database")
      }
    } catch (err) {
      setError(`Failed to detect data range: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsDetectingRange(false)
    }
  }

  const syncSingleMonth = async () => {
    if (!selectedMonth || !selectedYear) {
      setError("Please select both month and year")
      return
    }

    setIsLoading(true)
    setError("")

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

      const result = await response.json()

      const syncResult: SyncResult = {
        ...result,
        timestamp: new Date().toLocaleString(),
      }

      setSyncResults((prev) => [syncResult, ...prev])

      if (!result.success) {
        setError(result.message)
      }
    } catch (err) {
      const errorMessage = `Sync failed: ${err instanceof Error ? err.message : "Unknown error"}`
      setError(errorMessage)
      setSyncResults((prev) => [
        {
          success: false,
          message: errorMessage,
          recordsProcessed: 0,
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const syncAllHistorical = async () => {
    if (!dateRange) {
      setError("Please detect data range first")
      return
    }

    setIsSyncingAll(true)
    setError("")
    setSyncResults([])

    try {
      const minDate = new Date(dateRange.minDate)
      const maxDate = new Date(dateRange.maxDate)

      const startMonth = minDate.getMonth() + 1
      const startYear = minDate.getFullYear()
      const endMonth = maxDate.getMonth() + 1
      const endYear = maxDate.getFullYear()

      // Process each month chronologically
      const currentDate = new Date(startYear, startMonth - 1, 1)
      const endDate = new Date(endYear, endMonth - 1, 1)

      while (currentDate <= endDate) {
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()

        try {
          const response = await fetch("/api/sync-services", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ month, year }),
          })

          const result = await response.json()

          setSyncResults((prev) => [
            {
              ...result,
              timestamp: new Date().toLocaleString(),
            },
            ...prev,
          ])

          // Small delay to prevent overwhelming the server
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (err) {
          setSyncResults((prev) => [
            {
              success: false,
              message: `Failed to sync ${month}/${year}: ${err instanceof Error ? err.message : "Unknown error"}`,
              recordsProcessed: 0,
              timestamp: new Date().toLocaleString(),
            },
            ...prev,
          ])
        }

        currentDate.setMonth(currentDate.getMonth() + 1)
      }
    } catch (err) {
      setError(`Historical sync failed: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsSyncingAll(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Manual Service Data Sync</h1>
      </div>

      {/* Data Range Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Data Range Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={detectDataRange} disabled={isDetectingRange} variant="outline">
            {isDetectingRange && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Detect Data Range
          </Button>

          {dateRange && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Data Range:</strong> {dateRange.minDate} to {dateRange.maxDate}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single Month Sync */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Single Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.reverse().map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={syncSingleMonth} disabled={isLoading || !selectedMonth || !selectedYear} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sync Selected Month
          </Button>
        </CardContent>
      </Card>

      {/* Sync All Historical */}
      <Card>
        <CardHeader>
          <CardTitle>Sync All Historical Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={syncAllHistorical}
            disabled={isSyncingAll || !dateRange}
            variant="destructive"
            className="w-full"
          >
            {isSyncingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sync All Historical Data
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            This will sync all months from the detected data range. Use with caution.
          </p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Table */}
      {syncResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncResults.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell className={result.success ? "text-green-800" : "text-red-800"}>
                      {result.message}
                    </TableCell>
                    <TableCell>{result.recordsProcessed}</TableCell>
                    <TableCell className="text-sm text-gray-600">{result.timestamp}</TableCell>
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
