"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Home, Utensils, Heart, GraduationCap, Briefcase, Users, HelpCircle } from "lucide-react"
import type { ServicesResponse } from "@/types/services"

const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase()
  if (name.includes("housing") || name.includes("shelter")) return Home
  if (name.includes("food") || name.includes("meal")) return Utensils
  if (name.includes("health") || name.includes("medical")) return Heart
  if (name.includes("education") || name.includes("training")) return GraduationCap
  if (name.includes("employment") || name.includes("job")) return Briefcase
  if (name.includes("social") || name.includes("support")) return Users
  return HelpCircle
}

const getCompletionRateColor = (rate: number) => {
  if (rate >= 80) return "text-green-600"
  if (rate >= 60) return "text-yellow-600"
  return "text-red-600"
}

const getProgressBarColor = (rate: number) => {
  if (rate >= 80) return "bg-green-500"
  if (rate >= 60) return "bg-yellow-500"
  return "bg-red-500"
}

export function ServicesPanel() {
  const [servicesData, setServicesData] = useState<ServicesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("This Month")

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        setLoading(true)
        setError(null)

        const servicesRes = await fetch(`/api/analytics/services?period=${encodeURIComponent(selectedPeriod)}`)

        if (!servicesRes.ok) {
          throw new Error("Failed to fetch services data")
        }

        const data = await servicesRes.json()
        setServicesData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load services data")
      } finally {
        setLoading(false)
      }
    }

    fetchServicesData()
  }, [selectedPeriod])

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Services</h2>
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
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">Loading services data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Services</h2>
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
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Services</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Services</h2>
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

        {servicesData && servicesData.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {servicesData.map((service) => {
              const IconComponent = getServiceIcon(service.service)
              const completionRateColor = getCompletionRateColor(service.completionRate)
              const progressBarColor = getProgressBarColor(service.completionRate)

              return (
                <div
                  key={service.service}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-6 w-6 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">{service.service}</h3>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-600">{service.provided}</span>
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Provided</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-gray-700">{service.requested}</span>
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Requested</span>
                      </div>

                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-lg font-semibold ${completionRateColor}`}>
                            {service.completionRate}%
                          </span>
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            Completion Rate
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${progressBarColor}`}
                            style={{ width: `${Math.min(service.completionRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Data</h3>
            <p className="text-gray-600">No services data available for {selectedPeriod.toLowerCase()}.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
