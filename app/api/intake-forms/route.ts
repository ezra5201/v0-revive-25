import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { auditLog, getUserFromRequest, getIpFromRequest } from "@/lib/audit-log"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] DATABASE_URL exists:", !!process.env.DATABASE_URL)
    console.log("[v0] DATABASE_URL starts with:", process.env.DATABASE_URL?.substring(0, 30))

    const { clientId, formData, sectionCompletion, overallCompletion } = await request.json()

    console.log("[v0] Attempting to check for existing form for client:", clientId)

    // Check if intake form already exists for this client
    const existingForm = await sql`
      SELECT id FROM intake_forms WHERE client_id = ${clientId}
    `

    console.log("[v0] Existing form check completed, found:", existingForm.length, "records")

    if (existingForm.length > 0) {
      const currentForm = await sql`
        SELECT * FROM intake_forms WHERE client_id = ${clientId}
      `
      const previousData = currentForm[0]

      // Update existing form
      await sql`
        UPDATE intake_forms SET
          name = ${formData.name},
          pronouns = ${formData.pronouns},
          date_of_birth = ${formData.dateOfBirth ? new Date(formData.dateOfBirth) : null},
          birth_year = ${formData.birthYear ? Number.parseInt(formData.birthYear) : null},
          program = ${formData.program},
          how_heard_about_us = ${formData.howHeardAboutUs},
          needs = ${JSON.stringify(formData.needs)},
          see_staff = ${JSON.stringify(formData.seeStaff)},
          other_support = ${formData.otherSupport},
          languages = ${formData.languages ? formData.languages.split(",").map((l: string) => l.trim()) : []},
          current_housing_status = ${JSON.stringify(formData.currentHousingStatus)},
          past_housing_status = ${JSON.stringify(formData.pastHousingStatus)},
          race = ${formData.race},
          ethnicity = ${formData.ethnicity},
          gender = ${formData.gender},
          is_disabled = ${formData.isDisabled},
          is_veteran = ${formData.isVeteran},
          employment_status = ${formData.employmentStatus},
          income_sources = ${JSON.stringify(formData.incomeSources)},
          goal_1 = ${formData.goal1},
          goal_2 = ${formData.goal2},
          goal_3 = ${formData.goal3},
          phone = ${formData.phone},
          email = ${formData.email},
          preferred_contact_method = ${formData.preferredContactMethod},
          emergency_contact_name = ${formData.emergencyContactName},
          emergency_contact_relationship = ${formData.emergencyContactRelationship},
          emergency_contact_phone = ${formData.emergencyContactPhone},
          completion_percentage = ${overallCompletion},
          section_completion = ${JSON.stringify(sectionCompletion)},
          is_completed = ${overallCompletion === 100},
          updated_at = NOW(),
          completed_at = ${overallCompletion === 100 ? "NOW()" : null}
        WHERE client_id = ${clientId}
      `

      await auditLog({
        action: "UPDATE",
        tableName: "intake_forms",
        recordId: existingForm[0].id.toString(),
        clientName: formData.name,
        userEmail: getUserFromRequest(request),
        ipAddress: getIpFromRequest(request),
        changes: {
          before: {
            completion_percentage: previousData.completion_percentage,
            is_completed: previousData.is_completed,
          },
          after: {
            completion_percentage: overallCompletion,
            is_completed: overallCompletion === 100,
          },
          updated_fields: Object.keys(formData),
        },
      })
    } else {
      // Create new form
      const result = await sql`
        INSERT INTO intake_forms (
          client_id, name, pronouns, date_of_birth, birth_year, program, how_heard_about_us,
          needs, see_staff, other_support, languages, current_housing_status, past_housing_status,
          race, ethnicity, gender, is_disabled, is_veteran, employment_status, income_sources,
          goal_1, goal_2, goal_3, phone, email, preferred_contact_method,
          emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
          completion_percentage, section_completion, is_completed, completed_at
        ) VALUES (
          ${clientId}, ${formData.name}, ${formData.pronouns}, 
          ${formData.dateOfBirth ? new Date(formData.dateOfBirth) : null},
          ${formData.birthYear ? Number.parseInt(formData.birthYear) : null},
          ${formData.program}, ${formData.howHeardAboutUs},
          ${JSON.stringify(formData.needs)}, ${JSON.stringify(formData.seeStaff)}, ${formData.otherSupport},
          ${formData.languages ? formData.languages.split(",").map((l: string) => l.trim()) : []},
          ${JSON.stringify(formData.currentHousingStatus)}, ${JSON.stringify(formData.pastHousingStatus)},
          ${formData.race}, ${formData.ethnicity}, ${formData.gender}, ${formData.isDisabled}, ${formData.isVeteran},
          ${formData.employmentStatus}, ${JSON.stringify(formData.incomeSources)},
          ${formData.goal1}, ${formData.goal2}, ${formData.goal3},
          ${formData.phone}, ${formData.email}, ${formData.preferredContactMethod},
          ${formData.emergencyContactName}, ${formData.emergencyContactRelationship}, ${formData.emergencyContactPhone},
          ${overallCompletion}, ${JSON.stringify(sectionCompletion)}, ${overallCompletion === 100},
          ${overallCompletion === 100 ? new Date() : null}
        )
        RETURNING id
      `

      await auditLog({
        action: "CREATE",
        tableName: "intake_forms",
        recordId: result[0].id.toString(),
        clientName: formData.name,
        userEmail: getUserFromRequest(request),
        ipAddress: getIpFromRequest(request),
        changes: {
          client_id: clientId,
          program: formData.program,
          completion_percentage: overallCompletion,
          is_completed: overallCompletion === 100,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving intake form:", error)
    console.error("[v0] Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json({ error: "Failed to save intake form" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    console.log("[v0] Fetching intake form for client:", clientId)

    const form = await sql`
      SELECT * FROM intake_forms WHERE client_id = ${clientId}
    `

    console.log("[v0] Form fetch completed, found:", form.length, "records")

    return NextResponse.json({ form: form[0] || null })
  } catch (error) {
    console.error("[v0] Error fetching intake form:", error)
    console.error("[v0] Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json({ error: "Failed to fetch intake form" }, { status: 500 })
  }
}
