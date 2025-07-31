import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const { targetDate } = await request.json()

    if (!targetDate) {
      return NextResponse.json({ success: false, error: "Target date is required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Update all future dates to the target date
    const result = await sql`
      UPDATE contacts 
      SET contact_date = ${targetDate}
      WHERE contact_date > CURRENT_DATE
    `

    return NextResponse.json({
      success: true,
      updatedCount: result.count || 0,
    })
  } catch (error) {
    console.error("Emergency fix dates error:", error)
    return NextResponse.json({ success: false, error: "Failed to fix dates" }, { status: 500 })
  }
}
