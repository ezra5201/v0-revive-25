import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getTodayString } from "@/lib/date-utils"

export async function GET() {
  if (!sql) {
    return NextResponse.json({ hasDuplicates: false })
  }

  try {
    const todayString = getTodayString()

    // Check for unique clients with today's date
    const todayClients = await sql`
      SELECT COUNT(DISTINCT client_name) as unique_clients
      FROM contacts 
      WHERE contact_date = (${todayString})::DATE
    `

    const uniqueClientsToday = todayClients[0].unique_clients
    const hasDuplicates = uniqueClientsToday > 40

    console.log(`Duplicate today dates check: ${uniqueClientsToday} unique clients for ${todayString}`)

    return NextResponse.json({
      hasDuplicates,
      uniqueClientsToday,
      todayInChicago: todayString,
    })
  } catch (error) {
    console.error("Failed to check for duplicate today dates:", error)
    return NextResponse.json({ hasDuplicates: false })
  }
}
