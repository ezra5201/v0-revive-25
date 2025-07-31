"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ServiceTooltip } from "./service-tooltip"
import { CheckCircle, Clock, AlertCircle, TrendingUp, Users } from "lucide-react"

interface ServiceData {
  name: string
  requested: number
  provided: number
  completion_rate: number
  last_updated?: string
}

interface ServicesDisplayProps {
  services: ServiceData[]
  title?: string
  showProgress?: boolean
}

export function ServicesDisplay({ services, title = "Services Overview", showProgress = true }: ServicesDisplayProps) {
  const getCompletionStatus = (rate: number) => {
    if (rate >= 90) return { status: "excellent", color: "text-green-600", icon: CheckCircle }
    if (rate >= 70) return { status: "good", color: "text-blue-600", icon: TrendingUp }
    if (rate >= 50) return { status: "fair", color: "text-yellow-600", icon: Clock }
    return { status: "poor", color: "text-red-600", icon: AlertCircle }
  }

  const totalRequested = services.reduce((sum, service) => sum + service.requested, 0)
  const totalProvided = services.reduce((sum, service) => sum + service.provided, 0)
  const overallRate = totalRequested > 0 ? (totalProvided / totalRequested) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="secondary">{Math.round(overallRate)}% completion rate</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalRequested}</div>
              <div className="text-sm text-muted-foreground">Requested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalProvided}</div>
              <div className="text-sm text-muted-foreground">Provided</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(overallRate)}%</div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </div>
          </div>

          {/* Individual Services */}
          <div className="space-y-3">
            {services.map((service) => {
              const completion = getCompletionStatus(service.completion_rate)
              const IconComponent = completion.icon

              return (
                <ServiceTooltip
                  key={service.name}
                  serviceName={service.name}
                  status={service.completion_rate >= 70 ? "completed" : "pending"}
                  lastUpdate={service.last_updated}
                  notes={`${service.provided} of ${service.requested} services completed`}
                >
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`h-5 w-5 ${completion.color}`} />
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {service.provided} / {service.requested} completed
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <Badge variant="outline" className={completion.color}>
                        {Math.round(service.completion_rate)}%
                      </Badge>

                      {showProgress && (
                        <div className="w-24">
                          <Progress value={service.completion_rate} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                </ServiceTooltip>
              )
            })}
          </div>

          {services.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No service data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
