import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    // Get unique providers
    const providers = await sql`
      SELECT DISTINCT provider_name as name
      FROM contacts
      WHERE provider_name IS NOT NULL
      ORDER BY provider_name
    `

    // Get unique clients
    const clients = await sql`
      SELECT DISTINCT client_name as name
      FROM contacts
      WHERE client_name IS NOT NULL
      ORDER BY client_name
    `

    // Get unique categories
    const categories = await sql`
      SELECT DISTINCT category
      FROM contacts
      WHERE category IS NOT NULL
      ORDER BY category
    `

    // Get unique dates
    const dates = await sql`
      SELECT DISTINCT contact_date
      FROM contacts
      WHERE contact_date IS NOT NULL
      ORDER BY contact_date DESC
    `

    // Get service statistics using JSONB queries
    const serviceStats = await sql`
      SELECT 
        'Case Management' as service,
        COUNT(*) FILTER (WHERE services_requested @> '["Case Management"]') as requested_count,
        COUNT(*) FILTER (WHERE services_provided::text ILIKE '%"service":"Case Management"%') as provided_count
      FROM contacts
      UNION ALL
      SELECT 
        'Occupational' as service,
        COUNT(*) FILTER (WHERE services_requested @> '["Occupational"]') as requested_count,
        COUNT(*) FILTER (WHERE services_provided::text ILIKE '%"service":"Occupational"%') as provided_count
      FROM contacts
      UNION ALL
      SELECT 
        'Food' as service,
        COUNT(*) FILTER (WHERE services_requested @> '["Food"]') as requested_count,
        COUNT(*) FILTER (WHERE services_provided::text ILIKE '%"service":"Food"%') as provided_count
      FROM contacts
      UNION ALL
      SELECT 
        'Healthcare' as service,
        COUNT(*) FILTER (WHERE services_requested @> '["Healthcare"]') as requested_count,
        COUNT(*) FILTER (WHERE services_provided::text ILIKE '%"service":"Healthcare"%') as provided_count
      FROM contacts
      UNION ALL
      SELECT 
        'Housing' as service,
        COUNT(*) FILTER (WHERE services_requested @> '["Housing"]') as requested_count,
        COUNT(*) FILTER (WHERE services_provided::text ILIKE '%"service":"Housing"%') as provided_count
      FROM contacts
      UNION ALL
      SELECT 
        'Employment' as service,
        COUNT(*) FILTER (WHERE services_requested @> '["Employment"]') as requested_count,
        COUNT(*) FILTER (WHERE services_provided::text ILIKE '%"service":"Employment"%') as provided_count
      FROM contacts
      UNION ALL
      SELECT 
        'Benefits' as service,
        COUNT(*) FILTER (WHERE services_requested @> '["Benefits"]') as requested_count,
        COUNT(*) FILTER (WHERE services_provided::text ILIKE '%"service":"Benefits"%') as provided_count
      FROM contacts
      UNION ALL
      SELECT 
        'Legal' as service,
        COUNT(*) FILTER (WHERE services_requested @> '["Legal"]') as requested_count,
        COUNT(*) FILTER (WHERE services_provided::text ILIKE '%"service":"Legal"%') as provided_count
      FROM contacts
      UNION ALL
      SELECT 
        'Transportation' as service,
        COUNT(*) FILTER (WHERE services_requested @> '["Transportation"]') as requested_count,
        COUNT(*) FILTER (WHERE services_provided::text ILIKE '%"service":"Transportation"%') as provided_count
      FROM contacts
      UNION ALL
      SELECT 
        'Mental Health' as service,
        COUNT(*) FILTER (WHERE services_requested @> '["Mental Health"]') as requested_count,
        COUNT(*) FILTER (WHERE services_provided::text ILIKE '%"service":"Mental Health"%') as provided_count
      FROM contacts
      UNION ALL
      SELECT 
        'Other' as service,
        COUNT(*) FILTER (WHERE services_requested @> '["Other"]') as requested_count,
        COUNT(*) FILTER (WHERE services_provided::text ILIKE '%"service":"Other"%') as provided_count
      FROM contacts
      ORDER BY service
    `

    // Format dates for response
    const formattedDates = dates.map((d: any) => ({
      value: d.contact_date,
      label: new Date(d.contact_date).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
    }))

    // Format service stats
    const formattedServiceStats = serviceStats.map((s: any) => ({
      service: s.service,
      requestedCount: Number.parseInt(s.requested_count),
      providedCount: Number.parseInt(s.provided_count),
      totalCount: Number.parseInt(s.requested_count) + Number.parseInt(s.provided_count),
    }))

    return NextResponse.json({
      providers: providers.map((p: any) => p.name),
      clients: clients.map((c: any) => c.name),
      categories: categories.map((c: any) => c.category),
      dates: formattedDates,
      services: formattedServiceStats,
    })
  } catch (error) {
    console.error("Failed to fetch filters:", error)
    return NextResponse.json(
      { error: `Failed to fetch filters: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
