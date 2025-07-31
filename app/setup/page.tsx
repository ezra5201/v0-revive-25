"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Database, Loader2 } from "lucide-react"

export default function SetupPage() {
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetup = async () => {
    setIsSettingUp(true)
    setError(null)

    try {
      const response = await fetch("/api/setup", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Setup failed")
      }

      setSetupComplete(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed")
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Database className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Database Setup</CardTitle>
          <CardDescription>Initialize your ReVive Impact Tracker database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {setupComplete ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="font-semibold text-green-700">Setup Complete!</h3>
                <p className="text-sm text-gray-600">Your database has been initialized successfully.</p>
              </div>
              <Button onClick={() => (window.location.href = "/dashboard")} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>This will create the necessary database tables:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Contacts</li>
                  <li>Clients</li>
                  <li>Monthly Service Summary</li>
                  <li>Alerts</li>
                </ul>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button onClick={handleSetup} disabled={isSettingUp} className="w-full">
                {isSettingUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Initialize Database"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
