"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { DatabaseSetup } from "@/components/database-setup"
import { ServicesPanel } from "@/components/services-panel"
import { useDatabase } from "@/hooks/use-database"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserPlus, Activity, AlertTriangle, MapPin, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OverviewData {
  totalClients: number
  totalContacts: number
  newClientsThisMonth: number
}

interface LocationData {
  location: string
  visits: number
  totalClients: number
  totalEngaged: number
  engagementRate: number
}

export default function DashboardPage() {
  const { isInitialized, isLoading: dbLoading } = useDatabase()
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [locations, setLocations] = useState<LocationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("This Month")

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        const [overviewRes, locationsRes] = await Promise.all([
          fetch(`/api/analytics/overview?period=${encodeURIComponent(selectedPeriod)}`),
          fetch("/api/analytics/locations"),
        ])

        if (!overviewRes.ok) {
          throw new Error("Failed to fetch overview data")
        }

        if (!locationsRes.ok) {
          throw new Error("Failed to fetch locations data")
        }

        const [overviewData, locationsData] = await Promise.all([overviewRes.json(), locationsRes.json()])

        setOverview(overviewData)
        setLocations(locationsData.locations || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }

    if (isInitialized) {
      fetchAnalytics()
    }
  }, [isInitialized, selectedPeriod])

  // Show database setup if not initialized
  if (!isInitialized && !dbLoading) {
    return <DatabaseSetup />
  }

  // Show loading state
  if (dbLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="bg-white">
          <div className="px-4 sm:px-6 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
                <p className="text-gray-600">Loading analytics...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="bg-white">
          <div className="px-4 sm:px-6 py-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Helper function to get the correct label for new clients based on period
  const getNewClientsLabel = () => {
    switch (selectedPeriod) {
      case "This Month":
        return "New Clients This Month"
      case "Last Month":
        return "New Clients Last Month"
      case "This Year":
        return "New Clients This Year"
      default:
        return "New Clients"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="bg-white">
        <div className="px-4 sm:px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Impact Dashboard</h1>
            </div>

            {/* Summary Section */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
                  <div className="mt-4 sm:mt-0">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="This Month">This Month</SelectItem>
                        <SelectItem value="Last Month">Last Month</SelectItem>
                        <SelectItem value="This Year">This Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Clients</p>
                      <p className="text-2xl font-bold text-gray-900">{overview?.totalClients || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                      <p className="text-2xl font-bold text-gray-900">{overview?.totalContacts || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <UserPlus className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{getNewClientsLabel()}</p>
                      <p className="text-2xl font-bold text-gray-900">{overview?.newClientsThisMonth || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services Panel */}
            <ServicesPanel />

            {/* Location Performance Section */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Location Performance</h2>
                {locations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {locations.map((location, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <MapPin className="h-5 w-5 text-orange-600" />
                            </div>
                            <h3 className="ml-3 font-medium text-gray-900">{location.location}</h3>
                          </div>
                          <div className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">{location.engagementRate.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Visits</span>
                            <span className="font-medium text-gray-900">{location.visits}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Clients</span>
                            <span className="font-medium text-gray-900">{location.totalClients}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Engaged Clients</span>
                            <span className="font-medium text-gray-900">{location.totalEngaged}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Location Data</h3>
                    <p className="text-gray-600">Location performance data will appear here once available.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
