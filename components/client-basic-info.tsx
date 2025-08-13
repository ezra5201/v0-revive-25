"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock } from "lucide-react"
import { GoalWidget } from "./goal-widget"

interface ClientData {
  name: string
  category: string
  active: boolean
  created_at: string
  updated_at: string
}

interface ClientBasicInfoProps {
  clientData: ClientData
  contactHistoryLength: number
}

export function ClientBasicInfo({ clientData, contactHistoryLength }: ClientBasicInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "prospect":
        return "bg-yellow-100 text-yellow-800"
      case "client":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-lg font-semibold text-gray-900">{clientData.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <div className="mt-1">
                <Badge className={getCategoryColor(clientData.category)}>{clientData.category}</Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge className={clientData.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {clientData.active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">First Added</label>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-gray-900">{formatDate(clientData.created_at)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-400" />
                <p className="text-gray-900">{formatDate(clientData.updated_at)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total Contacts</label>
              <p className="text-2xl font-bold text-blue-600">{contactHistoryLength}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1">
        <GoalWidget clientName={clientData.name} />
      </div>
    </div>
  )
}
