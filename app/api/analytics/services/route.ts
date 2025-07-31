import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import type { ServiceData, ServicesResponse } from "@/types/services"

// Connection (query) function
const db = neon(process.env.DATABASE_URL!)

/** Determine date range for a given period label */
function getDateFilters(period: string): { startYear: number; startMonth: number; endYear: number; endMonth: number } {
  const now = new Date()

  if (period === "Last Month") {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return {
      startYear: lastMonth.getFullYear(),
      startMonth: lastMonth.getMonth() + 1,
      endYear: lastMonth.getFullYear(),
      endMonth: lastMonth.getMonth() + 1,
    }
  } else if (period === "This Year") {
    return {
      startYear: now.getFullYear(),
      startMonth: 1,
      endYear: now.getFullYear(),
      endMonth: 12,
    }
  } else {
    // Default: This Month
    return {
      startYear: now.getFullYear(),
      startMonth: now.getMonth() + 1,
      endYear: now.getFullYear(),
      endMonth: now.getMonth() + 1,
    }
  }
}

export async function GET(request: Request): Promise<NextResponse<ServicesResponse | { error: string }>> {
  try {
    /* -------------------------------------------------- */
    /* 1. Parse query-string period                       */
    /* -------------------------------------------------- */
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") ?? "This Month"
    const { startYear, startMonth, endYear, endMonth } = getDateFilters(period)

    /* -------------------------------------------------- */
    /* 2. Query monthly_service_summary table             */
    /* -------------------------------------------------- */
    const rows = await db<
      {
        service_name: string
        total_requested: string | number | null
        total_provided: string | number | null
      }[]
    >`
      SELECT 
        service_name,
        SUM(total_requested) as total_requested,
        SUM(total_provided) as total_provided
      FROM monthly_service_summary
      WHERE (year > ${startYear} OR (year = ${startYear} AND month >= ${startMonth}))
        AND (year < ${endYear} OR (year = ${endYear} AND month <= ${endMonth}))
      GROUP BY service_name
      ORDER BY SUM(total_provided) DESC
    `

    /* -------------------------------------------------- */
    /* 3. Shape response                                  */
    /* -------------------------------------------------- */
    const result: ServicesResponse = rows.map<ServiceData>((row) => {
      const requested = Number(row.total_requested ?? 0)
      const provided = Number(row.total_provided ?? 0)
      return {
        service: row.service_name,
        requested,
        provided,
        completionRate: requested > 0 ? Math.round((provided / requested) * 100) : 0,
      }
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error("Failed to fetch services data:", err)
    return NextResponse.json({ error: "Failed to fetch services data" }, { status: 500 })
  }
}
