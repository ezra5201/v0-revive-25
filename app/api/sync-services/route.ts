import { type NextRequest, NextResponse } from "next/server"
import { syncMonthlyServiceSummary } from "@/lib/sync-monthly-summary"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, year } = body

    // Validate month and year if provided
    if (month !== undefined && (month < 1 || month > 12)) {
      return NextResponse.json({ success: false, message: "Month must be between 1 and 12" }, { status: 400 })
    }

    if (year !== undefined && (year < 1900 || year > new Date().getFullYear() + 1)) {
      return NextResponse.json({ success: false, message: "Year must be between 1900 and next year" }, { status: 400 })
    }

    const result = await syncMonthlyServiceSummary(month, year)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Sync API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        recordsProcessed: 0,
      },
      { status: 500 },
    )
  }
}
