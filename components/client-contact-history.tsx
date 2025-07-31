"use client"

import { ContactTable } from "./contact-table"

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

interface ClientContactHistoryProps {
  clientName: string
  contactHistory: ContactRecord[]
}

export function ClientContactHistory({ clientName, contactHistory }: ClientContactHistoryProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Contact History</h2>
        <p className="text-gray-600">Complete history of all interactions with {clientName}</p>
      </div>

      <ContactTable
        activeTab="all"
        contacts={contactHistory}
        isLoading={false}
        error={null}
        onClientClick={() => {}} // No-op for history view
        onSelectionChange={() => {}} // No-op for history view
      />
    </div>
  )
}
