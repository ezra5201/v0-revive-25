import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(_request: NextRequest, { params }: { params: { name: string } }) {
  if (!sql) {
    return NextResponse.json({ error: "Database connection not available in this environment" }, { status: 503 })
  }

  try {
    const clientName = decodeURIComponent(params.name)

    const result = await sql`
      SELECT name, category, active, created_at, updated_at
      FROM clients
      WHERE name = ${clientName}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client data" }, { status: 500 })
  }
}
