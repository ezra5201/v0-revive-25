"use client"

import { ServiceTooltip } from "./service-tooltip"
import type { Service } from "./service" // Declare the Service variable

interface ServicesDisplayProps {
  servicesRequested?: string[]
  servicesProvided?: Array<{
    service: string
    provider: string
    completedAt: string
  }>
  className?: string
}

const SERVICE_LABELS: { [key: string]: string } = {
  "Case Management": "CM",
  Employment: "Employment",
  Food: "Food",
  Healthcare: "Healthcare",
  Housing: "Housing",
  ID: "ID",
  Laundry: "Laundry",
  Occupational: "OT",
  Recreation: "Recreation",
  Other: "Other",
}

export function ServicesDisplay({
  servicesRequested = [],
  servicesProvided = [],
  className = "",
}: ServicesDisplayProps) {
  // Now always safe:
  const requested = Array.isArray(servicesRequested) ? servicesRequested : []
  const provided = Array.isArray(servicesProvided) ? servicesProvided : []
  // All possible services
  const allServices = Object.keys(SERVICE_LABELS)

  // Create service status map
  const serviceStatuses: { [key: string]: Service } = {}

  allServices.forEach((service) => {
    const isRequested = requested.includes(service)
    const providedService = provided.find((p) => p.service === service)

    if (providedService) {
      serviceStatuses[service] = {
        name: service,
        status: "provided",
        provider: providedService.provider,
        completedAt: providedService.completedAt,
      }
    } else if (isRequested) {
      serviceStatuses[service] = {
        name: service,
        status: "requested",
      }
    } else {
      serviceStatuses[service] = {
        name: service,
        status: "not_requested",
      }
    }
  })

  const getStatusIcon = (service: Service) => {
    switch (service.status) {
      case "provided":
        return "✓"
      case "requested":
        return "○"
      case "available_unused":
        return "⊘"
      case "not_requested":
      default:
        return "—"
    }
  }

  const getTooltipContent = (service: Service) => {
    switch (service.status) {
      case "provided":
        let tooltip = "Service provided"
        if (service.provider) {
          tooltip += ` by ${service.provider}`
        }
        if (service.completedAt) {
          tooltip += ` at ${new Date(service.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
        }
        return tooltip
      case "requested":
        return "Service requested but not yet provided"
      case "available_unused":
        return "Service was available but not used"
      case "not_requested":
      default:
        return "Service not requested"
    }
  }

  const getIconColor = (service: Service) => {
    switch (service.status) {
      case "provided":
        return "text-green-600"
      case "requested":
        return "text-blue-600"
      case "available_unused":
        return "text-orange-600"
      case "not_requested":
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className={`flex flex-wrap gap-1 sm:gap-2 ${className}`}>
      {allServices.map((serviceName) => {
        const service = serviceStatuses[serviceName]
        const label = SERVICE_LABELS[serviceName]

        // Show provider in parentheses for CM and OT services when provided
        const displayLabel =
          service.status === "provided" &&
          service.provider &&
          (serviceName === "Case Management" || serviceName === "Occupational")
            ? `${label} (${service.provider
                .split(" ")
                .map((n) => n[0])
                .join("")})`
            : label

        return (
          <ServiceTooltip key={serviceName} content={getTooltipContent(service)}>
            <span
              className={`inline-flex items-center text-xs font-mono px-1 py-0.5 rounded ${getIconColor(service)} 
                         hover:bg-gray-100 cursor-help transition-colors min-h-[28px] min-w-[28px] justify-center
                         sm:min-h-[24px] sm:min-w-[auto] sm:px-2`}
            >
              <span className="mr-1 text-sm">{getStatusIcon(service)}</span>
              <span className="hidden sm:inline text-xs">{displayLabel}</span>
              <span className="sm:hidden text-xs font-bold">{label.substring(0, 2)}</span>
            </span>
          </ServiceTooltip>
        )
      })}
    </div>
  )
}
