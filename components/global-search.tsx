"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, CommandIcon, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface GlobalSearchProps {
  onClientSelect?: (clientName: string) => void
  onNewProspect?: (searchQuery: string) => void
  clients?: { name: string }[]
}

export function GlobalSearch({ onClientSelect, onNewProspect, clients = [] }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredClients, setFilteredClients] = useState<{ name: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() === "") {
        setFilteredClients([])
        setIsOpen(false)
      } else {
        const filtered = clients.filter((client) => client.name.toLowerCase().includes(searchQuery.toLowerCase()))
        setFilteredClients(filtered.slice(0, 10)) // Limit to 10 results
        setIsOpen(true) // Show popover even when no results to display "New Prospect" button
      }
    }, 150) // Debounce delay

    return () => clearTimeout(timer)
  }, [searchQuery, clients])

  const handleClientClick = useCallback(
    (clientName: string) => {
      onClientSelect?.(clientName)
      setIsOpen(false)
      setSearchQuery("")
      inputRef.current?.blur()
    },
    [onClientSelect],
  )

  const handleNewProspectClick = useCallback(() => {
    onNewProspect?.(searchQuery)
    setIsOpen(false)
    setSearchQuery("")
    inputRef.current?.blur()
  }, [onNewProspect, searchQuery])

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 py-3">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="w-full max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
              <Input
                ref={inputRef}
                placeholder="Search clients, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim() !== "") {
                    setIsOpen(true)
                  }
                }}
                className="pl-10 pr-16 h-10 bg-gray-50 border-gray-300 hover:bg-gray-100 transition-colors"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-xs text-gray-400 pointer-events-none">
                <CommandIcon className="h-3 w-3" />
                <span>K</span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command>
              <CommandList>
                {filteredClients.length === 0 ? (
                  <div className="p-4">
                    <Button
                      onClick={handleNewProspectClick}
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      New Prospect
                    </Button>
                  </div>
                ) : (
                  <CommandGroup heading="Clients">
                    {filteredClients.map((client) => (
                      <CommandItem
                        key={client.name}
                        value={client.name}
                        onSelect={() => handleClientClick(client.name)}
                        className="cursor-pointer"
                      >
                        <Search className="mr-2 h-4 w-4 text-gray-400" />
                        <span>{client.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
