"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { DatabaseSetup } from "@/components/database-setup"
import { ServicesImpactDashboard } from "@/components/services-impact-dashboard"
import { ClientDrawer } from "@/components/client-drawer"
import { useDatabase } from "@/hooks/use-database"
import { AlertTriangle } from "lucide-react"

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
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Last 3 Months")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerClientName, setDrawerClientName] = useState<string | null>(null)

  const handleClientSelect = useCallback((clientName: string) => {
    setDrawerClientName(clientName)
    setIsDrawerOpen(true)
  }, [])

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
        <Header onClientSelect={handleClientSelect} />
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
        <Header onClientSelect={handleClientSelect} />
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
      case "Last 3 Months":
        return "New Clients Last 3 Months"
      default:
        return "New Clients"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onClientSelect={handleClientSelect} />

      <main className="bg-white">
        <div className="px-4 sm:px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Impact Dashboard</h1>
            </div>

            {/* NEW: Services Impact Dashboard */}
            <ServicesImpactDashboard overview={overview} selectedPeriod={selectedPeriod} />
          </div>
        </div>
      </main>

      <ClientDrawer isOpen={isDrawerOpen} clientName={drawerClientName} onClose={() => setIsDrawerOpen(false)} />
    </div>
  )
}
