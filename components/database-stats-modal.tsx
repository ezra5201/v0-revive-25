"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RefreshCw, Database, Users, AlertTriangle } from "lucide-react"
import { useDatabaseStats } from "@/hooks/use-database-stats"

interface DatabaseStatsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DatabaseStatsModal({ open, onOpenChange }: DatabaseStatsModalProps) {
  const { stats, loading, error, refetch } = useDatabaseStats()

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null || isNaN(num)) {
      return "0"
    }
    return num.toLocaleString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Statistics
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading statistics...</span>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-center py-4">
              <p>Error: {error}</p>
              <Button variant="outline" size="sm" onClick={refetch} className="mt-2 bg-transparent">
                Try Again
              </Button>
            </div>
          )}

          {stats && !loading && (
            <>
              {/* EXISTING 2x2 grid (preserve exactly) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.contacts)}</div>
                  <div className="text-sm text-blue-800">Contacts</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatNumber(stats.clients)}</div>
                  <div className="text-sm text-green-800">Clients</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.providers)}</div>
                  <div className="text-sm text-purple-800">Providers</div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{formatNumber(stats.alerts)}</div>
                  <div className="text-sm text-orange-800">Alerts</div>
                </div>
              </div>

              {/* NEW metrics section (added below existing) */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Data Consistency Analysis
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{formatNumber(stats.unique_people)}</div>
                    <div className="text-sm text-indigo-800">Unique People</div>
                  </div>

                  <div
                    className={`p-4 rounded-lg ${(stats.master_records_gap || 0) > 0 ? "bg-red-50" : "bg-green-50"}`}
                  >
                    <div
                      className={`text-2xl font-bold flex items-center gap-1 ${(stats.master_records_gap || 0) > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {(stats.master_records_gap || 0) > 0 && <AlertTriangle className="h-5 w-5" />}
                      {formatNumber(stats.master_records_gap)}
                    </div>
                    <div
                      className={`text-sm ${(stats.master_records_gap || 0) > 0 ? "text-red-800" : "text-green-800"}`}
                    >
                      Missing Records
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-lg ${(stats.data_consistency_percentage || 0) < 100 ? "bg-yellow-50" : "bg-green-50"}`}
                  >
                    <div
                      className={`text-2xl font-bold ${(stats.data_consistency_percentage || 0) < 100 ? "text-yellow-600" : "text-green-600"}`}
                    >
                      {stats.data_consistency_percentage || 0}%
                    </div>
                    <div
                      className={`text-sm ${(stats.data_consistency_percentage || 0) < 100 ? "text-yellow-800" : "text-green-800"}`}
                    >
                      Consistency
                    </div>
                  </div>
                </div>
              </div>

              {/* EXISTING footer (preserve exactly) */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-500">Last updated: {formatDate(stats.lastUpdated)}</div>
                <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
