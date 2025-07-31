import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Get service usage from monthly summary
    const serviceStats = await sql`
      SELECT 
        SUM(shower) as shower,
        SUM(laundry) as laundry,
        SUM(meal) as meal,
        SUM(clothing) as clothing,
        SUM(mail) as mail,
        SUM(phone) as phone,
        SUM(computer) as computer,
        SUM(case_management) as case_management,
        SUM(benefits) as benefits,
        SUM(housing) as housing,
        SUM(medical) as medical,
        SUM(mental_health) as mental_health,
        SUM(substance_abuse) as substance_abuse,
        SUM(legal) as legal,
        SUM(transportation) as transportation,
        SUM(id_docs) as id_docs,
        SUM(storage) as storage,
        SUM(other) as other
      FROM monthly_service_summary
    `

    return NextResponse.json({
      success: true,
      data: serviceStats[0] || {},
    })
  } catch (error) {
    console.error("Service analytics error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch service analytics" }, { status: 500 })
  }
}
