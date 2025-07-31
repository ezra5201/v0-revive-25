import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const recentContacts = await sql`
      SELECT 
        c.client_name,
        c.contact_date,
        c.provider_name,
        cl.category AS client_category
      FROM contacts c
      JOIN clients cl ON c.client_uuid = cl.client_uuid
      ORDER BY c.contact_date DESC
      LIMIT 10
    `

    const clientsNeedingFollowup = await sql`
      SELECT 
        cl.name as client_name,
        MAX(c.contact_date) as last_contact,
        COUNT(c.id) as total_contacts,
        cl.category
      FROM clients cl
      JOIN contacts c ON cl.client_uuid = c.client_uuid
      GROUP BY cl.name, cl.category
      HAVING MAX(c.contact_date) < CURRENT_DATE - INTERVAL '30 days'
      ORDER BY MAX(c.contact_date) ASC
      LIMIT 10
    `

    return NextResponse.json({
      recentContacts: recentContacts.map((row) => ({
        clientName: row.client_name,
        contactDate: row.contact_date,
        provider: row.provider_name,
        clientCategory: row.client_category,
      })),
      clientsNeedingFollowup: clientsNeedingFollowup.map((row) => ({
        clientName: row.client_name,
        lastContact: row.last_contact,
        totalContacts: Number.parseInt(row.total_contacts),
        category: row.category,
        daysSinceContact: Math.floor(
          (new Date().getTime() - new Date(row.last_contact).getTime()) / (1000 * 60 * 60 * 24),
        ),
      })),
    })
  } catch (error) {
    console.error("Failed to fetch recent activity data:", error)
    return NextResponse.json({ error: "Failed to fetch recent activity data" }, { status: 500 })
  }
}
