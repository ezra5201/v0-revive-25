"use client"

import { Header } from "@/components/header"
import { DatabaseSetup } from "@/components/database-setup"
import { useDatabase } from "@/hooks/use-database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Phone, Mail, Calendar } from "lucide-react"

export default function OutreachPage() {
  const { isInitialized, isLoading: dbLoading } = useDatabase()

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="bg-white">
        <div className="px-4 sm:px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Outreach Management</h1>
              <p className="text-lg text-gray-600">Plan and track outreach activities and community engagement</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">+1 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contacts Made</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">+12% from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Opens</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89%</div>
                  <p className="text-xs text-muted-foreground">Above average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Next 30 days</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 text-center">
              <div className="text-gray-500 mb-4">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Outreach Tools Coming Soon</h2>
              <p className="text-gray-600">
                Campaign management, contact tracking, and engagement analytics will be available here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
