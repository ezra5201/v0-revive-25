import { type NextRequest, NextResponse } from "next/server"
import { syncMonthlyServiceSummary } from "@/lib/sync-monthly-summary"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { month, year } = body

    // Validate input types if provided
    if (month !== undefined && (typeof month !== "number" || month < 1 || month > 12)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid month parameter. Must be a number between 1 and 12.",
        },
        { status: 400 },
      )
    }

    if (year !== undefined && (typeof year !== "number" || year < 1900 || year > 2099)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid year parameter. Must be a number between 1900 and 2099.",
        },
        { status: 400 },
      )
    }

    // Call the sync function
    const result = await syncMonthlyServiceSummary(month, year)
    const endTime = Date.now()
    const duration = endTime - startTime

    if (result.success) {
      return NextResponse.json({
        ...result,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          ...result,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime

    console.error("API Error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        recordsProcessed: 0,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
