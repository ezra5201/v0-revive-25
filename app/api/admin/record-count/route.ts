import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    // Get basic counts
    const basicStats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM contacts) as contacts,
        (SELECT COUNT(*) FROM clients) as clients,
        (SELECT COUNT(DISTINCT name) FROM providers) as providers,
        (SELECT COUNT(*) FROM alerts WHERE status = 'active') as alerts
    `

    // Get unique people count (distinct client names from contacts)
    const uniquePeople = await sql`
      SELECT COUNT(DISTINCT client_name) as unique_people
      FROM contacts
    `

    // Calculate master records gap
    const masterRecordsGap = await sql`
      SELECT 
        (SELECT COUNT(DISTINCT client_name) FROM contacts) - 
        (SELECT COUNT(*) FROM clients) as gap
    `

    // Calculate data consistency percentage
    const consistencyCheck = await sql`
      SELECT 
        COUNT(DISTINCT c.client_name) as contacts_clients,
        (SELECT COUNT(*) FROM clients) as master_clients
      FROM contacts c
    `

    const consistency = consistencyCheck[0]
    const dataConsistencyPercentage =
      consistency.master_clients > 0 ? Math.round((consistency.master_clients / consistency.contacts_clients) * 100) : 0

    const stats = {
      contacts: Number(basicStats[0].contacts),
      clients: Number(basicStats[0].clients),
      providers: Number(basicStats[0].providers),
      alerts: Number(basicStats[0].alerts),
      unique_people: Number(uniquePeople[0].unique_people),
      master_records_gap: Number(masterRecordsGap[0].gap),
      data_consistency_percentage: dataConsistencyPercentage,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to get record count:", error)
    return NextResponse.json({ error: "Failed to retrieve record count" }, { status: 500 })
  }
}
