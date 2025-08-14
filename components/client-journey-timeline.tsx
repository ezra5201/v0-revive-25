"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, User, MessageSquare, CheckCircle, Clock, AlertTriangle, Plus } from "lucide-react"

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

interface ClientJourneyTimelineProps {
  clientName: string
  contactHistory: ContactRecord[] | null | undefined
}

export function ClientJourneyTimeline({ clientName, contactHistory }: ClientJourneyTimelineProps) {
  /* ---------------------------------------------------------------------
   * Defensive fallback ➜ ensure we always work with an array
   * ------------------------------------------------------------------- */
  const history: ContactRecord[] = Array.isArray(contactHistory) ? contactHistory : []

  /* ---------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------- */
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const formatTimeAgo = (daysAgo: number) => {
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

  const getEngagementGapWarning = (currentDays: number, previousDays: number) => {
    const gap = previousDays - currentDays
    if (gap > 30) return "long-gap"
    if (gap > 14) return "medium-gap"
    return "normal"
  }

  /* ---------------------------------------------------------------------
   * Early-return states
   * ------------------------------------------------------------------- */
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Contact History</h3>
        <p className="text-gray-600">No interactions have been recorded for {clientName} yet.</p>
      </div>
    )
  }

  /* ---------------------------------------------------------------------
   * Sort newest ➜ oldest so gaps are easy to calculate
   * ------------------------------------------------------------------- */
  const sortedContacts = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleCMCheckIn = (contactId: number) => {
    // TODO: Implement CM Check-In functionality
    console.log(`CM Check-In for contact ${contactId}`)
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Client Journey Timeline</h2>
        <p className="text-gray-600">Visual timeline of all interactions and services for {clientName}</p>
      </div>

      <div className="relative">
        {/* Center line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {sortedContacts.map((contact, index) => {
            const next = sortedContacts[index + 1]
            const gapWarning = next ? getEngagementGapWarning(contact.daysAgo, next.daysAgo) : "normal"

            return (
              <div key={contact.id} className="relative">
                {/* Dot */}
                <div className="absolute left-6 w-4 h-4 bg-white border-4 border-blue-500 rounded-full" />

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
                            <span className="font-medium text-gray-900">{formatDate(contact.date)}</span>
                            <span className="text-sm text-gray-500">({formatTimeAgo(contact.daysAgo)})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <Badge className={getProviderColor(contact.provider)}>{contact.provider}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {contact.hasAlert && (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              <span className="text-xs text-amber-600">Alert</span>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCMCheckIn(contact.id)}
                            className="text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            CM Check-In
                          </Button>
                        </div>
                      </div>

                      {/* Services */}
                      <div className="space-y-3">
                        {/* Requested */}
                        {contact.servicesRequested?.length ? (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">Services Requested</span>
                            </div>
                            <div className="flex flex-wrap gap-1 ml-6">
                              {contact.servicesRequested.map((srv, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {srv}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {/* Provided */}
                        {contact.servicesProvided?.length ? (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-700">Services Provided</span>
                            </div>
                            <div className="flex flex-wrap gap-1 ml-6">
                              {contact.servicesProvided.map((srv, idx) => (
                                <Badge key={idx} className="text-xs bg-green-100 text-green-800">
                                  {srv.service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      {/* Comments */}
                      {contact.comments && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                            <p className="text-sm text-gray-700">{contact.comments}</p>
                          </div>
                        </div>
                      )}

                      {/* Alert Details */}
                      {contact.hasAlert && contact.alertDetails && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                            <p className="text-sm text-amber-700">{contact.alertDetails}</p>
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
                      {gapWarning === "long-gap" ? "Long gap in engagement" : "Extended gap in contact"}
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
            <span className="text-sm text-gray-500 italic">Client journey started</span>
          </div>
        </div>
      </div>
    </div>
  )
}
