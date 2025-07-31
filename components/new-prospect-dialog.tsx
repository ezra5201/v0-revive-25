"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NewProspectDialogProps {
  isOpen: boolean
  onClose: () => void
  onProspectAdded: () => void
}

const serviceTypes = [
  "Case Management",
  "Occupational Therapy",
  "Food",
  "Healthcare",
  "Housing",
  "Employment",
  "Benefits",
  "Legal",
  "Transportation",
  "Mental Health",
  "Substance Abuse",
  "Education",
]

const providers = [
  "ReVive Center",
  "Community Health",
  "Social Services",
  "Legal Aid",
  "Job Center",
  "Healthcare Partners",
]

export function NewProspectDialog({ isOpen, onClose, onProspectAdded }: NewProspectDialogProps) {
  const [formData, setFormData] = useState({
    client_name: "",
    provider_name: "",
    service_type: "",
    contact_date: new Date().toISOString().split("T")[0],
    notes: "",
    service_completed: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "New prospect added successfully",
        })
        onProspectAdded()
        onClose()
        setFormData({
          client_name: "",
          provider_name: "",
          service_type: "",
          contact_date: new Date().toISOString().split("T")[0],
          notes: "",
          service_completed: false,
        })
      } else {
        throw new Error("Failed to add prospect")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add new prospect",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Add New Prospect</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="client_name">Client Name *</Label>
            <Input
              id="client_name"
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              placeholder="Enter client name"
              required
            />
          </div>

          <div>
            <Label htmlFor="provider_name">Provider</Label>
            <Select
              value={formData.provider_name}
              onValueChange={(value) => setFormData({ ...formData, provider_name: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="service_type">Service Type</Label>
            <Select
              value={formData.service_type}
              onValueChange={(value) => setFormData({ ...formData, service_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="contact_date">Contact Date</Label>
            <Input
              id="contact_date"
              type="date"
              value={formData.contact_date}
              onChange={(e) => setFormData({ ...formData, contact_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Prospect"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
