"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, RefreshCw, Table, BarChart3 } from "lucide-react"

interface DatabaseStats {
  table_name: string
  record_count: number
}

interface DatabaseStatsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DatabaseStatsModal({ isOpen, onClose }: DatabaseStatsModalProps) {
  const [stats, setStats] = useState<DatabaseStats[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchStats()
    }
  }, [isOpen])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/database-stats")
      const data = await response.json()
      setStats(data.stats || [])
    } catch (error) {
      console.error("Failed to fetch database stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalRecords = stats.reduce((sum, stat) => sum + Number(stat.record_count), 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database Statistics</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="secondary">Total Records: {totalRecords.toLocaleString()}</Badge>
            <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="space-y-3">
            {stats.map((stat) => (
              <Card key={stat.table_name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Table className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium capitalize">{stat.table_name.replace("_", " ")}</span>
                    </div>
                    <Badge variant="outline">{Number(stat.record_count).toLocaleString()}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {stats.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No database statistics available</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p>Loading statistics...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
