import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

// Helper function to safely parse JSON
function safeJson(value: unknown, fallback: any = []) {
  if (Array.isArray(value) || typeof value === "object") return value ?? fallback
  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }
  return fallback
}

export async function GET(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // Get filter parameters
    const providerFilter = searchParams.get("provider")
    const clientFilter = searchParams.get("client")
    const categoryFilter = searchParams.get("category")
    const serviceFilter = searchParams.get("service")
    const dateFilter = searchParams.get("date")
    const daysAgoFilter = searchParams.get("daysAgo")

    console.log("Contacts API filters:", {
      providerFilter,
      clientFilter,
      categoryFilter,
      serviceFilter,
      dateFilter,
      daysAgoFilter,
    })

    // Build WHERE conditions
    const whereConditions: string[] = []
    const queryParams: any[] = []
    let paramIndex = 1

    if (providerFilter) {
      whereConditions.push(`c.provider_name ILIKE $${paramIndex}`)
      queryParams.push(`%${providerFilter}%`)
      paramIndex++
    }

    if (clientFilter) {
      whereConditions.push(`c.client_name ILIKE $${paramIndex}`)
      queryParams.push(`%${clientFilter}%`)
      paramIndex++
    }

    if (categoryFilter) {
      whereConditions.push(`c.category = $${paramIndex}`)
      queryParams.push(categoryFilter)
      paramIndex++
    }

    if (dateFilter) {
      whereConditions.push(`c.contact_date = $${paramIndex}`)
      queryParams.push(dateFilter)
      paramIndex++
    }

    if (daysAgoFilter) {
      const daysAgo = Number.parseInt(daysAgoFilter)
      if (!isNaN(daysAgo)) {
        whereConditions.push(`c.days_ago = $${paramIndex}`)
        queryParams.push(daysAgo)
        paramIndex++
      }
    }

    // Service filtering using JSONB columns
    if (serviceFilter) {
      if (serviceFilter === "cm") {
        // Case Management filtering
        whereConditions.push(`(
          c.services_requested @> '["Case Management"]' OR 
          c.services_provided::text ILIKE '%"service":"Case Management"%'
        )`)
      } else if (serviceFilter === "ot") {
        // Occupational Therapy filtering
        whereConditions.push(`(
          c.services_requested @> '["Occupational"]' OR 
          c.services_provided::text ILIKE '%"service":"Occupational"%'
        )`)
      } else if (serviceFilter === "food") {
        // Food services filtering
        whereConditions.push(`(
          c.services_requested @> '["Food"]' OR 
          c.services_provided::text ILIKE '%"service":"Food"%'
        )`)
      } else if (serviceFilter === "healthcare") {
        // Healthcare services filtering
        whereConditions.push(`(
          c.services_requested @> '["Healthcare"]' OR 
          c.services_provided::text ILIKE '%"service":"Healthcare"%'
        )`)
      } else if (serviceFilter === "housing") {
        // Housing services filtering
        whereConditions.push(`(
          c.services_requested @> '["Housing"]' OR 
          c.services_provided::text ILIKE '%"service":"Housing"%'
        )`)
      } else if (serviceFilter === "employment") {
        // Employment services filtering
        whereConditions.push(`(
          c.services_requested @> '["Employment"]' OR 
          c.services_provided::text ILIKE '%"service":"Employment"%'
        )`)
      } else if (serviceFilter === "benefits") {
        // Benefits services filtering
        whereConditions.push(`(
          c.services_requested @> '["Benefits"]' OR 
          c.services_provided::text ILIKE '%"service":"Benefits"%'
        )`)
      } else if (serviceFilter === "legal") {
        // Legal services filtering
        whereConditions.push(`(
          c.services_requested @> '["Legal"]' OR 
          c.services_provided::text ILIKE '%"service":"Legal"%'
        )`)
      } else if (serviceFilter === "transportation") {
        // Transportation services filtering
        whereConditions.push(`(
          c.services_requested @> '["Transportation"]' OR 
          c.services_provided::text ILIKE '%"service":"Transportation"%'
        )`)
      } else if (serviceFilter === "mental_health") {
        // Mental Health services filtering
        whereConditions.push(`(
          c.services_requested @> '["Mental Health"]' OR 
          c.services_provided::text ILIKE '%"service":"Mental Health"%'
        )`)
      } else if (serviceFilter === "other") {
        // Other services filtering
        whereConditions.push(`(
          c.services_requested @> '["Other"]' OR 
          c.services_provided::text ILIKE '%"service":"Other"%'
        )`)
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    console.log("SQL WHERE clause:", whereClause)
    console.log("Query parameters:", queryParams)

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM contacts c
      ${whereClause}
    `

    const countResult = await sql.unsafe(countQuery, queryParams)
    const totalCount = Number.parseInt(countResult[0].total)

    // Get contacts with pagination
    const contactsQuery = `
      SELECT 
        c.id,
        c.contact_date,
        c.days_ago,
        c.provider_name,
        c.client_name,
        c.category,
        c.food_accessed,
        c.services_requested,
        c.services_provided,
        c.comments,
        c.created_at,
        c.updated_at
      FROM contacts c
      ${whereClause}
      ORDER BY c.contact_date DESC, c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const contacts = await sql.unsafe(contactsQuery, queryParams)

    console.log(`Found ${contacts.length} contacts (total: ${totalCount})`)

    // Format the contacts for response
    const formattedContacts = contacts.map((contact: any) => ({
      id: contact.id,
      date: new Date(contact.contact_date).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      daysAgo: contact.days_ago,
      provider: contact.provider_name,
      client: contact.client_name,
      category: contact.category,
      foodAccessed: contact.food_accessed,
      servicesRequested: safeJson(contact.services_requested, []),
      servicesProvided: safeJson(contact.services_provided, []),
      comments: contact.comments || "",
      createdAt: contact.created_at,
      updatedAt: contact.updated_at,
    }))

    return NextResponse.json({
      contacts: formattedContacts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      filters: {
        provider: providerFilter,
        client: clientFilter,
        category: categoryFilter,
        service: serviceFilter,
        date: dateFilter,
        daysAgo: daysAgoFilter,
      },
    })
  } catch (error) {
    console.error("Failed to fetch contacts:", error)
    return NextResponse.json(
      { error: `Failed to fetch contacts: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
