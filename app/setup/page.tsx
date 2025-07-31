"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSetup = async () => {
    setStatus("loading")
    setMessage("Initializing database...")

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
      })

      const result = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(result.message)
      } else {
        setStatus("error")
        setMessage(result.error || "Setup failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage("Failed to connect to setup API")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Database Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Initialize your ReVive database with tables and sample data.
          </p>

          <Button onClick={handleSetup} disabled={status === "loading"} className="w-full">
            {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === "loading" ? "Setting up..." : "Initialize Database"}
          </Button>

          {status === "success" && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          {status === "success" && (
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full bg-transparent">
                <a href="/">Go to Contact Log</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
