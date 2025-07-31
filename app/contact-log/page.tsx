"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, User, Building, FileText, CheckCircle, Clock } from "lucide-react"

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

export default function ContactLogPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [serviceFilter, setServiceFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchContacts()
  }, [])

  useEffect(() => {
    filterContacts()
  }, [contacts, searchTerm, serviceFilter, statusFilter])

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts")
      const data = await response.json()
      setContacts(data.contacts || [])
    } catch (error) {
      console.error("Failed to fetch contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterContacts = () => {
    let filtered = contacts

    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.service_type?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (serviceFilter !== "all") {
      filtered = filtered.filter((contact) => contact.service_type === serviceFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((contact) =>
        statusFilter === "completed" ? contact.service_completed : !contact.service_completed,
      )
    }

    setFilteredContacts(filtered)
  }

  const getUniqueServices = () => {
    const services = contacts.map((c) => c.service_type).filter(Boolean)
    return [...new Set(services)]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading contact log...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Contact Log</h1>
          <Badge variant="secondary">
            {filteredContacts.length} of {contacts.length} contacts
          </Badge>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search clients, providers, or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Service Type</label>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {getUniqueServices().map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact List */}
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{contact.client_name}</h3>
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
                  <div className="text-sm text-gray-500">ID: {contact.id}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Provider:</strong> {contact.provider_name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Service:</strong> {contact.service_type || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Date:</strong> {formatDate(contact.contact_date)}
                    </span>
                  </div>
                </div>

                {contact.notes && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">{contact.notes}</p>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">Created: {formatDate(contact.created_at)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No contacts found matching your filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
