import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getTodayString } from "@/lib/date-utils"

export async function GET() {
  if (!sql) {
    return NextResponse.json({ hasFutureDates: false })
  }

  try {
    const todayString = getTodayString()

    // Check for any contacts with dates after today
    const futureDates = await sql`
      SELECT COUNT(*) as count
      FROM contacts 
      WHERE contact_date > (${todayString})::DATE
    `

    const hasFutureDates = futureDates[0].count > 0

    console.log(`Future dates check: ${futureDates[0].count} records found after ${todayString}`)

    return NextResponse.json({
      hasFutureDates,
      count: futureDates[0].count,
      todayInChicago: todayString,
    })
  } catch (error) {
    console.error("Failed to check for future dates:", error)
    return NextResponse.json({ hasFutureDates: false })
  }
}
