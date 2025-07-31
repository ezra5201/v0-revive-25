"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Users, Settings, Database, MessageSquare, FileText, Menu, X } from "lucide-react"
import { AlertHeaderIndicator } from "./alert-header-indicator"
import { DatabaseStatsModal } from "./database-stats-modal"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "CM Contacts", href: "/cm", icon: Users },
  { name: "OT Contacts", href: "/ot", icon: Users },
  { name: "Contact Log", href: "/contact-log", icon: FileText },
  { name: "Outreach", href: "/outreach", icon: MessageSquare },
  { name: "Sync", href: "/sync", icon: Database },
  { name: "Setup", href: "/setup", icon: Settings },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showDatabaseStats, setShowDatabaseStats] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-bold text-xl">ReVive 25</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href}>
                    <Button variant={isActive ? "default" : "ghost"} size="sm" className="flex items-center space-x-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              <AlertHeaderIndicator />

              <Button variant="ghost" size="sm" onClick={() => setShowDatabaseStats(true)}>
                <Database className="h-4 w-4" />
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="py-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                      <Button variant={isActive ? "default" : "ghost"} size="sm" className="w-full justify-start">
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      <DatabaseStatsModal isOpen={showDatabaseStats} onClose={() => setShowDatabaseStats(false)} />
    </>
  )
}
