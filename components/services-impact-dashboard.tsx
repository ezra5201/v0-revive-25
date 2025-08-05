"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Target, AlertTriangle, Activity, Users, UserPlus } from 'lucide-react'

// Mock data simulating your Neon database queries - replace with real API calls
const generateServiceData = () => {
  const services = [
    { name: "Housing", requested: 142, provided: 128, gap: 14, trend: 8.5 },
    { name: "Food", requested: 298, provided: 289, gap: 9, trend: -2.1 },
    { name: "Healthcare", requested: 167, provided: 134, gap: 33, trend: 12.3 },
    { name: "Case Management", requested: 89, provided: 87, gap: 2, trend: 4.7 },
    { name: "Benefits", requested: 124, provided: 98, gap: 26, trend: -5.2 },
    { name: "Employment", requested: 76, provided: 45, gap: 31, trend: 15.8 },
    { name: "Legal", requested: 43, provided: 39, gap: 4, trend: 2.3 },
    { name: "Transportation", requested: 156, provided: 142, gap: 14, trend: 6.1 },
  ]

  return services.map((service) => ({
    ...service,
    completionRate: ((service.provided / service.requested) * 100).toFixed(1),
    impact:
      service.provided > service.requested * 0.8
        ? "high"
        : service.provided > service.requested * 0.6
          ? "medium"
          : "low",
  }))
}

const generateTrendData = () => {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
  return months.map((month, index) => ({
    month,
    requested: 800 + Math.floor(Math.random() * 200),
    provided: 720 + Math.floor(Math.random() * 180),
    completionRate: 85 + Math.floor(Math.random() * 15),
  }))
}

const COLORS = {
  high: "#10B981",
  medium: "#F59E0B",
  low: "#EF4444",
  primary: "#3B82F6",
  secondary: "#6366F1",
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

interface Props {
  overview: {
    totalClients: number
    totalContacts: number
    newClientsThisMonth: number
  } | null
  selectedPeriod: string
}

export default function EnhancedServicesDashboard({ overview, selectedPeriod }: Props) {
  const [serviceData, setServiceData] = useState([])
  const [trendData, setTrendData] = useState([])
  // REMOVE this line - selectedPeriod now comes from props
  // const [selectedPeriod, setSelectedPeriod] = useState("This Month")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        setLoading(true)

        const response = await fetch(`/api/analytics/services-impact?period=${encodeURIComponent(selectedPeriod)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch services data")
        }

        const data = await response.json()

        setServiceData(data.services || [])
        setTrendData(data.trends || [])
      } catch (error) {
        console.error("Error fetching services data:", error)
        // Fallback to mock data if API fails
        setServiceData(generateServiceData())
        setTrendData(generateTrendData())
      } finally {
        setLoading(false)
      }
    }

    fetchServicesData()
  }, [selectedPeriod])

  const totalRequested = serviceData.reduce((sum, item) => sum + item.requested, 0)
  const totalProvided = serviceData.reduce((sum, item) => sum + item.provided, 0)
  const totalGap = serviceData.reduce((sum, item) => sum + item.gap, 0)
  const overallCompletionRate = totalRequested > 0 ? ((totalProvided / totalRequested) * 100).toFixed(1) : 0

  const criticalGaps = serviceData.filter((service) => service.gap > 20).sort((a, b) => b.gap - a.gap)

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading service impact data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Impact Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time insights into service delivery and client outcomes</p>
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
                      <p className="text-sm font-medium text-gray-600">{getNewClientsLabel(selectedPeriod)}</p>
                      <p className="text-2xl font-bold text-gray-900">{overview?.newClientsThisMonth || 0}</p>
                    </div>
                  </div>
                </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services Requested</p>
                <p className="text-3xl font-bold text-gray-900">{totalRequested.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Services Provided</p>
                <p className="text-3xl font-bold text-green-600">{totalProvided.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold text-indigo-600">{overallCompletionRate}%</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Service Gap</p>
                <p className="text-3xl font-bold text-red-600">{totalGap}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Service Comparison Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Service Delivery vs Demand</h2>
            <div className="text-sm text-gray-500">Shows the gap between what clients need and what we deliver</div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={serviceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="requested" fill="#94A3B8" name="Requested" />
              <Bar dataKey="provided" fill="#3B82F6" name="Provided" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trends and Critical Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Service Delivery Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requested" stroke="#94A3B8" strokeWidth={2} name="Requested" />
                <Line type="monotone" dataKey="provided" stroke="#3B82F6" strokeWidth={2} name="Provided" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Critical Service Gaps */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Critical Service Gaps</h2>
            <div className="space-y-4">
              {criticalGaps.slice(0, 5).map((service, index) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-600">{service.completionRate}% completion rate</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{service.gap}</p>
                    <p className="text-sm text-gray-500">unmet requests</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Performance Grid */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Service Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceData.map((service) => (
              <div
                key={service.name}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{service.name}</h3>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.impact === "high"
                        ? "bg-green-100 text-green-800"
                        : service.impact === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {service.completionRate}%
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Requested:</span>
                    <span className="font-medium">{service.requested}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Provided:</span>
                    <span className="font-medium text-blue-600">{service.provided}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gap:</span>
                    <span className={`font-medium ${service.gap > 20 ? "text-red-600" : "text-gray-900"}`}>
                      {service.gap}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        service.impact === "high"
                          ? "bg-green-500"
                          : service.impact === "medium"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${service.completionRate}%` }}
                    />
                  </div>
                </div>

                {service.trend !== 0 && (
                  <div className="flex items-center mt-2 text-xs">
                    {service.trend > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={service.trend > 0 ? "text-green-600" : "text-red-600"}>
                      {Math.abs(service.trend)}% vs last month
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
