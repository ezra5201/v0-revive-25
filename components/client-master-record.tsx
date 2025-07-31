"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { ClientBasicInfo } from "./client-basic-info"
import { ClientContactHistory } from "./client-contact-history"
import { ClientJourneyTimeline } from "./client-journey-timeline"

interface ClientMasterRecordProps {
  clientName: string
  activeSection: "basic-info" | "contact-history" | "journey-timeline"
  onSectionChange: (section: "basic-info" | "contact-history" | "journey-timeline") => void
}

interface ClientData {
  name: string
  category: string
  active: boolean
  created_at: string
  updated_at: string
}

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

export function ClientMasterRecord({ clientName, activeSection, onSectionChange }: ClientMasterRecordProps) {
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [contactHistory, setContactHistory] = useState<ContactRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch client data and contact history
  useEffect(() => {
    const fetchClientData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch client master record
        const clientResponse = await fetch(`/api/clients/${encodeURIComponent(clientName)}`)
        if (!clientResponse.ok) {
          throw new Error("Failed to fetch client data")
        }
        const client = await clientResponse.json()
        setClientData(client)

        // Fetch contact history for this client
        const historyResponse = await fetch(`/api/contacts?client=${encodeURIComponent(clientName)}`)
        if (!historyResponse.ok) {
          throw new Error("Failed to fetch contact history")
        }
        const history = await historyResponse.json()
        console.log("=== CLIENT MASTER RECORD DEBUG ===")
        console.log("Client name:", clientName)
        console.log("History API response status:", historyResponse.status)
        console.log("History API response data:", history)
        console.log("History data type:", typeof history)
        console.log("History is array:", Array.isArray(history))
        console.log("History length:", history?.length || "N/A")
        console.log("First history item:", history?.[0] || "N/A")
        console.log("=== END DEBUG ===")
        setContactHistory(history)
      } catch (err) {
        console.error("=== CLIENT MASTER RECORD ERROR ===")
        console.error("Error fetching client data:", err)
        console.error("Client name:", clientName)
        console.error("Error details:", err instanceof Error ? err.message : err)
        console.error("=== END ERROR ===")
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientData()
  }, [clientName])

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "prospect":
        return "bg-yellow-100 text-yellow-800"
      case "client":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">Loading client record...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <div className="h-6 w-6 text-red-600">⚠</div>
            </div>
            <p className="text-red-600 font-medium">Error loading client record</p>
            <p className="text-gray-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Client name title */}
      <div className="px-4 sm:px-6 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{clientName}</h1>
          {clientData && <Badge className={getCategoryColor(clientData.category)}>{clientData.category}</Badge>}
        </div>
      </div>

      {/* Horizontal sub-tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4 sm:px-6" aria-label="Client sections">
          <button
            onClick={() => onSectionChange("basic-info")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeSection === "basic-info"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => onSectionChange("contact-history")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeSection === "contact-history"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Contact History
          </button>
          <button
            onClick={() => onSectionChange("journey-timeline")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeSection === "journey-timeline"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Journey Timeline
          </button>
          <button
            disabled
            className="py-4 px-1 border-b-2 border-transparent text-gray-400 font-medium text-sm cursor-not-allowed"
          >
            TBD
          </button>
        </nav>
      </div>

      {/* Content area */}
      <div className="p-4 sm:p-6">
        {activeSection === "basic-info" && clientData && (
          <ClientBasicInfo clientData={clientData} contactHistoryLength={contactHistory.length} />
        )}

        {activeSection === "contact-history" && (
          <ClientContactHistory clientName={clientName} contactHistory={contactHistory} />
        )}

        {activeSection === "journey-timeline" && (
          <ClientJourneyTimeline clientName={clientName} contactHistory={contactHistory} />
        )}
      </div>
    </div>
  )
}
