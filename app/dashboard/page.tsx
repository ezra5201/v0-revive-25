"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { DatabaseSetup } from "@/components/database-setup"
import EnhancedServicesDashboard from "@/components/services-impact-dashboard"
import { useDatabase } from "@/hooks/use-database"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserPlus, Activity, AlertTriangle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OverviewData {
  totalClients: number
  totalContacts: number
  newClientsThisMonth: number
}

export default function DashboardPage() {
  const { isInitialized, isLoading: dbLoading } = useDatabase()
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("This Month")

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        setError(null)

        const overviewRes = await fetch(`/api/analytics/overview?period=${encodeURIComponent(selectedPeriod)}`)

        if (!overviewRes.ok) {
          throw new Error("Failed to fetch overview data")
        }

        const overviewData = await overviewRes.json()
        setOverview(overviewData)
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

            {/* NEW: Services Impact Dashboard */}
            <EnhancedServicesDashboard />
          </div>
        </div>
      </main>
    </div>
  )
}
