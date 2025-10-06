"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, User, CheckCircle, Clock } from "lucide-react"

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
  const history: ContactRecord[] = Array.isArray(contactHistory) ? contactHistory : []

  const cmCheckIns = history.filter((contact) => {
    const hasCMRequested =
      contact.servicesRequested?.some((service) => service === "Case Management" || service === "Housing") || false
    const hasCMProvided =
      contact.servicesProvided?.some(
        (service) => service.service === "Case Management" || service.service === "Housing",
      ) || false
    return hasCMRequested || hasCMProvided
  })

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const formatTimeAgo = (daysAgo: number) => {
    if (daysAgo === 0) return "(Today)"
    if (daysAgo === 1) return "(Yesterday)"
    if (daysAgo < 7) return `(${daysAgo} days ago)`
    if (daysAgo < 30) return `(${Math.floor(daysAgo / 7)} weeks ago)`
    if (daysAgo < 365) return `(${Math.floor(daysAgo / 30)} months ago)`
    return `(${Math.floor(daysAgo / 365)} years ago)`
  }

  const sortedContacts = [...cmCheckIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (cmCheckIns.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No CM Check-Ins</h3>
        <p className="text-gray-600">No case management interactions have been recorded for {clientName} yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">CM Check-Ins Timeline</h2>
        <p className="text-gray-500 text-base">Case management interactions and services for {clientName}</p>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-8">
          {sortedContacts.map((contact) => {
            return (
              <div key={contact.id} className="relative">
                <div className="absolute left-6 w-4 h-4 bg-white border-4 border-blue-500 rounded-full" />

                <div className="ml-16">
                  <Card className="shadow-sm border border-gray-200">
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span className="font-semibold text-gray-900 text-lg">{formatDate(contact.date)}</span>
                          <span className="text-sm text-gray-500">{formatTimeAgo(contact.daysAgo)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-medium">
                            {contact.provider}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {contact.servicesRequested?.filter((srv) => srv === "Case Management" || srv === "Housing")
                          .length ? (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Clock className="h-5 w-5 text-gray-600" />
                              <span className="text-sm font-semibold text-gray-700">CM Services Requested</span>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-7">
                              {contact.servicesRequested
                                .filter((srv) => srv === "Case Management" || srv === "Housing")
                                .map((srv, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
                                  >
                                    {srv}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        ) : null}

                        {contact.servicesProvided?.filter(
                          (srv) => srv.service === "Case Management" || srv.service === "Housing",
                        ).length ? (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-semibold text-gray-700">CM Services Provided</span>
                            </div>
                            <div className="flex flex-wrap gap-2 ml-7">
                              {contact.servicesProvided
                                .filter((srv) => srv.service === "Case Management" || srv.service === "Housing")
                                .map((srv, idx) => (
                                  <Badge
                                    key={idx}
                                    className="bg-green-100 text-green-800 hover:bg-green-100 font-medium"
                                  >
                                    {srv.service}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
