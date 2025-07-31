import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    const sql = neon(process.env.DATABASE_URL!)
    const clientName = decodeURIComponent(params.name)

    const contacts = await sql`
      SELECT * FROM contacts
      WHERE client_name = ${clientName}
      ORDER BY contact_date DESC
    `

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error("Client details error:", error)
    return NextResponse.json({ contacts: [] }, { status: 500 })
  }
}
