"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClientVisualizationViewProps {
  clientName: string
  activeSection: string
}

export function ClientVisualizationView({ clientName, activeSection }: ClientVisualizationViewProps) {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Visualization View - Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Client: <span className="font-semibold text-blue-600">{clientName}</span>
              </p>
              <p className="text-sm text-gray-600">
                Active Section: <span className="font-medium">{activeSection}</span>
              </p>
              <div className="mt-8 p-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-blue-300">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-blue-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Client Journey Visualization</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    This space will feature an advanced visualization of the complete client journey, showing
                    relationships between services, goals, and provider interactions.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
