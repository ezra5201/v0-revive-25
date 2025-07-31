import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    // Get unique providers from contacts table
    const providersResult = await sql`
      SELECT DISTINCT provider_name as name 
      FROM contacts 
      ORDER BY provider_name
    `

    // Get unique categories from contacts table
    const categoriesResult = await sql`
      SELECT DISTINCT category 
      FROM contacts 
      ORDER BY category
    `

    // Get all clients for search
    const clientsResult = await sql`
      SELECT DISTINCT client_name as name 
      FROM contacts 
      ORDER BY client_name
    `

    const providers = providersResult.map((row: any) => row.name)
    const categories = categoriesResult.map((row: any) => row.category)
    const clients = clientsResult.map((row: any) => ({ name: row.name }))

    return NextResponse.json({
      providers,
      categories,
      clients,
    })
  } catch (error) {
    console.error("Failed to fetch filter options:", error)
    return NextResponse.json({ error: "Failed to fetch filter options" }, { status: 500 })
  }
}
