"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, RefreshCw, CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface ServiceSummary {
  service_name: string
  total_requested: number
  total_provided: number
  completion_rate: number
  month: number
  year: number
}

interface ServicesPanelProps {
  clientName?: string
  month?: number
  year?: number
}

export function ServicesPanel({ clientName, month, year }: ServicesPanelProps) {
  const [summaries, setSummaries] = useState<ServiceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("current")

  useEffect(() => {
    fetchServiceSummaries()
  }, [clientName, month, year, selectedPeriod])

  const fetchServiceSummaries = async () => {
    setLoading(true)
    try {
      let url = "/api/service-summaries"
      const params = new URLSearchParams()

      if (clientName) params.append("client", clientName)
      if (month) params.append("month", month.toString())
      if (year) params.append("year", year.toString())
      if (selectedPeriod !== "current") params.append("period", selectedPeriod)

      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      const data = await response.json()
      setSummaries(data.summaries || [])
    } catch (error) {
      console.error("Failed to fetch service summaries:", error)
    } finally {
      setLoading(false)
    }
  }

  const getCompletionIcon = (rate: number) => {
    if (rate >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (rate >= 60) return <Clock className="h-4 w-4 text-yellow-600" />
    return <AlertTriangle className="h-4 w-4 text-red-600" />
  }

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return "text-green-600"
    if (rate >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const totalRequested = summaries.reduce((sum, s) => sum + s.total_requested, 0)
  const totalProvided = summaries.reduce((sum, s) => sum + s.total_provided, 0)
  const overallRate = totalRequested > 0 ? (totalProvided / totalRequested) * 100 : 0

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading services...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Services Summary</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{Math.round(overallRate)}% completion</Badge>
            <Button variant="outline" size="sm" onClick={fetchServiceSummaries} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="last3months">3 Months</TabsTrigger>
            <TabsTrigger value="last6months">6 Months</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPeriod} className="space-y-4">
            {/* Overview Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{totalRequested}</div>
                <div className="text-xs text-muted-foreground">Total Requested</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{totalProvided}</div>
                <div className="text-xs text-muted-foreground">Total Provided</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${getCompletionColor(overallRate)}`}>{Math.round(overallRate)}%</div>
                <div className="text-xs text-muted-foreground">Completion Rate</div>
              </div>
            </div>

            {/* Service Breakdown */}
            <div className="space-y-3">
              {summaries.map((summary) => (
                <div key={summary.service_name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getCompletionIcon(summary.completion_rate)}
                    <div>
                      <h4 className="font-medium text-sm">{summary.service_name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {summary.total_provided} of {summary.total_requested} completed
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className={`text-sm font-medium ${getCompletionColor(summary.completion_rate)}`}>
                      {Math.round(summary.completion_rate)}%
                    </div>
                    <div className="w-16">
                      <Progress value={summary.completion_rate} className="h-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {summaries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No service summaries available</p>
                <p className="text-sm">Data will appear after running sync</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
