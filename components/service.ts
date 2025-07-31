export interface Service {
  id: string
  name: string
  category: "basic" | "support" | "healthcare" | "legal"
  description: string
  isActive: boolean
  lastUpdated: string
}

export interface ServiceRequest {
  id: string
  clientName: string
  serviceId: string
  requestDate: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  notes?: string
  assignedProvider?: string
  completedDate?: string
}

export interface ServiceStats {
  serviceId: string
  serviceName: string
  totalRequests: number
  completedRequests: number
  pendingRequests: number
  averageCompletionTime: number // in days
  completionRate: number // percentage
}

export const SERVICE_CATEGORIES = {
  basic: "Basic Services",
  support: "Support Services",
  healthcare: "Healthcare",
  legal: "Legal Services",
} as const

export const SERVICE_STATUSES = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
} as const

export const PRIORITY_LEVELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
} as const

export function getServiceCategoryColor(category: Service["category"]): string {
  switch (category) {
    case "basic":
      return "bg-blue-100 text-blue-800"
    case "support":
      return "bg-green-100 text-green-800"
    case "healthcare":
      return "bg-red-100 text-red-800"
    case "legal":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getStatusColor(status: ServiceRequest["status"]): string {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-yellow-100 text-yellow-800"
  }
}

export function getPriorityColor(priority: ServiceRequest["priority"]): string {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800"
    case "high":
      return "bg-orange-100 text-orange-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function formatServiceDuration(days: number): string {
  if (days < 1) return "Less than 1 day"
  if (days === 1) return "1 day"
  if (days < 7) return `${Math.round(days)} days`
  if (days < 30) return `${Math.round(days / 7)} weeks`
  return `${Math.round(days / 30)} months`
}
