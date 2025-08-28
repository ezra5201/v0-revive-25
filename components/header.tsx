"use client"

import { Button } from "@/components/ui/button"
import { Menu, User, Settings } from "lucide-react"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AlertHeaderIndicator } from "./alert-header-indicator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DatabaseStatsModal } from "./database-stats-modal"
import Image from "next/image"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const navigationItems = [
    { name: "CONTACT LOG", path: "/contact-log" },
    { name: "CM", path: "/cm" },
    { name: "OT", path: "/ot" },
    { name: "OUTREACH", path: "/outreach" },
    { name: "DASHBOARD", path: "/dashboard" },
    { name: "REPORTS", path: "/reports" },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  const isActivePath = (path: string) => {
    return pathname === path
  }

  return (
    <header className="bg-white border-b border-gray-200 relative z-50">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <div className="flex items-center">
              <Image
                src="/revive-impact-logo.png"
                alt="ReVive IMPACT"
                width={160}
                height={40}
                className="h-8 sm:h-10 w-auto"
                priority
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`px-4 py-2 text-sm min-h-[44px] flex items-center rounded transition-colors ${
                    isActivePath(item.path)
                      ? "bg-orange-500 text-white font-bold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium"
                  }`}
                >
                  {item.name}
                </button>
              ))}

              {/* Alert Indicator - Prominently positioned after navigation */}
              <div className="ml-4">
                <AlertHeaderIndicator />
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden min-h-[44px] min-w-[44px]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Right side - Search and User */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* User Dropdown Menu - Hidden on very small screens */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden md:flex text-sm text-gray-700 hover:text-gray-900 min-h-[44px]"
                >
                  Andrea Leflore
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="min-h-[44px] flex items-center">
                  <span className="text-blue-600 hover:text-blue-800">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Icon for small screens */}
            <Button variant="ghost" size="sm" className="md:hidden min-h-[44px] min-w-[44px]">
              <User className="h-5 w-5" />
            </Button>

            {/* Settings/Cog Icon with Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex min-h-[44px] min-w-[44px]">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsStatsModalOpen(true)} className="min-h-[44px] flex items-center">
                  Database Statistics
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`px-4 py-3 text-sm text-left min-h-[44px] flex items-center rounded transition-colors ${
                    isActivePath(item.path)
                      ? "bg-orange-500 text-white font-bold"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-medium"
                  }`}
                >
                  {item.name}
                </button>
              ))}

              {/* Mobile Alert Indicator */}
              <div className="px-4 py-3 min-h-[44px] flex items-center">
                <AlertHeaderIndicator />
              </div>
            </nav>

            {/* Mobile User Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm text-gray-700 hover:text-gray-900 p-3 min-h-[44px]">
                    Andrea Leflore
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem className="min-h-[44px] flex items-center">
                    <span className="text-blue-600 hover:text-blue-800">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Settings Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px]">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsStatsModalOpen(true)}
                    className="min-h-[44px] flex items-center"
                  >
                    Database Statistics
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>

      {/* Database Stats Modal */}
      <DatabaseStatsModal open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen} />
    </header>
  )
}
