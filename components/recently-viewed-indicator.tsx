"use client"

import { Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useRecentlyViewed } from "@/hooks/use-recently-viewed"
import { Badge } from "@/components/ui/badge"

interface RecentlyViewedIndicatorProps {
  onClientSelect: (clientName: string) => void
}

export function RecentlyViewedIndicator({ onClientSelect }: RecentlyViewedIndicatorProps) {
  const { clients, currentClient, removeClient, clearAll } = useRecentlyViewed()

  if (clients.length === 0) return null

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return "just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative min-h-[44px] min-w-[44px]">
          <Users className="h-5 w-5" />
          {clients.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-orange-500 hover:bg-orange-600">
              {clients.length}
            </Badge>
          )}
          <span className="sr-only">Recently viewed clients</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <div className="px-2 py-1.5 text-sm font-semibold text-gray-900">Recently Viewed Clients</div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {clients.map((client) => (
            <DropdownMenuItem
              key={client.name}
              className="flex items-center justify-between cursor-pointer min-h-[44px]"
              onSelect={() => onClientSelect(client.name)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 truncate">{client.name}</span>
                  {currentClient === client.name && (
                    <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500">{formatTimeAgo(client.viewedAt)}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeClient(client.name)
                }}
                className="ml-2 h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove {client.name}</span>
              </Button>
            </DropdownMenuItem>
          ))}
        </div>
        {clients.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer min-h-[44px]"
              onSelect={clearAll}
            >
              Clear All
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
