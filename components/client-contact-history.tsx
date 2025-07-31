"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Building, FileText, CheckCircle, Clock, Edit } from "lucide-react"

interface Contact {
  id: number
  provider_name: string
  service_type: string
  contact_date: string
  notes: string
  service_completed: boolean
}

interface ClientContactHistoryProps {
  contacts: Contact[]
  onEditContact?: (contact: Contact) => void
}

export function ClientContactHistory({ contacts, onEditContact }: ClientContactHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const sortedContacts = [...contacts].sort(
    (a, b) => new Date(b.contact_date).getTime() - new Date(a.contact_date).getTime(),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Contact History</span>
          <Badge variant="secondary">{contacts.length} contacts</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedContacts.map((contact) => (
            <div key={contact.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatDate(contact.contact_date)}</span>
                  <Badge variant={contact.service_completed ? "default" : "secondary"}>
                    {contact.service_completed ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" /> Completed
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3 mr-1" /> Pending
                      </>
                    )}
                  </Badge>
                </div>
                {onEditContact && (
                  <Button variant="ghost" size="sm" onClick={() => onEditContact(contact)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Provider:</strong> {contact.provider_name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Service:</strong> {contact.service_type || "N/A"}
                  </span>
                </div>
              </div>

              {contact.notes && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">{contact.notes}</p>
                </div>
              )}
            </div>
          ))}

          {contacts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No contact history available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
