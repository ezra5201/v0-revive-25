"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ServicesPanel } from "@/components/services-panel"
import { Header } from "@/components/header"
import { DatabaseSetup } from "@/components/database-setup"
import { useDatabase } from "@/hooks/use-database"
import { Users, UserPlus, Calendar, MapPin, TrendingUp } from "lucide-react"

interface OverviewData {
  totalClients: number
  totalContacts: number
  newClientsThisMonth: number
}

interface LocationData {
  location: string
  totalVisits: number
  totalClients: number
  engagedClients: number
  engagementRate: number
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30")
  const [overviewData, setOverviewData] = useState<OverviewData>({
    totalClients: 0,
    totalContacts: 0,
    newClientsThisMonth: 0,
  })
  const [locationsData, setLocationsData] = useState<LocationData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { isInitialized, isLoading: dbLoading } = useDatabase()

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isInitialized) return

      setIsLoading(true)
      setError(null)

      try {
        const [overviewResponse, locationsResponse] = await Promise.all([
          fetch(`/api/analytics/overview?period=${selectedPeriod}`),
          fetch(`/api/analytics/locations?period=${selectedPeriod}`),
        ])

        if (!overviewResponse.ok) {
          throw new Error(`Overview API error: ${overviewResponse.status}`)
        }

        if (!locationsResponse.ok) {
          throw new Error(`Locations API error: ${locationsResponse.status}`)
        }

        const [overviewResult, locationsResult] = await Promise.all([overviewResponse.json(), locationsResponse.json()])

        setOverviewData(overviewResult)
        setLocationsData(locationsResult)
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedPeriod, isInitialized])

  // Show database setup if not initialized
  if (!isInitialized && !dbLoading) {
    return <DatabaseSetup />
  }

  // Show loading state
  if (dbLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">Overview of client engagement and service delivery</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">Error loading dashboard data: {error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewData.totalClients}</div>
              <p className="text-xs text-muted-foreground">Active client base</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewData.totalContacts}</div>
              <p className="text-xs text-muted-foreground">Client interactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Clients</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overviewData.newClientsThisMonth}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Location Performance */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Location Performance</h2>
            <p className="text-gray-600">Client engagement metrics by service location</p>
          </div>

          {locationsData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locationsData.map((location, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {location.location}
                    </CardTitle>
                    <Badge variant="secondary" className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {location.engagementRate}%
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Visits:</span>
                        <span className="font-medium">{location.totalVisits}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Clients:</span>
                        <span className="font-medium">{location.totalClients}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Engaged Clients:</span>
                        <span className="font-medium">{location.engagedClients}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No location data available for the selected period</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Services Panel */}
        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Overview</h2>
            <p className="text-gray-600">Current service delivery status and metrics</p>
          </div>
          <ServicesPanel />
        </div>
      </main>
    </div>
  )
}
