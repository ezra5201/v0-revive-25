"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Calendar, CheckCircle, Clock, User } from "lucide-react"
import { ChangeDateDialog } from "./change-date-dialog"

interface Contact {
  id: number
  client_name: string
  provider_name: string
  service_type: string
  contact_date: string
  notes: string
  service_completed: boolean
  created_at: string
}

interface ContactTableProps {
  contacts: Contact[]
  onViewClient: (clientName: string) => void
  onRefresh: () => void
}

export function ContactTable({ contacts, onViewClient, onRefresh }: ContactTableProps) {
  const [changeDateDialog, setChangeDateDialog] = useState<{
    isOpen: boolean
    contactId: number
    currentDate: string
    clientName: string
  }>({
    isOpen: false,
    contactId: 0,
    currentDate: "",
    clientName: "",
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const handleChangeDate = (contact: Contact) => {
    setChangeDateDialog({
      isOpen: true,
      contactId: contact.id,
      currentDate: contact.contact_date,
      clientName: contact.client_name,
    })
  }

  const handleDateChanged = () => {
    onRefresh()
    setChangeDateDialog((prev) => ({ ...prev, isOpen: false }))
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium text-left"
                    onClick={() => onViewClient(contact.client_name)}
                  >
                    {contact.client_name}
                  </Button>
                </TableCell>
                <TableCell>{contact.provider_name || "N/A"}</TableCell>
                <TableCell>{contact.service_type || "N/A"}</TableCell>
                <TableCell>{formatDate(contact.contact_date)}</TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={contact.notes}>
                    {contact.notes || "No notes"}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewClient(contact.client_name)}>
                        <User className="h-4 w-4 mr-2" />
                        View Client
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeDate(contact)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Change Date
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ChangeDateDialog
        isOpen={changeDateDialog.isOpen}
        onClose={() => setChangeDateDialog((prev) => ({ ...prev, isOpen: false }))}
        contactId={changeDateDialog.contactId}
        currentDate={changeDateDialog.currentDate}
        clientName={changeDateDialog.clientName}
        onDateChanged={handleDateChanged}
      />
    </>
  )
}
