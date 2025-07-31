"use client"

import { Header } from "@/components/header"
import { DatabaseSetup } from "@/components/database-setup"
import { useDatabase } from "@/hooks/use-database"

export default function CmPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Case Management</h1>
            <p className="text-lg text-gray-600 mb-8">
              Coordinate comprehensive case management services to support client needs and outcomes.
            </p>
            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600">
                Case management features are currently in development. This section will include case assignments,
                service coordination, progress tracking, and comprehensive client support planning.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
