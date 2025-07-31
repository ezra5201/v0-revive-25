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
        newClientsDateFilter = "AND first_contact >= DATE_TRUNC('month', CURRENT_DATE)"
        break
      case "Last Month":
        dateFilter = `AND contact_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                     AND contact_date < DATE_TRUNC('month', CURRENT_DATE)`
        newClientsDateFilter = `AND first_contact >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
                               AND first_contact < DATE_TRUNC('month', CURRENT_DATE)`
        break
      case "This Year":
        dateFilter = "AND contact_date >= DATE_TRUNC('year', CURRENT_DATE)"
        newClientsDateFilter = "AND first_contact >= DATE_TRUNC('year', CURRENT_DATE)"
        break
    }

    // Get total clients (all time)
    const totalClientsResult = await sql`
      SELECT COUNT(DISTINCT client_name) as count
      FROM contacts
    `

    // Get total contacts for the period
    const totalContactsQuery = `
      SELECT COUNT(*) as count
      FROM contacts
      WHERE 1=1 ${dateFilter}
    `
    const totalContactsResult = await sql(totalContactsQuery)

    // Get new clients for the period
    const newClientsQuery = `
      SELECT COUNT(*) as count
      FROM (
        SELECT client_name, MIN(contact_date) as first_contact
        FROM contacts
        GROUP BY client_name
      ) first_contacts
      WHERE 1=1 ${newClientsDateFilter}
    `
    const newClientsResult = await sql(newClientsQuery)

    return NextResponse.json({
      totalClients: Number.parseInt(totalClientsResult[0].count),
      totalContacts: Number.parseInt(totalContactsResult[0].count),
      newClientsThisMonth: Number.parseInt(newClientsResult[0].count),
    })
  } catch (error) {
    console.error("Error fetching overview data:", error)
    return NextResponse.json({ error: "Failed to fetch overview data" }, { status: 500 })
  }
}
