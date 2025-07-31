"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  FolderSyncIcon as Sync,
  Calendar,
  Database,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Clock,
  BarChart3,
  Info,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [syncResults, setSyncResults] = useState<SyncResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isBulkSyncing, setIsBulkSyncing] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })
  const [dateRange, setDateRange] = useState<DateRange>({ earliest: null, latest: null })
  const [isDetectingRange, setIsDetectingRange] = useState(false)
  const { toast } = useToast()

  // Generate year options from 1900 to current year + 1
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear + 1 - i)

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

  useEffect(() => {
    // Auto-detect data range on component mount
    detectDataRange()
  }, [])

  const detectDataRange = async () => {
    setIsDetectingRange(true)
    try {
      const response = await fetch("/api/contacts")
      const data = await response.json()

      if (data.contacts && data.contacts.length > 0) {
        const dates = data.contacts
          .map((c: any) => c.contact_date)
          .filter(Boolean)
          .sort()

        setDateRange({
          earliest: dates[0] || null,
          latest: dates[dates.length - 1] || null,
        })
      }
    } catch (error) {
      console.error("Failed to detect data range:", error)
    } finally {
      setIsDetectingRange(false)
    }
  }

  const syncSingleMonth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/sync-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      })

      const result: SyncResult = await response.json()

      setSyncResults((prev) => [result, ...prev.slice(0, 9)]) // Keep last 10 results

      if (result.success) {
        toast({
          title: "Sync Completed",
          description: `Successfully synced ${result.recordsProcessed} records for ${monthNames[selectedMonth - 1]} ${selectedYear}`,
        })
      } else {
        toast({
          title: "Sync Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const syncAllHistoricalData = async () => {
    if (!dateRange.earliest || !dateRange.latest) {
      toast({
        title: "No Data Range",
        description: "Please detect data range first",
        variant: "destructive",
      })
      return
    }

    setIsBulkSyncing(true)
    setSyncResults([])

    try {
      const startDate = new Date(dateRange.earliest)
      const endDate = new Date(dateRange.latest)

      const months: { month: number; year: number }[] = []
      const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1)

      while (current <= endDate) {
        months.push({
          month: current.getMonth() + 1,
          year: current.getFullYear(),
        })
        current.setMonth(current.getMonth() + 1)
      }

      setBulkProgress({ current: 0, total: months.length })

      const results: SyncResult[] = []

      for (let i = 0; i < months.length; i++) {
        const { month, year } = months[i]
        setBulkProgress({ current: i + 1, total: months.length })

        try {
          const response = await fetch("/api/sync-services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month, year }),
          })

          const result: SyncResult = await response.json()
          result.month = month
          result.year = year
          results.push(result)

          // Small delay between requests
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          results.push({
            success: false,
            message: `Failed to sync ${monthNames[month - 1]} ${year}`,
            recordsProcessed: 0,
            executionTime: 0,
            timestamp: new Date().toISOString(),
            month,
            year,
          })
        }
      }

      setSyncResults(results.reverse()) // Show most recent first

      const successful = results.filter((r) => r.success).length
      const totalRecords = results.reduce((sum, r) => sum + r.recordsProcessed, 0)

      toast({
        title: "Bulk Sync Completed",
        description: `Processed ${successful}/${months.length} months successfully. ${totalRecords} total records processed.`,
      })
    } catch (error) {
      toast({
        title: "Bulk Sync Failed",
        description: "An error occurred during bulk synchronization",
        variant: "destructive",
      })
    } finally {
      setIsBulkSyncing(false)
      setBulkProgress({ current: 0, total: 0 })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Monthly Service Summary Sync</h1>
          <p className="text-muted-foreground">Synchronize monthly service summary data from contact records</p>
        </div>

        {/* Data Range Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Data Range Detection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {isDetectingRange ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Detecting data range...</span>
                  </div>
                ) : dateRange.earliest && dateRange.latest ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Data available from {formatDate(dateRange.earliest)} to {formatDate(dateRange.latest)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.ceil(
                        (new Date(dateRange.latest).getTime() - new Date(dateRange.earliest).getTime()) /
                          (1000 * 60 * 60 * 24 * 30),
                      )}{" "}
                      months of data detected
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No contact data found</p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={detectDataRange} disabled={isDetectingRange}>
                {isDetectingRange ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                Detect Range
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Sync Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Manual Sync</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Month</label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={syncSingleMonth} disabled={isLoading || isBulkSyncing} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Sync className="h-4 w-4 mr-2" />
                        Sync Month
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={syncAllHistoricalData}
                  disabled={isLoading || isBulkSyncing || !dateRange.earliest}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {isBulkSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Syncing All Historical Data...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4 mr-2" />
                      Sync All Historical Data
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Sync Progress */}
        {isBulkSyncing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Bulk Sync Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Processing month {bulkProgress.current} of {bulkProgress.total}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((bulkProgress.current / bulkProgress.total) * 100)}%
                  </span>
                </div>
                <Progress value={(bulkProgress.current / bulkProgress.total) * 100} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sync Results */}
        {syncResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Sync Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syncResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">
                          {result.month && result.year
                            ? `${monthNames[result.month - 1]} ${result.year}`
                            : `${monthNames[selectedMonth - 1]} ${selectedYear}`}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-md" title={result.message}>
                          {result.message}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.recordsProcessed} records
                      </Badge>
                      <div className="text-xs text-muted-foreground">{formatExecutionTime(result.executionTime)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The sync process aggregates contact data into monthly service summaries. Use "Detect Data Range" to see
            available data, then sync individual months or all historical data at once.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
