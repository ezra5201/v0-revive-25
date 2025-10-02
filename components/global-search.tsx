"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Command } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface GlobalSearchProps {
  onClientSelect?: (clientName: string) => void
  clients?: string[]
}

export function GlobalSearch({ onClientSelect, clients = [] }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredClients, setFilteredClients] = useState<string[]>([])

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Filter clients based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredClients([])
    } else {
      const filtered = clients.filter((client) => client.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredClients(filtered.slice(0, 10)) // Limit to 10 results
    }
  }, [searchQuery, clients])

  const handleClientClick = useCallback(
    (clientName: string) => {
      onClientSelect?.(clientName)
      setIsOpen(false)
      setSearchQuery("")
    },
    [onClientSelect],
  )

  return (
    <>
      {/* Search Bar Trigger */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-3">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full max-w-2xl mx-auto flex items-center space-x-3 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Search className="h-4 w-4 text-gray-400" />
            <span className="flex-1 text-left text-sm text-gray-500">Search clients, locations...</span>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Command className="h-3 w-3" />
              <span>K</span>
            </div>
          </button>
        </div>
      </div>

      {/* Search Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            {/* Search Results */}
            {filteredClients.length > 0 && (
              <div className="space-y-1 max-h-96 overflow-y-auto">
                <p className="text-xs text-gray-500 px-2 py-1">Clients</p>
                {filteredClients.map((client) => (
                  <button
                    key={client}
                    onClick={() => handleClientClick(client)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-sm font-medium">{client}</p>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.trim() !== "" && filteredClients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No results found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
