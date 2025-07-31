import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    // 1. Read the ?period= query string (default to "This Month")
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") ?? "This Month"

    /*
     * 2. Build WHERE clauses for each metric based on the selected period.
     *    We derive the year/month directly from contact_date / created_at
     *    so we do NOT rely on a contact_year column.
     */
    let contactsWhere = ""
    let activeClientsWhere = ""
    let newClientsWhere = ""

    switch (period) {
      case "This Month": {
        contactsWhere = `
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
        `
        activeClientsWhere = `
          WHERE client_uuid IN (
            SELECT DISTINCT client_uuid
            FROM contacts
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          )
        `
        newClientsWhere = `
          WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        `
        break
      }

      case "Last Month": {
        contactsWhere = `
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        `
        activeClientsWhere = `
          WHERE client_uuid IN (
            SELECT DISTINCT client_uuid
            FROM contacts
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          )
        `
        newClientsWhere = `
          WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        `
        break
      }

      case "This Year": {
        contactsWhere = `
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        `
        activeClientsWhere = `
          WHERE client_uuid IN (
            SELECT DISTINCT client_uuid
            FROM contacts
            WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          )
        `
        newClientsWhere = `
          WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        `
        break
      }

      default: {
        // Fallback to "This Month"
        contactsWhere = `
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
        `
        activeClientsWhere = `
          WHERE client_uuid IN (
            SELECT DISTINCT client_uuid
            FROM contacts
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          )
        `
        newClientsWhere = `
          WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        `
      }
    }

    // 3. Execute the three metrics in parallel
    const [totalClientsRes, totalContactsRes, newClientsRes] = await Promise.all([
      sql`SELECT COUNT(DISTINCT client_name) AS count FROM contacts ${sql.unsafe(contactsWhere)}`,
      sql`SELECT COUNT(*) AS count FROM contacts ${sql.unsafe(contactsWhere)}`,
      sql`SELECT COUNT(*) AS count FROM clients ${sql.unsafe(newClientsWhere)}`,
    ])

    return NextResponse.json({
      totalClients: Number(totalClientsRes[0].count),
      totalContacts: Number(totalContactsRes[0].count),
      newClientsThisMonth: Number(newClientsRes[0].count),
    })
  } catch (error) {
    console.error("Failed to fetch overview analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
