"use client"

import { Header } from "@/components/header"
import { DatabaseSetup } from "@/components/database-setup"
import { useDatabase } from "@/hooks/use-database"

export default function OutreachPage() {
  // Use the same database initialization logic as Contact Log
  const { isInitialized, isLoading: dbLoading } = useDatabase()

  // Show database setup if not initialized
  if (!isInitialized && !dbLoading) {
    return <DatabaseSetup />
  }

  // Show loading state
  if (dbLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="bg-white">
        <div className="px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Outreach Management</h1>
            <p className="text-lg text-gray-600 mb-8">
              Manage outreach campaigns, follow-ups, and communication tracking.
            </p>
            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600">
                Outreach management features are currently in development. This section will include campaign tracking,
                follow-up scheduling, and communication logs.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
