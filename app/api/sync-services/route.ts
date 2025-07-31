import { type NextRequest, NextResponse } from "next/server"
import { syncMonthlyServiceSummary } from "@/lib/sync-monthly-summary"

/**
 * Request body interface for sync endpoint
 */
interface SyncRequest {
  month?: number
  year?: number
}

/**
 * Response interface for sync endpoint
 */
interface SyncResponse {
  success: boolean
  data?: {
    month: number
    year: number
    recordsProcessed: number
    message: string
    timestamp: string
    duration: number
  }
  error?: string
  timing: {
    startTime: string
    endTime: string
    totalDuration: number
  }
}

/**
 * POST /api/sync-services
 * Triggers monthly service summary synchronization
 */
export async function POST(request: NextRequest): Promise<NextResponse<SyncResponse>> {
  const startTime = Date.now()
  const startTimestamp = new Date().toISOString()

  try {
    // Parse request body
    let body: SyncRequest = {}

    try {
      const text = await request.text()
      if (text) {
        body = JSON.parse(text)
      }
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
          timing: {
            startTime: startTimestamp,
            endTime: new Date().toISOString(),
            totalDuration: Date.now() - startTime,
          },
        },
        { status: 400 },
      )
    }

    // Validate request parameters
    if (body.month !== undefined && (body.month < 1 || body.month > 12)) {
      return NextResponse.json(
        {
          success: false,
          error: "Month must be between 1 and 12",
          timing: {
            startTime: startTimestamp,
            endTime: new Date().toISOString(),
            totalDuration: Date.now() - startTime,
          },
        },
        { status: 400 },
      )
    }

    if (body.year !== undefined && (body.year < 1900 || body.year > 2099)) {
      return NextResponse.json(
        {
          success: false,
          error: "Year must be between 1900 and 2099",
          timing: {
            startTime: startTimestamp,
            endTime: new Date().toISOString(),
            totalDuration: Date.now() - startTime,
          },
        },
        { status: 400 },
      )
    }

    console.log(`API: Starting sync for month=${body.month || "current"}, year=${body.year || "current"}`)

    // Call sync function
    const result = await syncMonthlyServiceSummary(body.month, body.year)

    const endTime = Date.now()
    const endTimestamp = new Date().toISOString()

    if (result.success) {
      console.log(`API: Sync completed successfully - ${result.message}`)

      return NextResponse.json({
        success: true,
        data: {
          month: result.month,
          year: result.year,
          recordsProcessed: result.recordsProcessed,
          message: result.message,
          timestamp: result.timestamp,
          duration: result.duration,
        },
        timing: {
          startTime: startTimestamp,
          endTime: endTimestamp,
          totalDuration: endTime - startTime,
        },
      })
    } else {
      console.error(`API: Sync failed - ${result.message}`)

      return NextResponse.json(
        {
          success: false,
          error: result.message,
          timing: {
            startTime: startTimestamp,
            endTime: endTimestamp,
            totalDuration: endTime - startTime,
          },
        },
        { status: 500 },
      )
    }
  } catch (error) {
    const endTime = Date.now()
    const endTimestamp = new Date().toISOString()
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    console.error("API: Unexpected error during sync:", error)

    return NextResponse.json(
      {
        success: false,
        error: `Internal server error: ${errorMessage}`,
        timing: {
          startTime: startTimestamp,
          endTime: endTimestamp,
          totalDuration: endTime - startTime,
        },
      },
      { status: 500 },
    )
  }
}
