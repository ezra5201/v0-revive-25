"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Filter, Plus } from "lucide-react"

export default function RunLogPage() {
  // Get today's date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Mock user name - in real app this would come from auth
  const userName = "John Doe"

  // Mock contacts data - initially empty as requested
  const contacts: Array<{ location: string; name: string }> = []

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Image
            src="/revive-impact-logo.png"
            alt="ReVive IMPACT Logo"
            width={120}
            height={34}
            className="h-8 w-auto"
            priority
          />
          <div className="text-sm font-medium text-muted-foreground">{userName}</div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Run Log</h1>
              <p className="text-lg text-muted-foreground">{today}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="lg" className="border-2 hover:bg-muted/50 bg-transparent">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Contact
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Contacts Table */}
          <div className="border-2 border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-lg font-semibold text-foreground py-4 px-6">Location</TableHead>
                  <TableHead className="text-lg font-semibold text-foreground py-4 px-6">Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-12 text-lg text-muted-foreground">
                      No contacts logged today. Tap "+ Contact" to add your first entry.
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact, index) => (
                    <TableRow key={index} className="hover:bg-muted/30">
                      <TableCell className="py-4 px-6 text-lg font-medium">{contact.location}</TableCell>
                      <TableCell className="py-4 px-6 text-lg">{contact.name}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
