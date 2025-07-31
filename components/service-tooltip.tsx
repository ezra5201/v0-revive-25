"use client"

import type React from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface ServiceTooltipProps {
  serviceName: string
  status: "completed" | "pending" | "overdue"
  lastUpdate?: string
  notes?: string
  children: React.ReactNode
}

export function ServiceTooltip({ serviceName, status, lastUpdate, notes, children }: ServiceTooltipProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case "overdue":
        return <AlertCircle className="h-3 w-3 text-red-600" />
      default:
        return <Clock className="h-3 w-3 text-yellow-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{serviceName}</h4>
              <Badge className={getStatusColor()}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon()}
                  <span className="capitalize">{status}</span>
                </div>
              </Badge>
            </div>

            {lastUpdate && (
              <p className="text-xs text-muted-foreground">Last updated: {new Date(lastUpdate).toLocaleDateString()}</p>
            )}

            {notes && <p className="text-xs">{notes}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
