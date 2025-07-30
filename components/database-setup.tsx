"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useDatabase } from "@/hooks/use-database"

export function DatabaseSetup() {
  const { initialize, isLoading, error } = useDatabase()
  const [setupStatus, setSetupStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const handleSetup = async () => {
    setSetupStatus("loading")
    try {
      await initialize()
      setSetupStatus("success")
    } catch (err) {
      setSetupStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ReVive</h1>
          <p className="text-gray-600">Initialize your database to get started</p>
        </div>

        <Button onClick={handleSetup} disabled={isLoading || setupStatus === "loading"} className="w-full mb-4">
          {isLoading || setupStatus === "loading" ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Setting up...
            </>
          ) : (
            "Initialize Database"
          )}
        </Button>

        {setupStatus === "success" && (
          <div className="text-green-600 text-sm text-center">✅ Database initialized successfully!</div>
        )}

        {(error || setupStatus === "error") && (
          <div className="text-red-600 text-sm text-center">❌ {error || "Setup failed"}</div>
        )}
      </div>
    </div>
  )
}
