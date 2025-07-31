import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getTodayString } from "@/lib/date-utils"
import { syncServicesToIntegerColumns, buildIntegerColumnsSql } from "@/lib/service-sync"

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

// Ensures the contacts table has the services/comments columns.
// Safe to run repeatedly thanks to IF NOT EXISTS.
async function ensureServicesColumns() {
  if (!sql) return

  try {
    await sql`
      ALTER TABLE contacts
        ADD COLUMN IF NOT EXISTS services_requested JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS services_provided JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS comments TEXT DEFAULT '';
    `
  } catch (error) {
    // Continue if columns already exist
    console.log("Services columns may already exist:", error)
  }
}

export async function POST(request: Request) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    // Ensure the contacts table has the services/comments columns
    await ensureServicesColumns()

    const body = await request.json()
    const { clientName, objectives = [], accessedFood = false, comments = "", providerName } = body

    console.log("Check-in request:", { clientName, objectives, accessedFood, comments, providerName })

    // Validate required fields
    if (!clientName || !providerName) {
      return NextResponse.json({ error: "Client name and provider name are required" }, { status: 400 })
    }

    // Get today's date in Chicago time (current date)
    const todayString = getTodayString()

    // Check if client already checked in today
    const existingCheckin = await sql`
      SELECT id FROM contacts 
      WHERE client_name = ${clientName} AND contact_date = ${todayString}
    `

    if (existingCheckin.length > 0) {
      return NextResponse.json({ error: "Client has already checked in today" }, { status: 400 })
    }

    // Determine if this is a client or prospect
    let category = "Prospect" // Default to prospect
    try {
      const existingClient = await sql`SELECT category FROM clients WHERE name = ${clientName}`
      if (existingClient.length > 0) {
        category = existingClient[0].category
      }
    } catch (error) {
      console.log("Could not check existing client category, defaulting to Prospect")
    }

    // Prepare services data - ensure it's an array
    const servicesRequested = Array.isArray(objectives) ? objectives : []
    const servicesProvided: any[] = []

    // If food was accessed, mark it as provided immediately
    if (accessedFood && servicesRequested.includes("Food")) {
      servicesProvided.push({
        service: "Food",
        provider: providerName,
        completedAt: new Date().toISOString(),
      })
    }

    // Sync JSONB services to integer columns
    const integerColumnUpdates = syncServicesToIntegerColumns(servicesRequested, servicesProvided)
    const integerColumnsSql = buildIntegerColumnsSql(integerColumnUpdates)

    console.log("Inserting contact with:", {
      todayString,
      providerName,
      clientName,
      category,
      servicesRequested,
      servicesProvided,
      comments,
      accessedFood,
      integerColumnUpdates,
    })

    // Insert the check-in record with days_ago = 0 for today, including integer columns
    const insertSql = `
      INSERT INTO contacts (
        contact_date, days_ago, provider_name, client_name, category,
        services_requested, services_provided, comments, food_accessed, 
        created_at, updated_at,
        ${Object.keys(integerColumnUpdates).join(", ")}
      )
      VALUES (
        $1, 0, $2, $3, $4,
        $5, $6, $7, $8, 
        NOW(), NOW(),
        ${Object.values(integerColumnUpdates).join(", ")}
      )
      RETURNING id, contact_date, provider_name, client_name, category,
                services_requested, services_provided, comments, food_accessed
    `

    const result = await sql.unsafe(insertSql, [
      todayString,
      providerName,
      clientName,
      category,
      JSON.stringify(servicesRequested),
      JSON.stringify(servicesProvided),
      comments || "",
      accessedFood || false,
    ])

    console.log("Contact inserted successfully:", result[0])

    // If this is a new prospect, add them to the clients table
    if (category === "Prospect") {
      try {
        await sql`
          INSERT INTO clients (name, category, created_at, updated_at) 
          VALUES (${clientName}, 'Prospect', NOW(), NOW()) 
          ON CONFLICT (name) DO NOTHING
        `
        console.log("Added new prospect to clients table")
      } catch (error) {
        console.log("Client may already exist in clients table:", error)
      }
    }

    const newContact = result[0]

    // Format the response
    const formattedContact = {
      id: newContact.id,
      date: new Date(newContact.contact_date).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      daysAgo: 0, // Always 0 for today's check-ins
      provider: newContact.provider_name,
      client: newContact.client_name,
      category: newContact.category,
      servicesRequested: safeJson(newContact.services_requested, []),
      servicesProvided: safeJson(newContact.services_provided, []),
      comments: newContact.comments || "",
    }

    console.log("Returning formatted contact:", formattedContact)

    return NextResponse.json({
      message: "Check-in successful",
      contact: formattedContact,
      objectives: servicesRequested,
      comments: comments || "",
    })
  } catch (error) {
    console.error("Check-in failed:", error)
    return NextResponse.json(
      { error: `Check-in failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
