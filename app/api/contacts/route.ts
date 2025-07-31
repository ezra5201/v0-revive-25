import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { getTodayString } from "@/lib/date-utils"

export async function GET(request: NextRequest) {
  if (!sql) {
    return NextResponse.json(
      {
        error:
          "Database connection string is missing or invalid. " +
          "Make sure your Neon integration exposes DATABASE_URL (postgres://…).",
      },
      { status: 500 },
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get("tab") || "all"
    const categories = searchParams.get("categories")?.split(",").filter(Boolean) || []
    const providers = searchParams.get("providers")?.split(",").filter(Boolean) || []
    const sortColumn = searchParams.get("sortColumn") || "date"
    const sortDirection = searchParams.get("sortDirection") || "desc"
    const serviceFilter = searchParams.get("serviceFilter") // New parameter

    // Get today's date in Chicago time (dynamic)
    const todayString = getTodayString()

    // Build the WHERE clause for filtering
    const whereConditions = []
    const queryParams: any[] = []

    if (tab === "today") {
      // For today's tab, only show today's check-ins (current Chicago date)
      whereConditions.push(`c.contact_date = $${queryParams.length + 1}`)
      queryParams.push(todayString)
    } else {
      // For all contacts tab, apply filters
      if (categories.length > 0) {
        whereConditions.push(`c.category = ANY($${queryParams.length + 1})`)
        queryParams.push(categories)
      }

      if (providers.length > 0) {
        whereConditions.push(`c.provider_name = ANY($${queryParams.length + 1})`)
        queryParams.push(providers)
      }
    }

    // Add service filter using JSONB queries
    if (serviceFilter === "cm") {
      whereConditions.push(`(
        c.services_requested @> '["Case Management"]' OR
        c.services_provided::text ILIKE '%"service":"Case Management"%'
      )`)
    } else if (serviceFilter === "ot") {
      whereConditions.push(`(
        c.services_requested @> '["Occupational"]' OR
        c.services_provided::text ILIKE '%"service":"Occupational"%'
      )`)
    } else if (serviceFilter === "food") {
      whereConditions.push(`(
        c.services_requested @> '["Food"]' OR
        c.services_provided::text ILIKE '%"service":"Food"%'
      )`)
    } else if (serviceFilter === "healthcare") {
      whereConditions.push(`(
        c.services_requested @> '["Healthcare"]' OR
        c.services_provided::text ILIKE '%"service":"Healthcare"%'
      )`)
    } else if (serviceFilter === "housing") {
      whereConditions.push(`(
        c.services_requested @> '["Housing"]' OR
        c.services_provided::text ILIKE '%"service":"Housing"%'
      )`)
    } else if (serviceFilter === "employment") {
      whereConditions.push(`(
        c.services_requested @> '["Employment"]' OR
        c.services_provided::text ILIKE '%"service":"Employment"%'
      )`)
    } else if (serviceFilter === "id") {
      whereConditions.push(`(
        c.services_requested @> '["ID"]' OR
        c.services_provided::text ILIKE '%"service":"ID"%'
      )`)
    } else if (serviceFilter === "laundry") {
      whereConditions.push(`(
        c.services_requested @> '["Laundry"]' OR
        c.services_provided::text ILIKE '%"service":"Laundry"%'
      )`)
    } else if (serviceFilter === "recreation") {
      whereConditions.push(`(
        c.services_requested @> '["Recreation"]' OR
        c.services_provided::text ILIKE '%"service":"Recreation"%'
      )`)
    } else if (serviceFilter === "other") {
      whereConditions.push(`(
        c.services_requested @> '["Other"]' OR
        c.services_provided::text ILIKE '%"service":"Other"%'
      )`)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Column names for ORDER BY - different for each tab
    const columnMapToday = {
      date: "c.contact_date",
      daysAgo: "c.days_ago",
      provider: "c.provider_name",
      client: "c.client_name",
      category: "c.category",
      food: "c.food_accessed",
    }

    const columnMapAll = {
      date: "contact_date",
      daysAgo: "days_ago",
      provider: "provider_name",
      client: "client_name",
      category: "category",
      food: "food_accessed",
    }

    const columnMap = tab === "today" ? columnMapToday : columnMapAll
    const dbColumn =
      columnMap[sortColumn as keyof typeof columnMap] || (tab === "today" ? "c.contact_date" : "contact_date")
    const direction = sortDirection.toUpperCase() === "ASC" ? "ASC" : "DESC"

    // ---------- helper -------------------------------------------------
    async function fetchRows() {
      if (tab === "today") {
        // Today's tab - show all check-ins for today (06/30/2025)
        const fullQuery = `
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
            a.id as alert_id,
            a.alert_details,
            a.severity as alert_severity,
            a.status as alert_status
          FROM contacts c
          LEFT JOIN alerts a ON c.alert_id = a.id AND a.status = 'active'
          ${whereClause}
          ORDER BY ${dbColumn} ${direction}
        `

        try {
          return queryParams.length > 0 ? await sql.query(fullQuery, queryParams) : await sql.query(fullQuery)
        } catch (e: any) {
          const msg = e?.message ?? ""
          if (
            (msg.includes("column") && (msg.includes("alert_id") || msg.includes("alerts"))) ||
            (msg.includes("relation") && msg.includes("alerts"))
          ) {
            console.warn("contacts API: alerts columns missing – falling back to legacy schema")
            const legacyQuery = `
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
                c.created_at
              FROM contacts c
              ${whereClause}
              ORDER BY ${dbColumn} ${direction}
            `
            return queryParams.length > 0 ? await sql.query(legacyQuery, queryParams) : await sql.query(legacyQuery)
          }
          throw e
        }
      } else {
        // All contacts tab - show most recent contact per unique client
        // Calculate days_ago dynamically based on current Chicago today
        const latestPerClientQuery = `
          WITH ranked_contacts AS (
            SELECT
              c.id,
              c.contact_date,
              c.provider_name,
              c.client_name,
              c.category,
              c.food_accessed,
              c.alert_id,
              c.services_requested,
              c.services_provided,
              c.created_at,
              -- Calculate actual days from current Chicago today to the contact date
              (DATE '${todayString}' - c.contact_date)::INTEGER AS days_ago,
              ROW_NUMBER() OVER (
                PARTITION BY c.client_name
                ORDER BY c.contact_date DESC, c.created_at DESC
              ) AS rn
            FROM contacts c
            ${whereClause}
          )
          SELECT
            r.id,
            r.contact_date,
            r.days_ago,
            r.provider_name,
            r.client_name,
            r.category,
            r.food_accessed,
            r.created_at,
            r.services_requested,
            r.services_provided
          FROM ranked_contacts r
          WHERE r.rn = 1
          ORDER BY ${dbColumn} ${direction}
        `

        try {
          return queryParams.length > 0
            ? await sql.query(latestPerClientQuery, queryParams)
            : await sql.query(latestPerClientQuery)
        } catch (e: any) {
          const msg = e?.message ?? ""
          if (
            (msg.includes("column") && (msg.includes("alert_id") || msg.includes("alerts"))) ||
            (msg.includes("relation") && msg.includes("alerts"))
          ) {
            console.warn("contacts API: alerts columns missing – falling back to legacy schema")
            const fallbackQuery = `
              WITH ranked_contacts AS (
                SELECT
                  c.id,
                  c.contact_date,
                  c.provider_name,
                  c.client_name,
                  c.category,
                  c.food_accessed,
                  c.created_at,
                  c.services_requested,
                  c.services_provided,
                  -- Calculate actual days from Chicago today to the contact date
                  (DATE '${todayString}' - c.contact_date)::INTEGER AS days_ago,
                  ROW_NUMBER() OVER (
                    PARTITION BY c.client_name
                    ORDER BY c.contact_date DESC, c.created_at DESC
                  ) AS rn
                FROM contacts c
                ${whereClause}
              )
              SELECT
                r.id,
                r.contact_date,
                r.days_ago,
                r.provider_name,
                r.client_name,
                r.category,
                r.food_accessed,
                r.created_at,
                r.services_requested,
                r.services_provided
              FROM ranked_contacts r
              WHERE r.rn = 1
              ORDER BY ${dbColumn} ${direction}
            `
            return queryParams.length > 0 ? await sql.query(fallbackQuery, queryParams) : await sql.query(fallbackQuery)
          }
          throw e
        }
      }
    }
    // -------------------------------------------------------------------

    // Get rows (auto-fallback if necessary)
    const dbRows = await fetchRows()

    console.log(`Fetched ${dbRows.length} rows for tab: ${tab}, serviceFilter: ${serviceFilter}`) // Debug log

    // Transform rows for UI – default empty arrays/strings when columns absent
    const contacts = dbRows.map((row: any) => {
      const baseContact = {
        id: row.id,
        date: new Date(row.contact_date).toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        daysAgo: row.days_ago,
        provider: row.provider_name,
        client: row.client_name,
        category: row.category,
        food: row.food_accessed ? "Y" : "",
        hasAlert: !!row.alert_id,
        alertDetails: row.alert_details ?? "",
        alertSeverity: row.alert_severity ?? "",
      }

      // Only include services and comments for today's tab
      if (tab === "today") {
        return {
          ...baseContact,
          servicesRequested: row.services_requested ?? [],
          servicesProvided: row.services_provided ?? [],
          comments: row.comments ?? "",
        }
      }

      return baseContact
    })

    return NextResponse.json({ contacts })
  } catch (error) {
    console.error("Failed to fetch contacts:", error)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}
