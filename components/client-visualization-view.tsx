"use client"

import { useState, useEffect } from "react"
import { ClientSankeyDiagram } from "./client-sankey-diagram"

interface ContactRecord {
  id: number
  date: string
  daysAgo: number
  provider: string
  client: string
  category: string
  servicesRequested?: string[]
  servicesProvided?: Array<{
    service: string
    provider: string
    completedAt: string
  }>
  comments?: string
  hasAlert?: boolean
  alertDetails?: string
  alertSeverity?: string
}

interface ClientVisualizationViewProps {
  clientName: string
  activeSection: string
}

export function ClientVisualizationView({ clientName, activeSection }: ClientVisualizationViewProps) {
  const [contactHistory, setContactHistory] = useState<ContactRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContactHistory = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/contacts?client=${encodeURIComponent(clientName)}`)
        if (!response.ok) {
          throw new Error("Failed to fetch contact history")
        }
        const data = await response.json()
        setContactHistory(data.contacts || [])
      } catch (err) {
        console.error("Error fetching contact history for visualization:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (clientName) {
      fetchContactHistory()
    }
  }, [clientName])

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="p-8">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
                  <p className="text-gray-600">Loading client journey visualization...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="w-full">
            <div className="p-8">
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <div className="h-6 w-6 text-red-600">⚠</div>
                  </div>
                  <p className="text-red-600 font-medium">Error loading visualization</p>
                  <p className="text-gray-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="w-full max-w-none">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="w-full h-[600px] sm:h-[700px] lg:h-[800px] xl:h-[900px]">
              <ClientSankeyDiagram clientName={clientName} contactHistory={contactHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
