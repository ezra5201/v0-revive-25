"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Building, Phone, Mail, MapPin } from "lucide-react"

interface ClientBasicInfoProps {
  clientName: string
  totalContacts: number
  firstContact: string
  lastContact: string
  primaryProvider?: string
  contactInfo?: {
    phone?: string
    email?: string
    address?: string
  }
}

export function ClientBasicInfo({
  clientName,
  totalContacts,
  firstContact,
  lastContact,
  primaryProvider,
  contactInfo,
}: ClientBasicInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const daysSinceLastContact = Math.floor(
    (new Date().getTime() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24),
  )

  const getActivityStatus = () => {
    if (daysSinceLastContact <= 7) return { label: "Active", color: "bg-green-100 text-green-800" }
    if (daysSinceLastContact <= 30) return { label: "Recent", color: "bg-yellow-100 text-yellow-800" }
    return { label: "Inactive", color: "bg-red-100 text-red-800" }
  }

  const activityStatus = getActivityStatus()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Client Information</span>
          </div>
          <Badge className={activityStatus.color}>{activityStatus.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">{clientName}</h2>
          <p className="text-sm text-muted-foreground">{totalContacts} total contacts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">First Contact</p>
                <p className="text-sm text-muted-foreground">{formatDate(firstContact)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Contact</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(lastContact)} ({daysSinceLastContact} days ago)
                </p>
              </div>
            </div>

            {primaryProvider && (
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Primary Provider</p>
                  <p className="text-sm text-muted-foreground">{primaryProvider}</p>
                </div>
              </div>
            )}
          </div>

          {contactInfo && (
            <div className="space-y-3">
              {contactInfo.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.phone}</p>
                  </div>
                </div>
              )}

              {contactInfo.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.email}</p>
                  </div>
                </div>
              )}

              {contactInfo.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{contactInfo.address}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
