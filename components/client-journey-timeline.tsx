"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TimerIcon as Timeline, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface TimelineEvent {
  id: number
  date: string
  type: "contact" | "service" | "milestone" | "alert"
  title: string
  description: string
  status: "completed" | "pending" | "overdue"
  provider?: string
}

interface ClientJourneyTimelineProps {
  events: TimelineEvent[]
}

export function ClientJourneyTimeline({ events }: ClientJourneyTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getEventIcon = (type: string, status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getEventColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50"
      case "overdue":
        return "border-red-200 bg-red-50"
      default:
        return "border-yellow-200 bg-yellow-50"
    }
  }

  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Timeline className="h-5 w-5" />
          <span>Client Journey Timeline</span>
          <Badge variant="secondary">{events.length} events</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {index < sortedEvents.length - 1 && <div className="absolute left-6 top-8 w-0.5 h-8 bg-gray-200" />}

              <div className={`flex items-start space-x-4 p-4 rounded-lg border ${getEventColor(event.status)}`}>
                <div className="flex-shrink-0 mt-1">{getEventIcon(event.type, event.status)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>

                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        event.status === "completed"
                          ? "border-green-300 text-green-700"
                          : event.status === "overdue"
                            ? "border-red-300 text-red-700"
                            : "border-yellow-300 text-yellow-700"
                      }`}
                    >
                      {event.status}
                    </Badge>

                    {event.provider && (
                      <Badge variant="secondary" className="text-xs">
                        {event.provider}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Timeline className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No timeline events available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
