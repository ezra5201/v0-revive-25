"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Database, CheckCircle, AlertTriangle, Loader2, Play, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SetupStep {
  id: string
  title: string
  description: string
  status: "pending" | "running" | "completed" | "error"
  action: () => Promise<void>
}

export function DatabaseSetup() {
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: "tables",
      title: "Create Database Tables",
      description: "Initialize contacts and summary tables",
      status: "pending",
      action: async () => {
        const response = await fetch("/api/setup", { method: "POST" })
        if (!response.ok) throw new Error("Failed to create tables")
      },
    },
    {
      id: "sample-data",
      title: "Generate Sample Data",
      description: "Create 100 sample contact records",
      status: "pending",
      action: async () => {
        const response = await fetch("/api/generate-contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: 100 }),
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
        description: `Failed: ${step.title}`,
        variant: "destructive",
      })
    }
  }

  const runAllSteps = async () => {
    setIsRunning(true)

    for (const step of setupSteps) {
      if (step.status === "completed") continue
      await runStep(step)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    setIsRunning(false)
  }

  const getStepIcon = (status: SetupStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Settings className="h-4 w-4 text-gray-400" />
    }
  }

  const completedSteps = setupSteps.filter((step) => step.status === "completed").length
  const totalSteps = setupSteps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Database Setup</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Setup Progress</span>
            <span>
              {completedSteps}/{totalSteps} completed
            </span>
          </div>
          <Progress value={progressPercentage} />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {setupSteps.map((step) => (
            <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStepIcon(step.status)}
                <div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    step.status === "completed"
                      ? "default"
                      : step.status === "error"
                        ? "destructive"
                        : step.status === "running"
                          ? "secondary"
                          : "outline"
                  }
                >
                  {step.status}
                </Badge>
                {step.status === "pending" && (
                  <Button size="sm" onClick={() => runStep(step)} disabled={isRunning}>
                    <Play className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center">
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
            <AlertDescription>Database setup completed successfully! Your system is ready to use.</AlertDescription>
          </Alert>
        )}

        {setupSteps.some((step) => step.status === "error") && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Some setup steps failed. Please check the errors and try again.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
