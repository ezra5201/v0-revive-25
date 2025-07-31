import { type NextRequest, NextResponse } from "next/server"
import { syncMonthlyServiceSummary } from "@/lib/sync-monthly-summary"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const { month, year } = body

    // Validate input types if provided
    if (month !== undefined && (typeof month !== "number" || !Number.isInteger(month))) {
      return NextResponse.json(
        {
          success: false,
          error: "Month must be an integer",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    if (year !== undefined && (typeof year !== "number" || !Number.isInteger(year))) {
      return NextResponse.json(
        {
          success: false,
          error: "Year must be an integer",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    console.log(`API: Starting sync request for month=${month}, year=${year}`)

    // Call sync function
    const result = await syncMonthlyServiceSummary(month, year)

    const endTime = Date.now()
    const apiDuration = endTime - startTime

    // Return detailed response
    return NextResponse.json(
      {
        ...result,
        apiDuration: `${apiDuration}ms`,
        requestTimestamp: new Date().toISOString(),
      },
      {
        status: result.success ? 200 : 500,
      },
    )
  } catch (error) {
    const endTime = Date.now()
    const apiDuration = endTime - startTime

    console.error("API: Sync request failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown server error",
        apiDuration: `${apiDuration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
