import { NextResponse } from "next/server"
import { getTodayString, calculateDaysAgo } from "@/lib/date-utils"
import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { contactIds, newDate } = body

    // Validate required fields
    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({ error: "Contact IDs are required" }, { status: 400 })
    }

    if (!newDate) {
      return NextResponse.json({ error: "New date is required" }, { status: 400 })
    }

    // Validate date format and ensure it's not in the future
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(newDate)) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD" }, { status: 400 })
    }

    const selectedDate = new Date(newDate)
    const todayString = getTodayString()
    const today = new Date(todayString)
    today.setHours(23, 59, 59, 999) // Set to end of today for comparison

    if (selectedDate > today) {
      return NextResponse.json({ error: "Cannot set date in the future" }, { status: 400 })
    }

    // Calculate days ago from the new date using current Chicago time
    const daysAgo = calculateDaysAgo(newDate)

    const updatedContacts = []
    const clientSql = neon(process.env.DATABASE_URL!)

    // Process each contact
    for (const contactId of contactIds) {
      try {
        // Update the contact record
        const result = await clientSql.query(
          `UPDATE contacts 
           SET contact_date = $1, days_ago = $2, updated_at = NOW() 
           WHERE id = $3
           RETURNING id, contact_date, days_ago, client_name`,
          [newDate, daysAgo, contactId],
        )

        if (result.length > 0) {
          updatedContacts.push({
            id: result[0].id,
            clientName: result[0].client_name,
            newDate: result[0].contact_date,
            daysAgo: result[0].days_ago,
          })
        }
      } catch (error) {
        console.error(`Error updating contact ${contactId}:`, error)
      }
    }

    return NextResponse.json({
      message: `Contact date updated for ${updatedContacts.length} contact(s)`,
      updatedContacts,
      newDate,
      daysAgo,
    })
  } catch (error) {
    console.error("Date change failed:", error)
    return NextResponse.json(
      { error: `Date change failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
