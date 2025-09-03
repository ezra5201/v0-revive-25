"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Users, Calendar, Activity } from "lucide-react"
import { useState } from "react"

interface AllClientsReportHeaderProps {
  totalClients?: number
  totalContacts?: number
  activeClients?: number
}

export function AllClientsReportHeader({
  totalClients = 0,
  totalContacts = 0,
  activeClients = 0,
}: AllClientsReportHeaderProps) {
  const [dateRange, setDateRange] = useState("all-time")

  const handleExport = () => {
    // TODO: Implement CSV export functionality
    console.log("Exporting All Clients report...")
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">All Clients Report</h1>
          <p className="text-sm text-gray-600 mt-1">Comprehensive client contact and service delivery overview</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">Total Clients</p>
              <p className="text-2xl font-bold text-blue-600">{totalClients.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-900">Total Contacts</p>
              <p className="text-2xl font-bold text-green-600">{totalContacts.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-orange-900">Reporting Period</p>
              <p className="text-lg font-semibold text-orange-600">
                {dateRange === "all-time"
                  ? "All Time"
                  : dateRange === "this-year"
                    ? "2025"
                    : dateRange === "last-30-days"
                      ? "Last 30 Days"
                      : "Last 90 Days"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
