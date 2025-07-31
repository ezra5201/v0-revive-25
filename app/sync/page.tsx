"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Calendar, Database } from "lucide-react"

interface SyncResult {
  success: boolean
  message: string
  recordsProcessed: number
  month: number
  year: number
  timestamp: string
  apiDuration?: string
}

export default function SyncPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(String(new Date().getMonth() + 1))
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()))
  const [isLoading, setIsLoading] = useState(false)
  const [isHistoricalLoading, setIsHistoricalLoading] = useState(false)
  const [results, setResults] = useState<SyncResult[]>([])

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

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => ({
    value: String(year),
    label: String(year),
  }))

  const handleSync = async () => {
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

      const result = await response.json()
      setResults((prev) => [result, ...prev])
    } catch (error) {
      const errorResult: SyncResult = {
        success: false,
        message: `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        recordsProcessed: 0,
        month: Number.parseInt(selectedMonth),
        year: Number.parseInt(selectedYear),
        timestamp: new Date().toISOString(),
      }
      setResults((prev) => [errorResult, ...prev])
    } finally {
      setIsLoading(false)
    }
  }

  const handleHistoricalSync = async () => {
    setIsHistoricalLoading(true)
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    const monthsToSync = []

    // Generate all months from January 2024 to current month
    for (let year = 2024; year <= currentYear; year++) {
      const startMonth = year === 2024 ? 1 : 1
      const endMonth = year === currentYear ? currentMonth : 12

      for (let month = startMonth; month <= endMonth; month++) {
        monthsToSync.push({ month, year })
      }
    }

    console.log(`Starting historical sync for ${monthsToSync.length} months`)

    for (const { month, year } of monthsToSync) {
      try {
        const response = await fetch("/api/sync-services", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ month, year }),
        })

        const result = await response.json()
        setResults((prev) => [result, ...prev])

        // Small delay to prevent overwhelming the database
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        const errorResult: SyncResult = {
          success: false,
          message: `Network error for ${month}/${year}: ${error instanceof Error ? error.message : "Unknown error"}`,
          recordsProcessed: 0,
          month,
          year,
          timestamp: new Date().toISOString(),
        }
        setResults((prev) => [errorResult, ...prev])
      }
    }

    setIsHistoricalLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Service Data Synchronization</h1>
        <p className="text-muted-foreground">Manually trigger synchronization of monthly service summary data</p>
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
                    <SelectValue />
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
              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSync} disabled={isLoading || isHistoricalLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync Selected Month"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Historical Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Historical Data Sync
            </CardTitle>
            <CardDescription>Sync all data from January 2024 to current month</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertDescription>
                This will process all months from January 2024 to present. This may take several minutes to complete.
              </AlertDescription>
            </Alert>
            <Button
              onClick={handleHistoricalSync}
              disabled={isLoading || isHistoricalLoading}
              variant="outline"
              className="w-full bg-transparent"
            >
              {isHistoricalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing Historical Data...
                </>
              ) : (
                "Sync All Historical Data"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sync Results</CardTitle>
            <CardDescription>Recent synchronization results (newest first)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">
                          {months.find((m) => m.value === String(result.month))?.label} {result.year}
                        </div>
                        <div className="text-sm text-muted-foreground">{result.recordsProcessed} records processed</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(result.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="mt-2 text-sm">{result.message}</div>
                  {result.apiDuration && (
                    <div className="mt-1 text-xs text-muted-foreground">Duration: {result.apiDuration}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
