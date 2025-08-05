import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

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
    const serviceFilter = searchParams.get("serviceFilter")

    let whereClause = ""

    // Add service filter using fast boolean columns if specified
    if (serviceFilter === "cm") {
      whereClause = `WHERE (
        case_management_requested = true OR
        case_management_provided = true OR
        housing_requested = true OR
        housing_provided = true
      )`
    } else if (serviceFilter === "ot") {
      whereClause = `WHERE (
        occupational_therapy_requested > 0 OR
        occupational_therapy_provided > 0
      )`
    } else if (serviceFilter === "food") {
      whereClause = `WHERE (
        services_requested @> '["Food"]' OR
        services_provided::text ILIKE '%"service":"Food"%'
      )`
    } else if (serviceFilter === "healthcare") {
      whereClause = `WHERE (
        services_requested @> '["Healthcare"]' OR
        services_provided::text ILIKE '%"service":"Healthcare"%'
      )`
    } else if (serviceFilter === "housing") {
      whereClause = `WHERE (
        services_requested @> '["Housing"]' OR
        services_provided::text ILIKE '%"service":"Housing"%'
      )`
    } else if (serviceFilter === "employment") {
      whereClause = `WHERE (
        services_requested @> '["Employment"]' OR
        services_provided::text ILIKE '%"service":"Employment"%'
      )`
    } else if (serviceFilter === "id") {
      whereClause = `WHERE (
        services_requested @> '["ID"]' OR
        services_provided::text ILIKE '%"service":"ID"%'
      )`
    } else if (serviceFilter === "laundry") {
      whereClause = `WHERE (
        services_requested @> '["Laundry"]' OR
        services_provided::text ILIKE '%"service":"Laundry"%'
      )`
    } else if (serviceFilter === "recreation") {
      whereClause = `WHERE (
        services_requested @> '["Recreation"]' OR
        services_provided::text ILIKE '%"service":"Recreation"%'
      )`
    } else if (serviceFilter === "other") {
      whereClause = `WHERE (
        services_requested @> '["Other"]' OR
        services_provided::text ILIKE '%"service":"Other"%'
      )`
    }

    // Get unique providers
    const providersQuery = `
      SELECT DISTINCT provider_name as name
      FROM contacts
      ${whereClause}
      ORDER BY provider_name
    `
    const providersResult = await sql.query(providersQuery)
    const providers = providersResult.map((row: any) => row.name)

    // Get unique categories
    const categoriesQuery = `
      SELECT DISTINCT category
      FROM contacts
      ${whereClause}
      ORDER BY category
    `
    const categoriesResult = await sql.query(categoriesQuery)
    const categories = categoriesResult.map((row: any) => row.category)

    // Get unique clients
    const clientsQuery = `
      SELECT DISTINCT client_name as name
      FROM contacts
      ${whereClause}
      ORDER BY client_name
    `
    const clientsResult = await sql.query(clientsQuery)
    const clients = clientsResult.map((row: any) => ({ name: row.name }))

    return NextResponse.json({
      providers,
      categories,
      clients,
    })
  } catch (error) {
    console.error("Failed to fetch filter data:", error)
    return NextResponse.json({ error: "Failed to fetch filter data" }, { status: 500 })
  }
}
