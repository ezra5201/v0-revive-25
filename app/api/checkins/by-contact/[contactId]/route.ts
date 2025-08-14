import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

interface CheckinWithGoals {
  id: number
  contact_id: number
  client_name: string
  client_uuid: string | null
  provider_name: string
  notes: string | null
  status: string
  created_at: string
  updated_at: string
  goals: Array<{
    id: number
    goal_text: string
    status: string
    target_date: string | null
    priority: number
    created_at: string
  }>
}

export async function GET(request: NextRequest, { params }: { params: { contactId: string } }) {
  if (!sql) {
    return NextResponse.json({ error: "Database not available" }, { status: 500 })
  }

  try {
    const contactId = Number.parseInt(params.contactId)
    if (isNaN(contactId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid contact ID",
            details: { field: "contactId", value: params.contactId },
          },
        },
        { status: 400 },
      )
    }

    // Fetch check-ins for the contact with associated goals
    const result = await sql`
      SELECT 
        c.id,
        c.contact_id,
        c.client_name,
        c.client_uuid,
        c.provider_name,
        c.notes,
        c.status,
        c.created_at,
        c.updated_at,
        g.id as goal_id,
        g.goal_text,
        g.status as goal_status,
        g.target_date as goal_target_date,
        g.priority as goal_priority,
        g.created_at as goal_created_at
      FROM cm_checkins c
      LEFT JOIN cm_goals g ON c.id = g.checkin_id
      WHERE c.contact_id = ${contactId}
      ORDER BY c.created_at DESC, g.priority ASC, g.created_at ASC
    `

    if (result.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Group the results by check-in ID and nest the goals
    const checkinMap = new Map<number, CheckinWithGoals>()

    for (const row of result) {
      const checkinId = row.id

      if (!checkinMap.has(checkinId)) {
        checkinMap.set(checkinId, {
          id: row.id,
          contact_id: row.contact_id,
          client_name: row.client_name,
          client_uuid: row.client_uuid,
          provider_name: row.provider_name,
          notes: row.notes,
          status: row.status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          goals: [],
        })
      }

      const checkin = checkinMap.get(checkinId)!

      // Add goal if it exists (LEFT JOIN might return null goal data)
      if (row.goal_id) {
        checkin.goals.push({
          id: row.goal_id,
          goal_text: row.goal_text,
          status: row.goal_status,
          target_date: row.goal_target_date,
          priority: row.goal_priority,
          created_at: row.goal_created_at,
        })
      }
    }

    // Convert map to array
    const checkins = Array.from(checkinMap.values())

    return NextResponse.json({
      success: true,
      data: checkins,
    })
  } catch (error) {
    console.error("Failed to fetch check-ins:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to fetch check-ins",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
