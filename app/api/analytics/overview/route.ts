import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30"

    // Get total clients
    const totalClientsResult = await sql`SELECT COUNT(DISTINCT client_name) as count FROM contacts`
    const totalClients = Number.parseInt(totalClientsResult[0]?.count || "0")

    // Get total contacts in period
    const totalContactsResult = await sql`
      SELECT COUNT(*) as count 
      FROM contacts 
      WHERE contact_date >= CURRENT_DATE - INTERVAL '${period} days'
    `
    const totalContacts = Number.parseInt(totalContactsResult[0]?.count || "0")

    // Get new clients this month
    const newClientsResult = await sql`
      SELECT COUNT(DISTINCT client_name) as count
      FROM contacts
      WHERE contact_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND client_name NOT IN (
        SELECT DISTINCT client_name 
        FROM contacts 
        WHERE contact_date < DATE_TRUNC('month', CURRENT_DATE)
      )
    `
    const newClientsThisMonth = Number.parseInt(newClientsResult[0]?.count || "0")

    return NextResponse.json({
      totalClients,
      totalContacts,
      newClientsThisMonth,
    })
  } catch (error) {
    console.error("Overview analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch overview data" }, { status: 500 })
  }
}
