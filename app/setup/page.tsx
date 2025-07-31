"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Database, CheckCircle, AlertTriangle, Loader2, Settings, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SetupStep {
  id: string
  title: string
  description: string
  status: "pending" | "running" | "completed" | "error"
  action?: () => Promise<void>
}

export default function SetupPage() {
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: "database",
      title: "Initialize Database",
      description: "Create required tables and schema",
      status: "pending",
      action: async () => {
        const response = await fetch("/api/setup", { method: "POST" })
        if (!response.ok) throw new Error("Failed to setup database")
      },
    },
    {
      id: "sample-data",
      title: "Generate Sample Data",
      description: "Create sample contacts for testing",
      status: "pending",
      action: async () => {
        const response = await fetch("/api/generate-contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: 50 }),
        })
        if (!response.ok) throw new Error("Failed to generate sample data")
      },
    },
  ])

  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  const updateStepStatus = (stepId: string, status: SetupStep["status"]) => {
    setSetupSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  const runStep = async (step: SetupStep) => {
    if (!step.action) return

    updateStepStatus(step.id, "running")

    try {
      await step.action()
      updateStepStatus(step.id, "completed")
      toast({
        title: "Success",
        description: `${step.title} completed successfully`,
      })
    } catch (error) {
      updateStepStatus(step.id, "error")
      toast({
        title: "Error",
        description: `Failed to complete ${step.title}`,
        variant: "destructive",
      })
    }
  }

  const runAllSteps = async () => {
    setIsRunning(true)

    for (const step of setupSteps) {
      if (step.status === "completed") continue
      await runStep(step)
      // Small delay between steps
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setIsRunning(false)
  }

  const getStepIcon = (status: SetupStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Settings className="h-5 w-5 text-gray-400" />
    }
  }

  const getStepBadge = (status: SetupStep["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const completedSteps = setupSteps.filter((step) => step.status === "completed").length
  const totalSteps = setupSteps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">System Setup</h1>
          <p className="text-muted-foreground">Initialize your ReVive 25 contact management system</p>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Setup Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  {completedSteps} of {totalSteps} steps completed
                </span>
                <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div className="space-y-4">
          {setupSteps.map((step, index) => (
            <Card key={step.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                      {getStepIcon(step.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStepBadge(step.status)}
                    {step.status === "pending" && (
                      <Button size="sm" onClick={() => runStep(step)} disabled={isRunning}>
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button onClick={runAllSteps} disabled={isRunning || completedSteps === totalSteps} size="lg">
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Setup...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run All Steps
              </>
            )}
          </Button>
        </div>

        {/* Status Messages */}
        {completedSteps === totalSteps && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Setup completed successfully! Your system is ready to use.</AlertDescription>
          </Alert>
        )}

        {setupSteps.some((step) => step.status === "error") && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Some setup steps failed. Please check the errors and try again.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
