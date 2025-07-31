import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "This Month"

    let dateFilter = ""
    let newClientsDateFilter = ""

    switch (period) {
      case "This Month":
        dateFilter = "AND contact_date >= DATE_TRUNC('month', CURRENT_DATE)"
        newClientsDateFilter = "AND created_at >= DATE_TRUNC('month', CURRENT_DATE)"
        break
      case "Last Month":
        dateFilter = `AND contact_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                     AND contact_date < DATE_TRUNC('month', CURRENT_DATE)`
        newClientsDateFilter = `AND created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                               AND created_at < DATE_TRUNC('month', CURRENT_DATE)`
        break
      case "This Year":
        dateFilter = "AND contact_date >= DATE_TRUNC('year', CURRENT_DATE)"
        newClientsDateFilter = "AND created_at >= DATE_TRUNC('year', CURRENT_DATE)"
        break
      default:
        // Default to this month
        dateFilter = "AND contact_date >= DATE_TRUNC('month', CURRENT_DATE)"
        newClientsDateFilter = "AND created_at >= DATE_TRUNC('month', CURRENT_DATE)"
    }

    // Get total clients
    const totalClientsResult = await sql`
      SELECT COUNT(DISTINCT id) as count FROM clients
    `

    // Get total contacts for the period
    const totalContactsResult = await sql`
      SELECT COUNT(*) as count FROM contacts 
      WHERE 1=1 ${sql.unsafe(dateFilter)}
    `

    // Get new clients for the period
    const newClientsResult = await sql`
      SELECT COUNT(*) as count FROM clients 
      WHERE 1=1 ${sql.unsafe(newClientsDateFilter)}
    `

    return NextResponse.json({
      totalClients: Number.parseInt(totalClientsResult[0].count),
      totalContacts: Number.parseInt(totalContactsResult[0].count),
      newClientsThisMonth: Number.parseInt(newClientsResult[0].count),
    })
  } catch (error) {
    console.error("Overview analytics error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch overview analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
