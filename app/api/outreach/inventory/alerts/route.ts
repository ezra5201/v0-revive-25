import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const alerts = await sql`
      SELECT 
        oia.*,
        oi.item_name
      FROM outreach_inventory_alerts oia
      JOIN outreach_inventory oi ON oia.inventory_item_id = oi.id
      ORDER BY oia.created_at DESC
    `

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}
