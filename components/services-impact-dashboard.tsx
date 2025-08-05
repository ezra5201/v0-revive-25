"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ServiceData {
  name: string
  requested: number
  provided: number
  gap: number
  completionRate: number
  impact: "high" | "medium" | "low"
}

interface TrendData {
  month: string
  requested: number
  provided: number
  completionRate: number
}

interface ServicesImpactData {
  services: ServiceData[]
  trends: TrendData[]
  period: string
  summary: {
    totalRequested: number
    totalProvided: number
    totalGap: number
    overallCompletionRate: number
  }
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const timeOptions = [
  "Today",
  "Yesterday",
  "This Week",
  "Last Week",
  "This Month",
  "Last Month",
  "Last 3 Months",
  "This Quarter",
  "Last Quarter",
  "This Year",
  "Specific Date",
  "Custom Date Range",
]

export function ServicesImpactDashboard() {
  const [data, setData] = useState<ServicesImpactData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("This Month")
  const [specificDate, setSpecificDate] = useState<Date>()
  const [customStartDate, setCustomStartDate] = useState<Date>()
  const [customEndDate, setCustomEndDate] = useState<Date>()
  const [showSpecificDateDialog, setShowSpecificDateDialog] = useState(false)
  const [showCustomRangeDialog, setShowCustomRangeDialog] = useState(false)

  const fetchData = async (period: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({ period })
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const response = await fetch(`/api/analytics/services-impact?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch services impact data")
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedPeriod)
  }, [])

  const handlePeriodChange = (value: string) => {
    if (value === "Specific Date") {
      setShowSpecificDateDialog(true)
      return
    }

    if (value === "Custom Date Range") {
      setShowCustomRangeDialog(true)
      return
    }

    setSelectedPeriod(value)
    fetchData(value)
  }

  const handleSpecificDateSelect = () => {
    if (specificDate) {
      const dateStr = format(specificDate, "yyyy-MM-dd")
      setSelectedPeriod("Specific Date")
      setShowSpecificDateDialog(false)
      fetchData("Specific Date", dateStr)
    }
  }

  const handleCustomRangeSelect = () => {
    if (customStartDate && customEndDate) {
      const startStr = format(customStartDate, "yyyy-MM-dd")
      const endStr = format(customEndDate, "yyyy-MM-dd")
      setSelectedPeriod("Custom Date Range")
      setShowCustomRangeDialog(false)
      fetchData("Custom Date Range", startStr, endStr)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold">Services Analytics</h2>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold">Services Analytics</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading services impact data: {error}</p>
              <Button onClick={() => fetchData(selectedPeriod)} className="mt-4" variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Services Analytics</h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="time-period" className="text-sm font-medium">
            Time Period:
          </Label>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange} disabled={loading}>
            <SelectTrigger id="time-period" className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalRequested.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Provided</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.totalProvided.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Gap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.summary.totalGap.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.overallCompletionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Demand vs Delivery</CardTitle>
            <CardDescription>Comparison of requested vs provided services</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.services}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="requested" fill="#8884d8" name="Requested" />
                <Bar dataKey="provided" fill="#82ca9d" name="Provided" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Completion Rates</CardTitle>
            <CardDescription>Percentage of requested services delivered</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.services}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Completion Rate"]} />
                <Bar dataKey="completionRate" fill="#ffc658" name="Completion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Service Trends</CardTitle>
          <CardDescription>Service request and delivery trends over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="requested" stroke="#8884d8" name="Requested" />
              <Line type="monotone" dataKey="provided" stroke="#82ca9d" name="Provided" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Impact Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Service Impact Distribution</CardTitle>
          <CardDescription>Distribution of services by completion rate impact</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "High Impact (80%+)", value: data.services.filter((s) => s.impact === "high").length },
                  { name: "Medium Impact (60-79%)", value: data.services.filter((s) => s.impact === "medium").length },
                  { name: "Low Impact (<60%)", value: data.services.filter((s) => s.impact === "low").length },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.services.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Specific Date Dialog */}
      <Dialog open={showSpecificDateDialog} onOpenChange={setShowSpecificDateDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Specific Date</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="specific-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="specific-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !specificDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {specificDate ? format(specificDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={specificDate} onSelect={setSpecificDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSpecificDateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSpecificDateSelect} disabled={!specificDate}>
                Apply Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Date Range Dialog */}
      <Dialog open={showCustomRangeDialog} onOpenChange={setShowCustomRangeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Custom Date Range</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !customStartDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !customEndDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCustomRangeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCustomRangeSelect} disabled={!customStartDate || !customEndDate}>
                Apply Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
