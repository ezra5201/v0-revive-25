import { NextResponse } from "next/server"
import { syncMonthlyServiceSummary } from "@/lib/sync-monthly-summary"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { month, year } = body

    const startTime = Date.now()
    const result = await syncMonthlyServiceSummary(month, year)
    const executionTime = Date.now() - startTime

    return NextResponse.json({
      ...result,
      executionTime,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Sync API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: `API error: ${error instanceof Error ? error.message : "Unknown error"}`,
        recordsProcessed: 0,
        executionTime: 0,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
