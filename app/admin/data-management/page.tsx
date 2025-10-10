"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Database, Search, Trash2, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

interface ClientSummary {
  client: {
    id: number
    name: string
    category: string
    active: boolean
    created_at: string
  }
  data_summary: {
    contacts: number
    cm_checkins: number
    cm_goals: number
    ot_checkins: number
    ot_goals: number
    intake_forms: number
    alerts: number
  }
}

export default function DataManagementPage() {
  const [searchName, setSearchName] = useState("")
  const [clientSummary, setClientSummary] = useState<ClientSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [confirmationName, setConfirmationName] = useState("")
  const [deleting, setDeleting] = useState(false)

  const handleSearch = async () => {
    if (!searchName.trim()) {
      toast.error("Please enter a client name")
      return
    }

    setLoading(true)
    setClientSummary(null)

    try {
      const response = await fetch("/api/admin/data-management/client-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_name: searchName.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch client data")
      }

      setClientSummary(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch client data")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setConfirmationName("")
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!clientSummary) return

    if (confirmationName !== clientSummary.client.name) {
      toast.error("Client name does not match")
      return
    }

    setDeleting(true)

    try {
      const response = await fetch("/api/admin/data-management/delete-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: clientSummary.client.name,
          confirmation_name: confirmationName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete client data")
      }

      toast.success(`All data for "${clientSummary.client.name}" has been permanently deleted`)
      setShowDeleteDialog(false)
      setClientSummary(null)
      setSearchName("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete client data")
    } finally {
      setDeleting(false)
    }
  }

  const totalRecords = clientSummary
    ? Object.values(clientSummary.data_summary).reduce((sum, count) => sum + count, 0)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-6 w-6 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
          </div>
          <p className="text-gray-600">HIPAA-compliant client data retention and deletion</p>
        </div>

        {/* Warning Alert */}
        <Alert variant="destructive" className="mb-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Permanent Data Deletion</AlertTitle>
          <AlertDescription>
            This tool permanently deletes ALL client data including contacts, goals, check-ins, and intake forms. This
            action CANNOT be undone and is logged for HIPAA compliance.
          </AlertDescription>
        </Alert>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Client</CardTitle>
            <CardDescription>Enter the exact client name to view their data summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter client name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client Summary */}
        {clientSummary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Client Data Summary</CardTitle>
              <CardDescription>All data associated with {clientSummary.client.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Client Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {clientSummary.client.name}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {clientSummary.client.category}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {clientSummary.client.active ? "Active" : "Inactive"}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(clientSummary.client.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Data Counts */}
                <div>
                  <h4 className="font-semibold mb-3">Records to be Deleted:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(clientSummary.data_summary).map(([key, count]) => (
                      <div key={key} className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="capitalize">{key.replace(/_/g, " ")}:</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex justify-between font-bold text-red-900">
                      <span>Total Records:</span>
                      <span>{totalRecords}</span>
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <Button variant="destructive" onClick={handleDeleteClick} className="w-full" size="lg">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All Client Data
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirm Permanent Deletion
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. All data for this client will be permanently deleted and logged for HIPAA
                compliance.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="confirm-name" className="text-sm font-medium">
                Type the client name to confirm: <span className="font-bold">{clientSummary?.client.name}</span>
              </Label>
              <Input
                id="confirm-name"
                value={confirmationName}
                onChange={(e) => setConfirmationName(e.target.value)}
                placeholder="Type client name..."
                className="mt-2"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleting || confirmationName !== clientSummary?.client.name}
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
