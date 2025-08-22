"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, MessageSquare, CheckCircle, AlertTriangle, Plus } from "lucide-react"
import { OTCheckinModal } from "./ot-checkin-modal"

interface OTCheckinRecord {
  id: number
  contact_id: number
  client_name: string
  client_uuid: string | null
  provider_name: string
  notes: string | null
  status: string
  created_at: string
  updated_at: string
  goals: Array<{
    id: number
    goal_text: string
    status: string
    target_date: string | null
    priority: number
    created_at: string
  }>
}

interface ClientOTCheckinsProps {
  clientName: string
  contactHistory?: any[] // Keep for backward compatibility but won't be used
}

export function ClientOTCheckins({ clientName }: ClientOTCheckinsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<number | null>(null)
  const [editingCheckinId, setEditingCheckinId] = useState<number | null>(null)
  const [otCheckins, setOtCheckins] = useState<OTCheckinRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOTCheckins = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/ot-checkins/by-client/${encodeURIComponent(clientName)}`)
        const result = await response.json()

        if (result.success) {
          setOtCheckins(result.data)
        } else {
          setError(result.error?.message || "Failed to fetch OT check-ins")
        }
      } catch (err) {
        setError("Failed to fetch OT check-ins")
        console.error("Error fetching OT check-ins:", err)
      } finally {
        setLoading(false)
      }
    }

    if (clientName) {
      fetchOTCheckins()
    }
  }, [clientName])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const daysAgo = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (daysAgo === 0) return "Today"
    if (daysAgo === 1) return "Yesterday"
    if (daysAgo < 7) return `${daysAgo} days ago`
    if (daysAgo < 30) return `${Math.floor(daysAgo / 7)} weeks ago`
    if (daysAgo < 365) return `${Math.floor(daysAgo / 30)} months ago`
    return `${Math.floor(daysAgo / 365)} years ago`
  }

  const providerColorMap = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-orange-100 text-orange-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800",
  ]
  const getProviderColor = (provider: string) => {
    const hash = provider.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return providerColorMap[hash % providerColorMap.length]
  }

  const getEngagementGapWarning = (currentDate: string, previousDate: string) => {
    const current = new Date(currentDate)
    const previous = new Date(previousDate)
    const diffInMs = previous.getTime() - current.getTime()
    const gap = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (gap > 30) return "long-gap"
    if (gap > 14) return "medium-gap"
    return "normal"
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading OT check-ins...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading OT Check-Ins</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (otCheckins.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No OT Check-Ins</h3>
        <p className="text-gray-600">No occupational therapy interactions have been recorded for {clientName} yet.</p>
      </div>
    )
  }

  const handleOTCheckIn = (contactId: number) => {
    setSelectedContactId(contactId)
    setEditingCheckinId(null)
    setIsModalOpen(true)
  }

  const handleEditCheckin = (checkin: OTCheckinRecord) => {
    setSelectedContactId(checkin.contact_id)
    setEditingCheckinId(checkin.id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedContactId(null)
    setEditingCheckinId(null)
    if (clientName) {
      const fetchOTCheckins = async () => {
        try {
          const response = await fetch(`/api/ot-checkins/by-client/${encodeURIComponent(clientName)}`)
          const result = await response.json()
          if (result.success) {
            setOtCheckins(result.data)
          }
        } catch (err) {
          console.error("Error refreshing OT check-ins:", err)
        }
      }
      fetchOTCheckins()
    }
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">OT Check-Ins Timeline</h2>
          <Button size="sm" variant="outline" onClick={() => handleOTCheckIn(0)} className="text-xs">
            <Plus className="h-3 w-3 mr-1" />
            OT Check-In
          </Button>
        </div>
        <p className="text-gray-600">Occupational therapy interactions and services for {clientName}</p>
      </div>

      <div className="relative">
        {/* Center line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {otCheckins.map((checkin, index) => {
            const next = otCheckins[index + 1]
            const gapWarning = next ? getEngagementGapWarning(checkin.created_at, next.created_at) : "normal"

            return (
              <div key={checkin.id} className="relative">
                {/* Dot */}
                <div className="absolute left-6 w-4 h-4 bg-white border-4 border-purple-500 rounded-full" />

                {/* Gap bar */}
                {gapWarning !== "normal" && next && (
                  <div className="absolute left-4 top-16 w-8 h-8 flex items-center justify-center">
                    <div
                      className={`w-2 h-8 ${gapWarning === "long-gap" ? "bg-red-200" : "bg-yellow-200"} rounded-full`}
                    />
                  </div>
                )}

                {/* Card */}
                <div className="ml-16">
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{formatDate(checkin.created_at)}</span>
                            <span className="text-sm text-gray-500">({formatTimeAgo(checkin.created_at)})</span>
                            <Badge variant={checkin.status === "Completed" ? "default" : "secondary"}>
                              {checkin.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <Badge className={getProviderColor(checkin.provider_name)}>{checkin.provider_name}</Badge>
                          </div>
                        </div>
                        {checkin.status === "Draft" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs"
                            onClick={() => handleEditCheckin(checkin)}
                          >
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </Button>
                        )}
                      </div>

                      {/* Notes */}
                      {checkin.notes && (
                        <div className="mb-3 pb-3 border-b border-gray-100">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                            <p className="text-sm text-gray-700">{checkin.notes}</p>
                          </div>
                        </div>
                      )}

                      {/* Goals */}
                      {checkin.goals && checkin.goals.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-start space-x-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span className="text-sm font-medium text-gray-700">Goals ({checkin.goals.length})</span>
                          </div>
                          <div className="ml-6 space-y-1">
                            {checkin.goals.slice(0, 3).map((goal) => (
                              <div key={goal.id} className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {goal.status}
                                </Badge>
                                <span className="text-sm text-gray-600">{goal.goal_text}</span>
                              </div>
                            ))}
                            {checkin.goals.length > 3 && checkin.status !== "Completed" && (
                              <span className="text-xs text-gray-500">+{checkin.goals.length - 3} more goals</span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Gap label */}
                {gapWarning !== "normal" && next && (
                  <div className="ml-16 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full inline-block ${
                        gapWarning === "long-gap" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {gapWarning === "long-gap" ? "Long gap in OT engagement" : "Extended gap in OT contact"}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Start marker */}
        <div className="relative mt-6">
          <div className="absolute left-6 w-4 h-4 bg-gray-300 rounded-full" />
          <div className="ml-16">
            <span className="text-sm text-gray-500 italic">OT services started</span>
          </div>
        </div>
      </div>

      {/* OT Check-In Modal */}
      <OTCheckinModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        clientName={clientName}
        contactId={selectedContactId || 0}
        editingCheckinId={editingCheckinId}
      />
    </div>
  )
}
