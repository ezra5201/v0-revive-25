import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const contacts = await sql`
      SELECT 
        oc.*,
        COALESCE(ocl.first_name || ' ' || ocl.last_name, 'Unknown Client') as client_name,
        ol.name as location_name,
        or_run.run_date
      FROM outreach_contacts oc
      LEFT JOIN outreach_clients ocl ON oc.client_id = ocl.id
      LEFT JOIN outreach_locations ol ON oc.location_id = ol.id
      LEFT JOIN outreach_runs or_run ON oc.run_id = or_run.id
      ORDER BY oc.contact_date DESC, oc.created_at DESC
    `

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error fetching contacts:", error)
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      run_id,
      client_id,
      location_id,
      staff_member,
      services_provided,
      supplies_given,
      narcan_administered,
      medical_concerns,
      housing_status,
      follow_up_needed,
      follow_up_notes,
      is_new_client,
      new_client_first_name,
      new_client_last_name,
    } = body

    let finalClientId = client_id

    // Create new client if needed
    if (is_new_client && (new_client_first_name || new_client_last_name)) {
      const newClient = await sql`
        INSERT INTO outreach_clients (first_name, last_name, is_active)
        VALUES (${new_client_first_name || null}, ${new_client_last_name || null}, true)
        RETURNING id
      `
      finalClientId = newClient[0].id
    }

    const result = await sql`
      INSERT INTO outreach_contacts (
        run_id,
        client_id,
        location_id,
        contact_date,
        contact_time,
        staff_member,
        services_provided,
        supplies_given,
        narcan_administered,
        medical_concerns,
        housing_status,
        follow_up_needed,
        follow_up_notes
      )
      VALUES (
        ${run_id || null},
        ${finalClientId || null},
        ${location_id || null},
        CURRENT_DATE,
        CURRENT_TIME,
        ${staff_member},
        ${services_provided},
        ${JSON.stringify(supplies_given)},
        ${narcan_administered},
        ${medical_concerns || null},
        ${housing_status || null},
        ${follow_up_needed},
        ${follow_up_notes || null}
      )
      RETURNING *
    `

    // Update run contact count if run_id provided
    if (run_id) {
      await sql`
        UPDATE outreach_runs 
        SET total_contacts = total_contacts + 1
        WHERE id = ${run_id}
      `
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating contact:", error)
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 })
  }
}
