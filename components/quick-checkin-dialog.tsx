"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QuickCheckinDialogProps {
  isOpen: boolean
  onClose: () => void
  onCheckinAdded: () => void
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
]

export function QuickCheckinDialog({ isOpen, onClose, onCheckinAdded }: QuickCheckinDialogProps) {
  const [formData, setFormData] = useState({
    client_name: "",
    service_type: "",
    notes: "",
    service_completed: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          contact_date: new Date().toISOString().split("T")[0],
          provider_name: "Quick Check-in",
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Quick check-in recorded successfully",
        })
        onCheckinAdded()
        onClose()
        setFormData({
          client_name: "",
          service_type: "",
          notes: "",
          service_completed: false,
        })
      } else {
        throw new Error("Failed to record check-in")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record check-in",
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
            <Clock className="h-5 w-5" />
            <span>Quick Check-in</span>
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter check-in notes"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="service_completed"
              checked={formData.service_completed}
              onCheckedChange={(checked) => setFormData({ ...formData, service_completed: checked as boolean })}
            />
            <Label htmlFor="service_completed">Service completed</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Recording..." : "Record Check-in"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
