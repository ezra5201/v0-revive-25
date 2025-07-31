import { type NextRequest, NextResponse } from "next/server"
import { syncMonthlyServiceSummary } from "@/lib/sync-monthly-summary"

interface SyncRequest {
  month?: number
  year?: number
}

interface SyncResponse {
  success: boolean
  message: string
  recordsProcessed: number
  executionTime: number
  timestamp: string
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  try {
    const body: SyncRequest = await request.json()
    const { month, year } = body

    // Validate input if provided
    if (month !== undefined && (month < 1 || month > 12)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid month. Must be between 1 and 12.",
          recordsProcessed: 0,
          executionTime: Date.now() - startTime,
          timestamp,
        } as SyncResponse,
        { status: 400 },
      )
    }

    if (year !== undefined && (year < 1900 || year > 2099)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid year. Must be between 1900 and 2099.",
          recordsProcessed: 0,
          executionTime: Date.now() - startTime,
          timestamp,
        } as SyncResponse,
        { status: 400 },
      )
    }

    // Call the sync function
    const result = await syncMonthlyServiceSummary(month, year)
    const executionTime = Date.now() - startTime

    const response: SyncResponse = {
      ...result,
      executionTime,
      timestamp,
    }

    return NextResponse.json(response, {
      status: result.success ? 200 : 500,
    })
  } catch (error) {
    const executionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        success: false,
        message: `Sync failed: ${errorMessage}`,
        recordsProcessed: 0,
        executionTime,
        timestamp,
      } as SyncResponse,
      { status: 500 },
    )
  }
}
