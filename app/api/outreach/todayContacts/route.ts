import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const contacts = await sql`
      SELECT 
        oc.*,
        COALESCE(ocl.first_name || ' ' || ocl.last_name, 'Unknown Client') as client_name,
        ol.name as location_name,
        or_run.run_date
      FROM outreach_contacts oc
      LEFT JOIN outreach_clients ocl ON oc.client_id = ocl.id
      LEFT JOIN outreach_locations ol ON oc.location_id = ol.id
      LEFT JOIN outreach_runs or_run ON oc.run_id = or_run.id
      WHERE DATE(oc.contact_date) = CURRENT_DATE
      ORDER BY oc.contact_date DESC, oc.created_at DESC
    `

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching today's contacts:", error)
    return NextResponse.json({ error: "Failed to fetch today's contacts" }, { status: 500 })
  }
}
