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
  variant?: "default" | "badges" | "progress" | "dots" | "cards"
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
  variant = "default",
}: ServicesDisplayProps) {
  const requested = Array.isArray(servicesRequested) ? servicesRequested : []
  const provided = Array.isArray(servicesProvided) ? servicesProvided : []
  const allServices = Object.keys(SERVICE_LABELS)

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

  const renderDefault = () => (
    <div className={`flex flex-wrap gap-1 sm:gap-2 ${className}`}>
      {allServices.map((serviceName) => {
        const service = serviceStatuses[serviceName]
        const label = SERVICE_LABELS[serviceName]

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

  const renderBadges = () => (
    <div className={`flex flex-wrap gap-1 sm:gap-2 ${className}`}>
      {allServices.map((serviceName) => {
        const service = serviceStatuses[serviceName]
        const label = SERVICE_LABELS[serviceName]

        const getBadgeStyle = (service: Service) => {
          switch (service.status) {
            case "provided":
              return "bg-green-100 text-green-800 border-green-200"
            case "requested":
              return "bg-blue-100 text-blue-800 border-blue-200"
            case "available_unused":
              return "bg-orange-100 text-orange-800 border-orange-200"
            case "not_requested":
            default:
              return "bg-gray-50 text-gray-500 border-gray-200"
          }
        }

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
              className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full border cursor-help transition-colors ${getBadgeStyle(service)}`}
            >
              <span className="mr-1">{getStatusIcon(service)}</span>
              <span className="hidden sm:inline">{displayLabel}</span>
              <span className="sm:hidden font-bold">{label.substring(0, 2)}</span>
            </span>
          </ServiceTooltip>
        )
      })}
    </div>
  )

  const renderDots = () => (
    <div className={`flex flex-wrap gap-2 sm:gap-3 ${className}`}>
      {allServices.map((serviceName) => {
        const service = serviceStatuses[serviceName]
        const label = SERVICE_LABELS[serviceName]

        const getDotStyle = (service: Service) => {
          switch (service.status) {
            case "provided":
              return "bg-green-500 ring-green-200"
            case "requested":
              return "bg-blue-500 ring-blue-200"
            case "available_unused":
              return "bg-orange-500 ring-orange-200"
            case "not_requested":
            default:
              return "bg-gray-300 ring-gray-100"
          }
        }

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
            <div className="flex flex-col items-center gap-1 cursor-help">
              <div className={`w-3 h-3 rounded-full ring-2 transition-colors ${getDotStyle(service)}`} />
              <span className="text-xs text-gray-600 hidden sm:block">{displayLabel}</span>
              <span className="text-xs text-gray-600 sm:hidden font-bold">{label.substring(0, 2)}</span>
            </div>
          </ServiceTooltip>
        )
      })}
    </div>
  )

  const renderCards = () => (
    <div className={`flex flex-wrap gap-1 sm:gap-2 ${className}`}>
      {allServices.map((serviceName) => {
        const service = serviceStatuses[serviceName]
        const label = SERVICE_LABELS[serviceName]

        const getCardStyle = (service: Service) => {
          switch (service.status) {
            case "provided":
              return "bg-green-50 border-green-200 shadow-green-100"
            case "requested":
              return "bg-blue-50 border-blue-200 shadow-blue-100"
            case "available_unused":
              return "bg-orange-50 border-orange-200 shadow-orange-100"
            case "not_requested":
            default:
              return "bg-gray-50 border-gray-200 shadow-gray-100"
          }
        }

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
            <div
              className={`inline-flex items-center text-xs px-2 py-1 rounded border shadow-sm cursor-help transition-all hover:shadow-md ${getCardStyle(service)}`}
            >
              <span className={`mr-1 text-sm ${getIconColor(service)}`}>{getStatusIcon(service)}</span>
              <span className="hidden sm:inline">{displayLabel}</span>
              <span className="sm:hidden font-bold">{label.substring(0, 2)}</span>
            </div>
          </ServiceTooltip>
        )
      })}
    </div>
  )

  const renderProgress = () => {
    const providedCount = allServices.filter((s) => serviceStatuses[s].status === "provided").length
    const requestedCount = allServices.filter((s) => serviceStatuses[s].status === "requested").length
    const totalRequested = providedCount + requestedCount

    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: totalRequested > 0 ? `${(providedCount / totalRequested) * 100}%` : "0%" }}
            />
          </div>
          <span className="text-xs text-gray-600 font-medium">
            {providedCount}/{totalRequested}
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {allServices.map((serviceName) => {
            const service = serviceStatuses[serviceName]
            const label = SERVICE_LABELS[serviceName]

            if (service.status === "not_requested") return null

            return (
              <ServiceTooltip key={serviceName} content={getTooltipContent(service)}>
                <span
                  className={`inline-flex items-center text-xs px-1 py-0.5 rounded cursor-help ${getIconColor(service)}`}
                >
                  <span className="mr-1">{getStatusIcon(service)}</span>
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden font-bold">{label.substring(0, 2)}</span>
                </span>
              </ServiceTooltip>
            )
          })}
        </div>
      </div>
    )
  }

  switch (variant) {
    case "badges":
      return renderBadges()
    case "dots":
      return renderDots()
    case "cards":
      return renderCards()
    case "progress":
      return renderProgress()
    case "default":
    default:
      return renderDefault()
  }
}
