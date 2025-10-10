"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClientMasterRecord } from "./client-master-record"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"

interface ClientDrawerProps {
  isOpen: boolean
  clientName: string | null
  onClose: () => void
  onDataUpdate?: () => void
}

export function ClientDrawer({ isOpen, clientName, onClose, onDataUpdate }: ClientDrawerProps) {
  const { addClient } = useRecentlyViewed()
  const [activeSection, setActiveSection] = useState<
    "basic-info" | "contact-history" | "journey-timeline" | "cm-goals" | "ot-goals" | "ot-checkins" | "full-profile"
  >("basic-info")

  useEffect(() => {
    if (isOpen && clientName) {
      addClient(clientName)
    }
  }, [isOpen, clientName, addClient])

  useEffect(() => {
    if (isOpen) {
      setActiveSection("basic-info")
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, clientName])

  if (!isOpen || !clientName) return null

  return (
    <>
      {/* Backdrop - Desktop only */}
      <div
        className="hidden md:block fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } w-full md:w-[85%] lg:w-[80%] xl:w-[75%] overflow-y-auto`}
      >
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Client Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="min-h-[44px] min-w-[44px]">
            <X className="h-5 w-5" />
            <span className="sr-only">Close drawer</span>
          </Button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 md:p-6">
          <ClientMasterRecord
            clientName={clientName}
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            context="clients"
            currentView="list"
            showContentOnly={false}
            onDataUpdate={onDataUpdate}
          />
        </div>
      </div>
    </>
  )
}
