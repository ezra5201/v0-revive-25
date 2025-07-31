"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, Building, FileText, Calendar } from "lucide-react"

interface AnalyticsData {
  overview: {
    total_contacts: number
    unique_clients: number
    active_providers: number
    recent_contacts: number
  }
  services: Array<{
    service_type: string
    usage_count: number
    unique_clients: number
  }>
  providers: Array<{
    provider_name: string
    contact_count: number
    unique_clients: number
  }>
  growth: Array<{
    month: string
    unique_clients: number
  }>
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [overviewRes, servicesRes, providersRes, growthRes] = await Promise.all([
        fetch("/api/analytics/overview"),
        fetch("/api/analytics/services"),
        fetch("/api/analytics/providers"),
        fetch("/api/analytics/client-growth"),
      ])

      const [overview, services, providers, growth] = await Promise.all([
        overviewRes.json(),
        servicesRes.json(),
        providersRes.json(),
        growthRes.json(),
      ])

      setAnalytics({
        overview: overview.overview || {},
        services: services.services || [],
        providers: providers.providers || [],
        growth: growth.growth || [],
      })
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">Failed to load dashboard data</div>
      </div>
    )
  }

  const topServices = analytics.services.slice(0, 5)
  const topProviders = analytics.providers.slice(0, 5)

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={fetchAnalytics} variant="outline">
            Refresh Data
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_contacts || 0}</div>
              <p className="text-xs text-muted-foreground">All time contacts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.unique_clients || 0}</div>
              <p className="text-xs text-muted-foreground">Individual clients served</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.active_providers || 0}</div>
              <p className="text-xs text-muted-foreground">Service providers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.recent_contacts || 0}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Services */}
          <Card>
            <CardHeader>
              <CardTitle>Top Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topServices.map((service, index) => (
                  <div key={service.service_type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{service.service_type}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{service.usage_count}</div>
                      <div className="text-xs text-muted-foreground">{service.unique_clients} clients</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Providers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProviders.map((provider, index) => (
                  <div key={provider.provider_name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="font-medium">{provider.provider_name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{provider.contact_count}</div>
                      <div className="text-xs text-muted-foreground">{provider.unique_clients} clients</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Growth */}
        {analytics.growth.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Client Growth (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.growth.map((month) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <span className="text-sm">
                      {new Date(month.month).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                      })}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={
                          (month.unique_clients / Math.max(...analytics.growth.map((g) => g.unique_clients))) * 100
                        }
                        className="w-24"
                      />
                      <span className="text-sm font-medium w-8 text-right">{month.unique_clients}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
