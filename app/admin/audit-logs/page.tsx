"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Search, ChevronLeft, ChevronRight, Shield } from "lucide-react"
import { format } from "date-fns"

interface AuditLog {
  id: number
  timestamp: string
  user_email: string
  action: "VIEW" | "CREATE" | "UPDATE" | "DELETE"
  table_name: string
  record_id: string | null
  client_name: string | null
  ip_address: string | null
  changes: any
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filter states
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [action, setAction] = useState("all")
  const [clientName, setClientName] = useState("")
  const [tableName, setTableName] = useState("")

  const fetchLogs = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })

      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      if (userEmail) params.append("userEmail", userEmail)
      if (action !== "all") params.append("action", action)
      if (clientName) params.append("clientName", clientName)
      if (tableName) params.append("tableName", tableName)

      const response = await fetch(`/api/admin/audit-logs?${params}`)
      const data = await response.json()

      setLogs(data.logs)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()

      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      if (userEmail) params.append("userEmail", userEmail)
      if (action !== "all") params.append("action", action)
      if (clientName) params.append("clientName", clientName)
      if (tableName) params.append("tableName", tableName)

      const response = await fetch(`/api/admin/audit-logs/export?${params}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to export audit logs:", error)
    }
  }

  const handleSearch = () => {
    fetchLogs(1)
  }

  const handleClearFilters = () => {
    setStartDate("")
    setEndDate("")
    setUserEmail("")
    setAction("all")
    setClientName("")
    setTableName("")
    fetchLogs(1)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "VIEW":
        return "secondary"
      case "CREATE":
        return "default"
      case "UPDATE":
        return "outline"
      case "DELETE":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          </div>
          <p className="text-gray-600">HIPAA-compliant audit trail of all data access and modifications</p>
        </div>

        {/* Filters Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter audit logs by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              {/* User Email */}
              <div>
                <label className="text-sm font-medium mb-2 block">User Email</label>
                <Input
                  type="text"
                  placeholder="Search by email..."
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>

              {/* Action Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Action Type</label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    <SelectItem value="VIEW">View</SelectItem>
                    <SelectItem value="CREATE">Create</SelectItem>
                    <SelectItem value="UPDATE">Update</SelectItem>
                    <SelectItem value="DELETE">Delete</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Client Name */}
              <div>
                <label className="text-sm font-medium mb-2 block">Client Name</label>
                <Input
                  type="text"
                  placeholder="Search by client..."
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              {/* Table Name */}
              <div>
                <label className="text-sm font-medium mb-2 block">Table Name</label>
                <Input
                  type="text"
                  placeholder="Search by table..."
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSearch} className="min-h-[44px]">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button onClick={handleClearFilters} variant="outline" className="min-h-[44px] bg-transparent">
                Clear Filters
              </Button>
              <Button onClick={handleExport} variant="outline" className="ml-auto min-h-[44px] bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Audit Log Entries</CardTitle>
                <CardDescription>
                  Showing {logs.length} of {pagination.total} total entries
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading audit logs...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No audit logs found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Record ID</TableHead>
                        <TableHead>Client Name</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Changes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                          </TableCell>
                          <TableCell className="font-medium">{log.user_email}</TableCell>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(log.action)}>{log.action}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.table_name}</TableCell>
                          <TableCell className="text-gray-600">{log.record_id || "-"}</TableCell>
                          <TableCell>{log.client_name || "-"}</TableCell>
                          <TableCell className="text-gray-600">{log.ip_address || "-"}</TableCell>
                          <TableCell>
                            {log.changes ? (
                              <details className="cursor-pointer">
                                <summary className="text-blue-600 hover:text-blue-800">View</summary>
                                <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto max-w-md">
                                  {JSON.stringify(log.changes, null, 2)}
                                </pre>
                              </details>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchLogs(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="min-h-[44px]"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchLogs(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="min-h-[44px]"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
