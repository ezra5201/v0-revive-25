// app/api/analytics/services-impact/route.ts
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") ?? "This Month"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let serviceData = []

    // Separate complete queries for each time period
    switch (period) {
      case "Today":
        serviceData = await sql`
          SELECT 'Food' as service_name,
                 COALESCE(SUM(food_requested), 0) as total_requested,
                 COALESCE(SUM(food_provided), 0) as total_provided,
                 CASE WHEN SUM(food_requested) > 0 
                      THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE
          AND (food_requested > 0 OR food_provided > 0)
          
          UNION ALL
          
          SELECT 'Housing' as service_name,
                 COALESCE(SUM(housing_requested), 0) as total_requested,
                 COALESCE(SUM(housing_provided), 0) as total_provided,
                 CASE WHEN SUM(housing_requested) > 0 
                      THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE
          AND (housing_requested > 0 OR housing_provided > 0)
          
          UNION ALL
          
          SELECT 'Healthcare' as service_name,
                 COALESCE(SUM(healthcare_requested), 0) as total_requested,
                 COALESCE(SUM(healthcare_provided), 0) as total_provided,
                 CASE WHEN SUM(healthcare_requested) > 0 
                      THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE
          AND (healthcare_requested > 0 OR healthcare_provided > 0)
          
          UNION ALL
          
          SELECT 'Case Management' as service_name,
                 COALESCE(SUM(case_management_requested), 0) as total_requested,
                 COALESCE(SUM(case_management_provided), 0) as total_provided,
                 CASE WHEN SUM(case_management_requested) > 0 
                      THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE
          AND (case_management_requested > 0 OR case_management_provided > 0)
          
          UNION ALL
          
          SELECT 'Benefits' as service_name,
                 COALESCE(SUM(benefits_requested), 0) as total_requested,
                 COALESCE(SUM(benefits_provided), 0) as total_provided,
                 CASE WHEN SUM(benefits_requested) > 0 
                      THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE
          AND (benefits_requested > 0 OR benefits_provided > 0)
          
          UNION ALL
          
          SELECT 'Employment' as service_name,
                 COALESCE(SUM(employment_requested), 0) as total_requested,
                 COALESCE(SUM(employment_provided), 0) as total_provided,
                 CASE WHEN SUM(employment_requested) > 0 
                      THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE
          AND (employment_requested > 0 OR employment_provided > 0)
          
          UNION ALL
          
          SELECT 'Legal' as service_name,
                 COALESCE(SUM(legal_requested), 0) as total_requested,
                 COALESCE(SUM(legal_provided), 0) as total_provided,
                 CASE WHEN SUM(legal_requested) > 0 
                      THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE
          AND (legal_requested > 0 OR legal_provided > 0)
          
          UNION ALL
          
          SELECT 'Transportation' as service_name,
                 COALESCE(SUM(transportation_requested), 0) as total_requested,
                 COALESCE(SUM(transportation_provided), 0) as total_provided,
                 CASE WHEN SUM(transportation_requested) > 0 
                      THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE
          AND (transportation_requested > 0 OR transportation_provided > 0)
          
          UNION ALL
          
          SELECT 'Mental Health' as service_name,
                 COALESCE(SUM(mental_health_requested), 0) as total_requested,
                 COALESCE(SUM(mental_health_provided), 0) as total_provided,
                 CASE WHEN SUM(mental_health_requested) > 0 
                      THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE
          AND (mental_health_requested > 0 OR mental_health_provided > 0)
          
          UNION ALL
          
          SELECT 'Education' as service_name,
                 COALESCE(SUM(education_requested), 0) as total_requested,
                 COALESCE(SUM(education_provided), 0) as total_provided,
                 CASE WHEN SUM(education_requested) > 0 
                      THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE
          AND (education_requested > 0 OR education_provided > 0)

          UNION ALL

          SELECT 'Occupational Therapy' as service_name,
                 COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                 COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                 CASE WHEN SUM(occupational_therapy_requested) > 0 
                      THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE
          AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
        `
        break

      case "Yesterday":
        serviceData = await sql`
          SELECT 'Food' as service_name,
                 COALESCE(SUM(food_requested), 0) as total_requested,
                 COALESCE(SUM(food_provided), 0) as total_provided,
                 CASE WHEN SUM(food_requested) > 0 
                      THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'
          AND (food_requested > 0 OR food_provided > 0)
          
          UNION ALL
          
          SELECT 'Housing' as service_name,
                 COALESCE(SUM(housing_requested), 0) as total_requested,
                 COALESCE(SUM(housing_provided), 0) as total_provided,
                 CASE WHEN SUM(housing_requested) > 0 
                      THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'
          AND (housing_requested > 0 OR housing_provided > 0)
          
          UNION ALL
          
          SELECT 'Healthcare' as service_name,
                 COALESCE(SUM(healthcare_requested), 0) as total_requested,
                 COALESCE(SUM(healthcare_provided), 0) as total_provided,
                 CASE WHEN SUM(healthcare_requested) > 0 
                      THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'
          AND (healthcare_requested > 0 OR healthcare_provided > 0)
          
          UNION ALL
          
          SELECT 'Case Management' as service_name,
                 COALESCE(SUM(case_management_requested), 0) as total_requested,
                 COALESCE(SUM(case_management_provided), 0) as total_provided,
                 CASE WHEN SUM(case_management_requested) > 0 
                      THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'
          AND (case_management_requested > 0 OR case_management_provided > 0)
          
          UNION ALL
          
          SELECT 'Benefits' as service_name,
                 COALESCE(SUM(benefits_requested), 0) as total_requested,
                 COALESCE(SUM(benefits_provided), 0) as total_provided,
                 CASE WHEN SUM(benefits_requested) > 0 
                      THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'
          AND (benefits_requested > 0 OR benefits_provided > 0)
          
          UNION ALL
          
          SELECT 'Employment' as service_name,
                 COALESCE(SUM(employment_requested), 0) as total_requested,
                 COALESCE(SUM(employment_provided), 0) as total_provided,
                 CASE WHEN SUM(employment_requested) > 0 
                      THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'
          AND (employment_requested > 0 OR employment_provided > 0)
          
          UNION ALL
          
          SELECT 'Legal' as service_name,
                 COALESCE(SUM(legal_requested), 0) as total_requested,
                 COALESCE(SUM(legal_provided), 0) as total_provided,
                 CASE WHEN SUM(legal_requested) > 0 
                      THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'
          AND (legal_requested > 0 OR legal_provided > 0)
          
          UNION ALL
          
          SELECT 'Transportation' as service_name,
                 COALESCE(SUM(transportation_requested), 0) as total_requested,
                 COALESCE(SUM(transportation_provided), 0) as total_provided,
                 CASE WHEN SUM(transportation_requested) > 0 
                      THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'
          AND (transportation_requested > 0 OR transportation_provided > 0)
          
          UNION ALL
          
          SELECT 'Mental Health' as service_name,
                 COALESCE(SUM(mental_health_requested), 0) as total_requested,
                 COALESCE(SUM(mental_health_provided), 0) as total_provided,
                 CASE WHEN SUM(mental_health_requested) > 0 
                      THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'
          AND (mental_health_requested > 0 OR mental_health_provided > 0)
          
          UNION ALL
          
          SELECT 'Education' as service_name,
                 COALESCE(SUM(education_requested), 0) as total_requested,
                 COALESCE(SUM(education_provided), 0) as total_provided,
                 CASE WHEN SUM(education_requested) > 0 
                      THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'
          AND (education_requested > 0 OR education_provided > 0)

          UNION ALL

          SELECT 'Occupational Therapy' as service_name,
                 COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                 COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                 CASE WHEN SUM(occupational_therapy_requested) > 0 
                      THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'
          AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
        `
        break

      case "This Week":
        serviceData = await sql`
          SELECT 'Food' as service_name,
                 COALESCE(SUM(food_requested), 0) as total_requested,
                 COALESCE(SUM(food_provided), 0) as total_provided,
                 CASE WHEN SUM(food_requested) > 0 
                      THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)
          AND (food_requested > 0 OR food_provided > 0)
          
          UNION ALL
          
          SELECT 'Housing' as service_name,
                 COALESCE(SUM(housing_requested), 0) as total_requested,
                 COALESCE(SUM(housing_provided), 0) as total_provided,
                 CASE WHEN SUM(housing_requested) > 0 
                      THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)
          AND (housing_requested > 0 OR housing_provided > 0)
          
          UNION ALL
          
          SELECT 'Healthcare' as service_name,
                 COALESCE(SUM(healthcare_requested), 0) as total_requested,
                 COALESCE(SUM(healthcare_provided), 0) as total_provided,
                 CASE WHEN SUM(healthcare_requested) > 0 
                      THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)
          AND (healthcare_requested > 0 OR healthcare_provided > 0)
          
          UNION ALL
          
          SELECT 'Case Management' as service_name,
                 COALESCE(SUM(case_management_requested), 0) as total_requested,
                 COALESCE(SUM(case_management_provided), 0) as total_provided,
                 CASE WHEN SUM(case_management_requested) > 0 
                      THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)
          AND (case_management_requested > 0 OR case_management_provided > 0)
          
          UNION ALL
          
          SELECT 'Benefits' as service_name,
                 COALESCE(SUM(benefits_requested), 0) as total_requested,
                 COALESCE(SUM(benefits_provided), 0) as total_provided,
                 CASE WHEN SUM(benefits_requested) > 0 
                      THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)
          AND (benefits_requested > 0 OR benefits_provided > 0)
          
          UNION ALL
          
          SELECT 'Employment' as service_name,
                 COALESCE(SUM(employment_requested), 0) as total_requested,
                 COALESCE(SUM(employment_provided), 0) as total_provided,
                 CASE WHEN SUM(employment_requested) > 0 
                      THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)
          AND (employment_requested > 0 OR employment_provided > 0)
          
          UNION ALL
          
          SELECT 'Legal' as service_name,
                 COALESCE(SUM(legal_requested), 0) as total_requested,
                 COALESCE(SUM(legal_provided), 0) as total_provided,
                 CASE WHEN SUM(legal_requested) > 0 
                      THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)
          AND (legal_requested > 0 OR legal_provided > 0)
          
          UNION ALL
          
          SELECT 'Transportation' as service_name,
                 COALESCE(SUM(transportation_requested), 0) as total_requested,
                 COALESCE(SUM(transportation_provided), 0) as total_provided,
                 CASE WHEN SUM(transportation_requested) > 0 
                      THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)
          AND (transportation_requested > 0 OR transportation_provided > 0)
          
          UNION ALL
          
          SELECT 'Mental Health' as service_name,
                 COALESCE(SUM(mental_health_requested), 0) as total_requested,
                 COALESCE(SUM(mental_health_provided), 0) as total_provided,
                 CASE WHEN SUM(mental_health_requested) > 0 
                      THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)
          AND (mental_health_requested > 0 OR mental_health_provided > 0)
          
          UNION ALL
          
          SELECT 'Education' as service_name,
                 COALESCE(SUM(education_requested), 0) as total_requested,
                 COALESCE(SUM(education_provided), 0) as total_provided,
                 CASE WHEN SUM(education_requested) > 0 
                      THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)
          AND (education_requested > 0 OR education_provided > 0)

          UNION ALL

          SELECT 'Occupational Therapy' as service_name,
                 COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                 COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                 CASE WHEN SUM(occupational_therapy_requested) > 0 
                      THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)
          AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
        `
        break

      case "Last Week":
        serviceData = await sql`
          SELECT 'Food' as service_name,
                 COALESCE(SUM(food_requested), 0) as total_requested,
                 COALESCE(SUM(food_provided), 0) as total_provided,
                 CASE WHEN SUM(food_requested) > 0 
                      THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
          AND (food_requested > 0 OR food_provided > 0)
          
          UNION ALL
          
          SELECT 'Housing' as service_name,
                 COALESCE(SUM(housing_requested), 0) as total_requested,
                 COALESCE(SUM(housing_provided), 0) as total_provided,
                 CASE WHEN SUM(housing_requested) > 0 
                      THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
          AND (housing_requested > 0 OR housing_provided > 0)
          
          UNION ALL
          
          SELECT 'Healthcare' as service_name,
                 COALESCE(SUM(healthcare_requested), 0) as total_requested,
                 COALESCE(SUM(healthcare_provided), 0) as total_provided,
                 CASE WHEN SUM(healthcare_requested) > 0 
                      THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
          AND (healthcare_requested > 0 OR healthcare_provided > 0)
          
          UNION ALL
          
          SELECT 'Case Management' as service_name,
                 COALESCE(SUM(case_management_requested), 0) as total_requested,
                 COALESCE(SUM(case_management_provided), 0) as total_provided,
                 CASE WHEN SUM(case_management_requested) > 0 
                      THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
          AND (case_management_requested > 0 OR case_management_provided > 0)
          
          UNION ALL
          
          SELECT 'Benefits' as service_name,
                 COALESCE(SUM(benefits_requested), 0) as total_requested,
                 COALESCE(SUM(benefits_provided), 0) as total_provided,
                 CASE WHEN SUM(benefits_requested) > 0 
                      THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
          AND (benefits_requested > 0 OR benefits_provided > 0)
          
          UNION ALL
          
          SELECT 'Employment' as service_name,
                 COALESCE(SUM(employment_requested), 0) as total_requested,
                 COALESCE(SUM(employment_provided), 0) as total_provided,
                 CASE WHEN SUM(employment_requested) > 0 
                      THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
          AND (employment_requested > 0 OR employment_provided > 0)
          
          UNION ALL
          
          SELECT 'Legal' as service_name,
                 COALESCE(SUM(legal_requested), 0) as total_requested,
                 COALESCE(SUM(legal_provided), 0) as total_provided,
                 CASE WHEN SUM(legal_requested) > 0 
                      THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
          AND (legal_requested > 0 OR legal_provided > 0)
          
          UNION ALL
          
          SELECT 'Transportation' as service_name,
                 COALESCE(SUM(transportation_requested), 0) as total_requested,
                 COALESCE(SUM(transportation_provided), 0) as total_provided,
                 CASE WHEN SUM(transportation_requested) > 0 
                      THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
          AND (transportation_requested > 0 OR transportation_provided > 0)
          
          UNION ALL
          
          SELECT 'Mental Health' as service_name,
                 COALESCE(SUM(mental_health_requested), 0) as total_requested,
                 COALESCE(SUM(mental_health_provided), 0) as total_provided,
                 CASE WHEN SUM(mental_health_requested) > 0 
                      THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
          AND (mental_health_requested > 0 OR mental_health_provided > 0)
          
          UNION ALL
          
          SELECT 'Education' as service_name,
                 COALESCE(SUM(education_requested), 0) as total_requested,
                 COALESCE(SUM(education_provided), 0) as total_provided,
                 CASE WHEN SUM(education_requested) > 0 
                      THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
          AND (education_requested > 0 OR education_provided > 0)

          UNION ALL

          SELECT 'Occupational Therapy' as service_name,
                 COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                 COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                 CASE WHEN SUM(occupational_therapy_requested) > 0 
                      THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
          AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
        `
        break

      case "This Month":
        serviceData = await sql`
          SELECT 'Food' as service_name,
                 COALESCE(SUM(food_requested), 0) as total_requested,
                 COALESCE(SUM(food_provided), 0) as total_provided,
                 CASE WHEN SUM(food_requested) > 0 
                      THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (food_requested > 0 OR food_provided > 0)
          
          UNION ALL
          
          SELECT 'Housing' as service_name,
                 COALESCE(SUM(housing_requested), 0) as total_requested,
                 COALESCE(SUM(housing_provided), 0) as total_provided,
                 CASE WHEN SUM(housing_requested) > 0 
                      THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (housing_requested > 0 OR housing_provided > 0)
          
          UNION ALL
          
          SELECT 'Healthcare' as service_name,
                 COALESCE(SUM(healthcare_requested), 0) as total_requested,
                 COALESCE(SUM(healthcare_provided), 0) as total_provided,
                 CASE WHEN SUM(healthcare_requested) > 0 
                      THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (healthcare_requested > 0 OR healthcare_provided > 0)
          
          UNION ALL
          
          SELECT 'Case Management' as service_name,
                 COALESCE(SUM(case_management_requested), 0) as total_requested,
                 COALESCE(SUM(case_management_provided), 0) as total_provided,
                 CASE WHEN SUM(case_management_requested) > 0 
                      THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (case_management_requested > 0 OR case_management_provided > 0)
          
          UNION ALL
          
          SELECT 'Benefits' as service_name,
                 COALESCE(SUM(benefits_requested), 0) as total_requested,
                 COALESCE(SUM(benefits_provided), 0) as total_provided,
                 CASE WHEN SUM(benefits_requested) > 0 
                      THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (benefits_requested > 0 OR benefits_provided > 0)
          
          UNION ALL
          
          SELECT 'Employment' as service_name,
                 COALESCE(SUM(employment_requested), 0) as total_requested,
                 COALESCE(SUM(employment_provided), 0) as total_provided,
                 CASE WHEN SUM(employment_requested) > 0 
                      THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (employment_requested > 0 OR employment_provided > 0)
          
          UNION ALL
          
          SELECT 'Legal' as service_name,
                 COALESCE(SUM(legal_requested), 0) as total_requested,
                 COALESCE(SUM(legal_provided), 0) as total_provided,
                 CASE WHEN SUM(legal_requested) > 0 
                      THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (legal_requested > 0 OR legal_provided > 0)
          
          UNION ALL
          
          SELECT 'Transportation' as service_name,
                 COALESCE(SUM(transportation_requested), 0) as total_requested,
                 COALESCE(SUM(transportation_provided), 0) as total_provided,
                 CASE WHEN SUM(transportation_requested) > 0 
                      THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (transportation_requested > 0 OR transportation_provided > 0)
          
          UNION ALL
          
          SELECT 'Mental Health' as service_name,
                 COALESCE(SUM(mental_health_requested), 0) as total_requested,
                 COALESCE(SUM(mental_health_provided), 0) as total_provided,
                 CASE WHEN SUM(mental_health_requested) > 0 
                      THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (mental_health_requested > 0 OR mental_health_provided > 0)
          
          UNION ALL
          
          SELECT 'Education' as service_name,
                 COALESCE(SUM(education_requested), 0) as total_requested,
                 COALESCE(SUM(education_provided), 0) as total_provided,
                 CASE WHEN SUM(education_requested) > 0 
                      THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (education_requested > 0 OR education_provided > 0)

          UNION ALL

          SELECT 'Occupational Therapy' as service_name,
                 COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                 COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                 CASE WHEN SUM(occupational_therapy_requested) > 0 
                      THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
        `
        break

      case "Last Month":
        serviceData = await sql`
          SELECT 'Food' as service_name,
                 COALESCE(SUM(food_requested), 0) as total_requested,
                 COALESCE(SUM(food_provided), 0) as total_provided,
                 CASE WHEN SUM(food_requested) > 0 
                      THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND (food_requested > 0 OR food_provided > 0)
          
          UNION ALL
          
          SELECT 'Housing' as service_name,
                 COALESCE(SUM(housing_requested), 0) as total_requested,
                 COALESCE(SUM(housing_provided), 0) as total_provided,
                 CASE WHEN SUM(housing_requested) > 0 
                      THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND (housing_requested > 0 OR housing_provided > 0)
          
          UNION ALL
          
          SELECT 'Healthcare' as service_name,
                 COALESCE(SUM(healthcare_requested), 0) as total_requested,
                 COALESCE(SUM(healthcare_provided), 0) as total_provided,
                 CASE WHEN SUM(healthcare_requested) > 0 
                      THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND (healthcare_requested > 0 OR healthcare_provided > 0)
          
          UNION ALL
          
          SELECT 'Case Management' as service_name,
                 COALESCE(SUM(case_management_requested), 0) as total_requested,
                 COALESCE(SUM(case_management_provided), 0) as total_provided,
                 CASE WHEN SUM(case_management_requested) > 0 
                      THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND (case_management_requested > 0 OR case_management_provided > 0)
          
          UNION ALL
          
          SELECT 'Benefits' as service_name,
                 COALESCE(SUM(benefits_requested), 0) as total_requested,
                 COALESCE(SUM(benefits_provided), 0) as total_provided,
                 CASE WHEN SUM(benefits_requested) > 0 
                      THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND (benefits_requested > 0 OR benefits_provided > 0)
          
          UNION ALL
          
          SELECT 'Employment' as service_name,
                 COALESCE(SUM(employment_requested), 0) as total_requested,
                 COALESCE(SUM(employment_provided), 0) as total_provided,
                 CASE WHEN SUM(employment_requested) > 0 
                      THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND (employment_requested > 0 OR employment_provided > 0)
          
          UNION ALL
          
          SELECT 'Legal' as service_name,
                 COALESCE(SUM(legal_requested), 0) as total_requested,
                 COALESCE(SUM(legal_provided), 0) as total_provided,
                 CASE WHEN SUM(legal_requested) > 0 
                      THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND (legal_requested > 0 OR legal_provided > 0)
          
          UNION ALL
          
          SELECT 'Transportation' as service_name,
                 COALESCE(SUM(transportation_requested), 0) as total_requested,
                 COALESCE(SUM(transportation_provided), 0) as total_provided,
                 CASE WHEN SUM(transportation_requested) > 0 
                      THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND (transportation_requested > 0 OR transportation_provided > 0)
          
          UNION ALL
          
          SELECT 'Mental Health' as service_name,
                 COALESCE(SUM(mental_health_requested), 0) as total_requested,
                 COALESCE(SUM(mental_health_provided), 0) as total_provided,
                 CASE WHEN SUM(mental_health_requested) > 0 
                      THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND (mental_health_requested > 0 OR mental_health_provided > 0)
          
          UNION ALL
          
          SELECT 'Education' as service_name,
                 COALESCE(SUM(education_requested), 0) as total_requested,
                 COALESCE(SUM(education_provided), 0) as total_provided,
                 CASE WHEN SUM(education_requested) > 0 
                      THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND (education_requested > 0 OR education_provided > 0)

          UNION ALL

          SELECT 'Occupational Therapy' as service_name,
                 COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                 COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                 CASE WHEN SUM(occupational_therapy_requested) > 0 
                      THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
        `
        break

      case "Last 3 Months":
        serviceData = await sql`
          SELECT 'Food' as service_name,
                 COALESCE(SUM(food_requested), 0) as total_requested,
                 COALESCE(SUM(food_provided), 0) as total_provided,
                 CASE WHEN SUM(food_requested) > 0 
                      THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
          FROM contacts 
          WHERE contact_date >= CURRENT_DATE - INTERVAL '3 months'
          AND (food_requested > 0 OR food_provided > 0)
          
          UNION ALL
          
          SELECT 'Housing' as service_name,
                 COALESCE(SUM(housing_requested), 0) as total_requested,
                 COALESCE(SUM(housing_provided), 0) as total_provided,
                 CASE WHEN SUM(housing_requested) > 0 
                      THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
          FROM contacts 
          WHERE contact_date >= CURRENT_DATE - INTERVAL '3 months'
          AND (housing_requested > 0 OR housing_provided > 0)
          
          UNION ALL
          
          SELECT 'Healthcare' as service_name,
                 COALESCE(SUM(healthcare_requested), 0) as total_requested,
                 COALESCE(SUM(healthcare_provided), 0) as total_provided,
                 CASE WHEN SUM(healthcare_requested) > 0 
                      THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
          FROM contacts 
          WHERE contact_date >= CURRENT_DATE - INTERVAL '3 months'
          AND (healthcare_requested > 0 OR healthcare_provided > 0)
          
          UNION ALL
          
          SELECT 'Case Management' as service_name,
                 COALESCE(SUM(case_management_requested), 0) as total_requested,
                 COALESCE(SUM(case_management_provided), 0) as total_provided,
                 CASE WHEN SUM(case_management_requested) > 0 
                      THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
          FROM contacts 
          WHERE contact_date >= CURRENT_DATE - INTERVAL '3 months'
          AND (case_management_requested > 0 OR case_management_provided > 0)
          
          UNION ALL
          
          SELECT 'Benefits' as service_name,
                 COALESCE(SUM(benefits_requested), 0) as total_requested,
                 COALESCE(SUM(benefits_provided), 0) as total_provided,
                 CASE WHEN SUM(benefits_requested) > 0 
                      THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
          FROM contacts 
          WHERE contact_date >= CURRENT_DATE - INTERVAL '3 months'
          AND (benefits_requested > 0 OR benefits_provided > 0)
          
          UNION ALL
          
          SELECT 'Employment' as service_name,
                 COALESCE(SUM(employment_requested), 0) as total_requested,
                 COALESCE(SUM(employment_provided), 0) as total_provided,
                 CASE WHEN SUM(employment_requested) > 0 
                      THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
          FROM contacts 
          WHERE contact_date >= CURRENT_DATE - INTERVAL '3 months'
          AND (employment_requested > 0 OR employment_provided > 0)
          
          UNION ALL
          
          SELECT 'Legal' as service_name,
                 COALESCE(SUM(legal_requested), 0) as total_requested,
                 COALESCE(SUM(legal_provided), 0) as total_provided,
                 CASE WHEN SUM(legal_requested) > 0 
                      THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
          FROM contacts 
          WHERE contact_date >= CURRENT_DATE - INTERVAL '3 months'
          AND (legal_requested > 0 OR legal_provided > 0)
          
          UNION ALL
          
          SELECT 'Transportation' as service_name,
                 COALESCE(SUM(transportation_requested), 0) as total_requested,
                 COALESCE(SUM(transportation_provided), 0) as total_provided,
                 CASE WHEN SUM(transportation_requested) > 0 
                      THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
          FROM contacts 
          WHERE contact_date >= CURRENT_DATE - INTERVAL '3 months'
          AND (transportation_requested > 0 OR transportation_provided > 0)
          
          UNION ALL
          
          SELECT 'Mental Health' as service_name,
                 COALESCE(SUM(mental_health_requested), 0) as total_requested,
                 COALESCE(SUM(mental_health_provided), 0) as total_provided,
                 CASE WHEN SUM(mental_health_requested) > 0 
                      THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
          FROM contacts 
          WHERE contact_date >= CURRENT_DATE - INTERVAL '3 months'
          AND (mental_health_requested > 0 OR mental_health_provided > 0)
          
          UNION ALL
          
          SELECT 'Education' as service_name,
                 COALESCE(SUM(education_requested), 0) as total_requested,
                 COALESCE(SUM(education_provided), 0) as total_provided,
                 CASE WHEN SUM(education_requested) > 0 
                      THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
          FROM contacts 
          WHERE contact_date >= CURRENT_DATE - INTERVAL '3 months'
          AND (education_requested > 0 OR education_provided > 0)

          UNION ALL

          SELECT 'Occupational Therapy' as service_name,
                 COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                 COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                 CASE WHEN SUM(occupational_therapy_requested) > 0 
                      THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
          FROM contacts 
          WHERE contact_date >= CURRENT_DATE - INTERVAL '3 months'
          AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
        `
        break

      case "This Quarter":
        serviceData = await sql`
          SELECT 'Food' as service_name,
                 COALESCE(SUM(food_requested), 0) as total_requested,
                 COALESCE(SUM(food_provided), 0) as total_provided,
                 CASE WHEN SUM(food_requested) > 0 
                      THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE)
          AND (food_requested > 0 OR food_provided > 0)
          
          UNION ALL
          
          SELECT 'Housing' as service_name,
                 COALESCE(SUM(housing_requested), 0) as total_requested,
                 COALESCE(SUM(housing_provided), 0) as total_provided,
                 CASE WHEN SUM(housing_requested) > 0 
                      THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE)
          AND (housing_requested > 0 OR housing_provided > 0)
          
          UNION ALL
          
          SELECT 'Healthcare' as service_name,
                 COALESCE(SUM(healthcare_requested), 0) as total_requested,
                 COALESCE(SUM(healthcare_provided), 0) as total_provided,
                 CASE WHEN SUM(healthcare_requested) > 0 
                      THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE)
          AND (healthcare_requested > 0 OR healthcare_provided > 0)
          
          UNION ALL
          
          SELECT 'Case Management' as service_name,
                 COALESCE(SUM(case_management_requested), 0) as total_requested,
                 COALESCE(SUM(case_management_provided), 0) as total_provided,
                 CASE WHEN SUM(case_management_requested) > 0 
                      THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE)
          AND (case_management_requested > 0 OR case_management_provided > 0)
          
          UNION ALL
          
          SELECT 'Benefits' as service_name,
                 COALESCE(SUM(benefits_requested), 0) as total_requested,
                 COALESCE(SUM(benefits_provided), 0) as total_provided,
                 CASE WHEN SUM(benefits_requested) > 0 
                      THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE)
          AND (benefits_requested > 0 OR benefits_provided > 0)
          
          UNION ALL
          
          SELECT 'Employment' as service_name,
                 COALESCE(SUM(employment_requested), 0) as total_requested,
                 COALESCE(SUM(employment_provided), 0) as total_provided,
                 CASE WHEN SUM(employment_requested) > 0 
                      THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE)
          AND (employment_requested > 0 OR employment_provided > 0)
          
          UNION ALL
          
          SELECT 'Legal' as service_name,
                 COALESCE(SUM(legal_requested), 0) as total_requested,
                 COALESCE(SUM(legal_provided), 0) as total_provided,
                 CASE WHEN SUM(legal_requested) > 0 
                      THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE)
          AND (legal_requested > 0 OR legal_provided > 0)
          
          UNION ALL
          
          SELECT 'Transportation' as service_name,
                 COALESCE(SUM(transportation_requested), 0) as total_requested,
                 COALESCE(SUM(transportation_provided), 0) as total_provided,
                 CASE WHEN SUM(transportation_requested) > 0 
                      THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE)
          AND (transportation_requested > 0 OR transportation_provided > 0)
          
          UNION ALL
          
          SELECT 'Mental Health' as service_name,
                 COALESCE(SUM(mental_health_requested), 0) as total_requested,
                 COALESCE(SUM(mental_health_provided), 0) as total_provided,
                 CASE WHEN SUM(mental_health_requested) > 0 
                      THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE)
          AND (mental_health_requested > 0 OR mental_health_provided > 0)
          
          UNION ALL
          
          SELECT 'Education' as service_name,
                 COALESCE(SUM(education_requested), 0) as total_requested,
                 COALESCE(SUM(education_provided), 0) as total_provided,
                 CASE WHEN SUM(education_requested) > 0 
                      THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE)
          AND (education_requested > 0 OR education_provided > 0)

          UNION ALL

          SELECT 'Occupational Therapy' as service_name,
                 COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                 COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                 CASE WHEN SUM(occupational_therapy_requested) > 0 
                      THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE)
          AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
        `
        break

      case "Last Quarter":
        serviceData = await sql`
          SELECT 'Food' as service_name,
                 COALESCE(SUM(food_requested), 0) as total_requested,
                 COALESCE(SUM(food_provided), 0) as total_provided,
                 CASE WHEN SUM(food_requested) > 0 
                      THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
          AND (food_requested > 0 OR food_provided > 0)
          
          UNION ALL
          
          SELECT 'Housing' as service_name,
                 COALESCE(SUM(housing_requested), 0) as total_requested,
                 COALESCE(SUM(housing_provided), 0) as total_provided,
                 CASE WHEN SUM(housing_requested) > 0 
                      THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
          AND (housing_requested > 0 OR housing_provided > 0)
          
          UNION ALL
          
          SELECT 'Healthcare' as service_name,
                 COALESCE(SUM(healthcare_requested), 0) as total_requested,
                 COALESCE(SUM(healthcare_provided), 0) as total_provided,
                 CASE WHEN SUM(healthcare_requested) > 0 
                      THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
          AND (healthcare_requested > 0 OR healthcare_provided > 0)
          
          UNION ALL
          
          SELECT 'Case Management' as service_name,
                 COALESCE(SUM(case_management_requested), 0) as total_requested,
                 COALESCE(SUM(case_management_provided), 0) as total_provided,
                 CASE WHEN SUM(case_management_requested) > 0 
                      THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
          AND (case_management_requested > 0 OR case_management_provided > 0)
          
          UNION ALL
          
          SELECT 'Benefits' as service_name,
                 COALESCE(SUM(benefits_requested), 0) as total_requested,
                 COALESCE(SUM(benefits_provided), 0) as total_provided,
                 CASE WHEN SUM(benefits_requested) > 0 
                      THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
          AND (benefits_requested > 0 OR benefits_provided > 0)
          
          UNION ALL
          
          SELECT 'Employment' as service_name,
                 COALESCE(SUM(employment_requested), 0) as total_requested,
                 COALESCE(SUM(employment_provided), 0) as total_provided,
                 CASE WHEN SUM(employment_requested) > 0 
                      THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
          AND (employment_requested > 0 OR employment_provided > 0)
          
          UNION ALL
          
          SELECT 'Legal' as service_name,
                 COALESCE(SUM(legal_requested), 0) as total_requested,
                 COALESCE(SUM(legal_provided), 0) as total_provided,
                 CASE WHEN SUM(legal_requested) > 0 
                      THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
          AND (legal_requested > 0 OR legal_provided > 0)
          
          UNION ALL
          
          SELECT 'Transportation' as service_name,
                 COALESCE(SUM(transportation_requested), 0) as total_requested,
                 COALESCE(SUM(transportation_provided), 0) as total_provided,
                 CASE WHEN SUM(transportation_requested) > 0 
                      THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
          AND (transportation_requested > 0 OR transportation_provided > 0)
          
          UNION ALL
          
          SELECT 'Mental Health' as service_name,
                 COALESCE(SUM(mental_health_requested), 0) as total_requested,
                 COALESCE(SUM(mental_health_provided), 0) as total_provided,
                 CASE WHEN SUM(mental_health_requested) > 0 
                      THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
          AND (mental_health_requested > 0 OR mental_health_provided > 0)
          
          UNION ALL
          
          SELECT 'Education' as service_name,
                 COALESCE(SUM(education_requested), 0) as total_requested,
                 COALESCE(SUM(education_provided), 0) as total_provided,
                 CASE WHEN SUM(education_requested) > 0 
                      THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
          AND (education_requested > 0 OR education_provided > 0)

          UNION ALL

          SELECT 'Occupational Therapy' as service_name,
                 COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                 COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                 CASE WHEN SUM(occupational_therapy_requested) > 0 
                      THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('quarter', contact_date) = DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '3 months')
          AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
        `
        break

      case "This Year":
        serviceData = await sql`
          SELECT 'Food' as service_name,
                 COALESCE(SUM(food_requested), 0) as total_requested,
                 COALESCE(SUM(food_provided), 0) as total_provided,
                 CASE WHEN SUM(food_requested) > 0 
                      THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND (food_requested > 0 OR food_provided > 0)
          
          UNION ALL
          
          SELECT 'Housing' as service_name,
                 COALESCE(SUM(housing_requested), 0) as total_requested,
                 COALESCE(SUM(housing_provided), 0) as total_provided,
                 CASE WHEN SUM(housing_requested) > 0 
                      THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND (housing_requested > 0 OR housing_provided > 0)
          
          UNION ALL
          
          SELECT 'Healthcare' as service_name,
                 COALESCE(SUM(healthcare_requested), 0) as total_requested,
                 COALESCE(SUM(healthcare_provided), 0) as total_provided,
                 CASE WHEN SUM(healthcare_requested) > 0 
                      THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND (healthcare_requested > 0 OR healthcare_provided > 0)
          
          UNION ALL
          
          SELECT 'Case Management' as service_name,
                 COALESCE(SUM(case_management_requested), 0) as total_requested,
                 COALESCE(SUM(case_management_provided), 0) as total_provided,
                 CASE WHEN SUM(case_management_requested) > 0 
                      THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND (case_management_requested > 0 OR case_management_provided > 0)
          
          UNION ALL
          
          SELECT 'Benefits' as service_name,
                 COALESCE(SUM(benefits_requested), 0) as total_requested,
                 COALESCE(SUM(benefits_provided), 0) as total_provided,
                 CASE WHEN SUM(benefits_requested) > 0 
                      THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND (benefits_requested > 0 OR benefits_provided > 0)
          
          UNION ALL
          
          SELECT 'Employment' as service_name,
                 COALESCE(SUM(employment_requested), 0) as total_requested,
                 COALESCE(SUM(employment_provided), 0) as total_provided,
                 CASE WHEN SUM(employment_requested) > 0 
                      THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND (employment_requested > 0 OR employment_provided > 0)
          
          UNION ALL
          
          SELECT 'Legal' as service_name,
                 COALESCE(SUM(legal_requested), 0) as total_requested,
                 COALESCE(SUM(legal_provided), 0) as total_provided,
                 CASE WHEN SUM(legal_requested) > 0 
                      THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND (legal_requested > 0 OR legal_provided > 0)
          
          UNION ALL
          
          SELECT 'Transportation' as service_name,
                 COALESCE(SUM(transportation_requested), 0) as total_requested,
                 COALESCE(SUM(transportation_provided), 0) as total_provided,
                 CASE WHEN SUM(transportation_requested) > 0 
                      THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND (transportation_requested > 0 OR transportation_provided > 0)
          
          UNION ALL
          
          SELECT 'Mental Health' as service_name,
                 COALESCE(SUM(mental_health_requested), 0) as total_requested,
                 COALESCE(SUM(mental_health_provided), 0) as total_provided,
                 CASE WHEN SUM(mental_health_requested) > 0 
                      THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND (mental_health_requested > 0 OR mental_health_provided > 0)
          
          UNION ALL
          
          SELECT 'Education' as service_name,
                 COALESCE(SUM(education_requested), 0) as total_requested,
                 COALESCE(SUM(education_provided), 0) as total_provided,
                 CASE WHEN SUM(education_requested) > 0 
                      THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND (education_requested > 0 OR education_provided > 0)

          UNION ALL

          SELECT 'Occupational Therapy' as service_name,
                 COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                 COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                 CASE WHEN SUM(occupational_therapy_requested) > 0 
                      THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
          FROM contacts 
          WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)
          AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
        `
        break

      case "Specific Date":
        if (startDate) {
          serviceData = await sql`
            SELECT 'Food' as service_name,
                   COALESCE(SUM(food_requested), 0) as total_requested,
                   COALESCE(SUM(food_provided), 0) as total_provided,
                   CASE WHEN SUM(food_requested) > 0 
                        THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = ${startDate}
            AND (food_requested > 0 OR food_provided > 0)
            
            UNION ALL
            
            SELECT 'Housing' as service_name,
                   COALESCE(SUM(housing_requested), 0) as total_requested,
                   COALESCE(SUM(housing_provided), 0) as total_provided,
                   CASE WHEN SUM(housing_requested) > 0 
                        THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = ${startDate}
            AND (housing_requested > 0 OR housing_provided > 0)
            
            UNION ALL
            
            SELECT 'Healthcare' as service_name,
                   COALESCE(SUM(healthcare_requested), 0) as total_requested,
                   COALESCE(SUM(healthcare_provided), 0) as total_provided,
                   CASE WHEN SUM(healthcare_requested) > 0 
                        THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = ${startDate}
            AND (healthcare_requested > 0 OR healthcare_provided > 0)
            
            UNION ALL
            
            SELECT 'Case Management' as service_name,
                   COALESCE(SUM(case_management_requested), 0) as total_requested,
                   COALESCE(SUM(case_management_provided), 0) as total_provided,
                   CASE WHEN SUM(case_management_requested) > 0 
                        THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = ${startDate}
            AND (case_management_requested > 0 OR case_management_provided > 0)
            
            UNION ALL
            
            SELECT 'Benefits' as service_name,
                   COALESCE(SUM(benefits_requested), 0) as total_requested,
                   COALESCE(SUM(benefits_provided), 0) as total_provided,
                   CASE WHEN SUM(benefits_requested) > 0 
                        THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = ${startDate}
            AND (benefits_requested > 0 OR benefits_provided > 0)
            
            UNION ALL
            
            SELECT 'Employment' as service_name,
                   COALESCE(SUM(employment_requested), 0) as total_requested,
                   COALESCE(SUM(employment_provided), 0) as total_provided,
                   CASE WHEN SUM(employment_requested) > 0 
                        THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = ${startDate}
            AND (employment_requested > 0 OR employment_provided > 0)
            
            UNION ALL
            
            SELECT 'Legal' as service_name,
                   COALESCE(SUM(legal_requested), 0) as total_requested,
                   COALESCE(SUM(legal_provided), 0) as total_provided,
                   CASE WHEN SUM(legal_requested) > 0 
                        THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = ${startDate}
            AND (legal_requested > 0 OR legal_provided > 0)
            
            UNION ALL
            
            SELECT 'Transportation' as service_name,
                   COALESCE(SUM(transportation_requested), 0) as total_requested,
                   COALESCE(SUM(transportation_provided), 0) as total_provided,
                   CASE WHEN SUM(transportation_requested) > 0 
                        THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = ${startDate}
            AND (transportation_requested > 0 OR transportation_provided > 0)
            
            UNION ALL
            
            SELECT 'Mental Health' as service_name,
                   COALESCE(SUM(mental_health_requested), 0) as total_requested,
                   COALESCE(SUM(mental_health_provided), 0) as total_provided,
                   CASE WHEN SUM(mental_health_requested) > 0 
                        THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = ${startDate}
            AND (mental_health_requested > 0 OR mental_health_provided > 0)
            
            UNION ALL
            
            SELECT 'Education' as service_name,
                   COALESCE(SUM(education_requested), 0) as total_requested,
                   COALESCE(SUM(education_provided), 0) as total_provided,
                   CASE WHEN SUM(education_requested) > 0 
                        THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = ${startDate}
            AND (education_requested > 0 OR education_provided > 0)

            UNION ALL

            SELECT 'Occupational Therapy' as service_name,
                   COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                   COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                   CASE WHEN SUM(occupational_therapy_requested) > 0 
                        THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = ${startDate}
            AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
          `
        } else {
          // Default to today if no date provided
          serviceData = await sql`
            SELECT 'Food' as service_name,
                   COALESCE(SUM(food_requested), 0) as total_requested,
                   COALESCE(SUM(food_provided), 0) as total_provided,
                   CASE WHEN SUM(food_requested) > 0 
                        THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = CURRENT_DATE
            AND (food_requested > 0 OR food_provided > 0)
            
            UNION ALL
            
            SELECT 'Housing' as service_name,
                   COALESCE(SUM(housing_requested), 0) as total_requested,
                   COALESCE(SUM(housing_provided), 0) as total_provided,
                   CASE WHEN SUM(housing_requested) > 0 
                        THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = CURRENT_DATE
            AND (housing_requested > 0 OR housing_provided > 0)
            
            UNION ALL
            
            SELECT 'Healthcare' as service_name,
                   COALESCE(SUM(healthcare_requested), 0) as total_requested,
                   COALESCE(SUM(healthcare_provided), 0) as total_provided,
                   CASE WHEN SUM(healthcare_requested) > 0 
                        THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = CURRENT_DATE
            AND (healthcare_requested > 0 OR healthcare_provided > 0)
            
            UNION ALL
            
            SELECT 'Case Management' as service_name,
                   COALESCE(SUM(case_management_requested), 0) as total_requested,
                   COALESCE(SUM(case_management_provided), 0) as total_provided,
                   CASE WHEN SUM(case_management_requested) > 0 
                        THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = CURRENT_DATE
            AND (case_management_requested > 0 OR case_management_provided > 0)
            
            UNION ALL
            
            SELECT 'Benefits' as service_name,
                   COALESCE(SUM(benefits_requested), 0) as total_requested,
                   COALESCE(SUM(benefits_provided), 0) as total_provided,
                   CASE WHEN SUM(benefits_requested) > 0 
                        THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = CURRENT_DATE
            AND (benefits_requested > 0 OR benefits_provided > 0)
            
            UNION ALL
            
            SELECT 'Employment' as service_name,
                   COALESCE(SUM(employment_requested), 0) as total_requested,
                   COALESCE(SUM(employment_provided), 0) as total_provided,
                   CASE WHEN SUM(employment_requested) > 0 
                        THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = CURRENT_DATE
            AND (employment_requested > 0 OR employment_provided > 0)
            
            UNION ALL
            
            SELECT 'Legal' as service_name,
                   COALESCE(SUM(legal_requested), 0) as total_requested,
                   COALESCE(SUM(legal_provided), 0) as total_provided,
                   CASE WHEN SUM(legal_requested) > 0 
                        THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = CURRENT_DATE
            AND (legal_requested > 0 OR legal_provided > 0)
            
            UNION ALL
            
            SELECT 'Transportation' as service_name,
                   COALESCE(SUM(transportation_requested), 0) as total_requested,
                   COALESCE(SUM(transportation_provided), 0) as total_provided,
                   CASE WHEN SUM(transportation_requested) > 0 
                        THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = CURRENT_DATE
            AND (transportation_requested > 0 OR transportation_provided > 0)
            
            UNION ALL
            
            SELECT 'Mental Health' as service_name,
                   COALESCE(SUM(mental_health_requested), 0) as total_requested,
                   COALESCE(SUM(mental_health_provided), 0) as total_provided,
                   CASE WHEN SUM(mental_health_requested) > 0 
                        THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = CURRENT_DATE
            AND (mental_health_requested > 0 OR mental_health_provided > 0)
            
            UNION ALL
            
            SELECT 'Education' as service_name,
                   COALESCE(SUM(education_requested), 0) as total_requested,
                   COALESCE(SUM(education_provided), 0) as total_provided,
                   CASE WHEN SUM(education_requested) > 0 
                        THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = CURRENT_DATE
            AND (education_requested > 0 OR education_provided > 0)

            UNION ALL

            SELECT 'Occupational Therapy' as service_name,
                   COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                   COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                   CASE WHEN SUM(occupational_therapy_requested) > 0 
                        THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE(contact_date) = CURRENT_DATE
            AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
          `
        }
        break

      case "Custom Date Range":
        if (startDate && endDate) {
          serviceData = await sql`
            SELECT 'Food' as service_name,
                   COALESCE(SUM(food_requested), 0) as total_requested,
                   COALESCE(SUM(food_provided), 0) as total_provided,
                   CASE WHEN SUM(food_requested) > 0 
                        THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
            FROM contacts 
            WHERE contact_date >= ${startDate} AND contact_date <= ${endDate}
            AND (food_requested > 0 OR food_provided > 0)
            
            UNION ALL
            
            SELECT 'Housing' as service_name,
                   COALESCE(SUM(housing_requested), 0) as total_requested,
                   COALESCE(SUM(housing_provided), 0) as total_provided,
                   CASE WHEN SUM(housing_requested) > 0 
                        THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
            FROM contacts 
            WHERE contact_date >= ${startDate} AND contact_date <= ${endDate}
            AND (housing_requested > 0 OR housing_provided > 0)
            
            UNION ALL
            
            SELECT 'Healthcare' as service_name,
                   COALESCE(SUM(healthcare_requested), 0) as total_requested,
                   COALESCE(SUM(healthcare_provided), 0) as total_provided,
                   CASE WHEN SUM(healthcare_requested) > 0 
                        THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
            FROM contacts 
            WHERE contact_date >= ${startDate} AND contact_date <= ${endDate}
            AND (healthcare_requested > 0 OR healthcare_provided > 0)
            
            UNION ALL
            
            SELECT 'Case Management' as service_name,
                   COALESCE(SUM(case_management_requested), 0) as total_requested,
                   COALESCE(SUM(case_management_provided), 0) as total_provided,
                   CASE WHEN SUM(case_management_requested) > 0 
                        THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
            FROM contacts 
            WHERE contact_date >= ${startDate} AND contact_date <= ${endDate}
            AND (case_management_requested > 0 OR case_management_provided > 0)
            
            UNION ALL
            
            SELECT 'Benefits' as service_name,
                   COALESCE(SUM(benefits_requested), 0) as total_requested,
                   COALESCE(SUM(benefits_provided), 0) as total_provided,
                   CASE WHEN SUM(benefits_requested) > 0 
                        THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
            FROM contacts 
            WHERE contact_date >= ${startDate} AND contact_date <= ${endDate}
            AND (benefits_requested > 0 OR benefits_provided > 0)
            
            UNION ALL
            
            SELECT 'Employment' as service_name,
                   COALESCE(SUM(employment_requested), 0) as total_requested,
                   COALESCE(SUM(employment_provided), 0) as total_provided,
                   CASE WHEN SUM(employment_requested) > 0 
                        THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
            FROM contacts 
            WHERE contact_date >= ${startDate} AND contact_date <= ${endDate}
            AND (employment_requested > 0 OR employment_provided > 0)
            
            UNION ALL
            
            SELECT 'Legal' as service_name,
                   COALESCE(SUM(legal_requested), 0) as total_requested,
                   COALESCE(SUM(legal_provided), 0) as total_provided,
                   CASE WHEN SUM(legal_requested) > 0 
                        THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
            FROM contacts 
            WHERE contact_date >= ${startDate} AND contact_date <= ${endDate}
            AND (legal_requested > 0 OR legal_provided > 0)
            
            UNION ALL
            
            SELECT 'Transportation' as service_name,
                   COALESCE(SUM(transportation_requested), 0) as total_requested,
                   COALESCE(SUM(transportation_provided), 0) as total_provided,
                   CASE WHEN SUM(transportation_requested) > 0 
                        THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
            FROM contacts 
            WHERE contact_date >= ${startDate} AND contact_date <= ${endDate}
            AND (transportation_requested > 0 OR transportation_provided > 0)
            
            UNION ALL
            
            SELECT 'Mental Health' as service_name,
                   COALESCE(SUM(mental_health_requested), 0) as total_requested,
                   COALESCE(SUM(mental_health_provided), 0) as total_provided,
                   CASE WHEN SUM(mental_health_requested) > 0 
                        THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
            FROM contacts 
            WHERE contact_date >= ${startDate} AND contact_date <= ${endDate}
            AND (mental_health_requested > 0 OR mental_health_provided > 0)
            
            UNION ALL
            
            SELECT 'Education' as service_name,
                   COALESCE(SUM(education_requested), 0) as total_requested,
                   COALESCE(SUM(education_provided), 0) as total_provided,
                   CASE WHEN SUM(education_requested) > 0 
                        THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
            FROM contacts 
            WHERE contact_date >= ${startDate} AND contact_date <= ${endDate}
            AND (education_requested > 0 OR education_provided > 0)

            UNION ALL

            SELECT 'Occupational Therapy' as service_name,
                   COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                   COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                   CASE WHEN SUM(occupational_therapy_requested) > 0 
                        THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
            FROM contacts 
            WHERE contact_date >= ${startDate} AND contact_date <= ${endDate}
            AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
          `
        } else {
          // Default to this month if no dates provided
          serviceData = await sql`
            SELECT 'Food' as service_name,
                   COALESCE(SUM(food_requested), 0) as total_requested,
                   COALESCE(SUM(food_provided), 0) as total_provided,
                   CASE WHEN SUM(food_requested) > 0 
                        THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND (food_requested > 0 OR food_provided > 0)
            
            UNION ALL
            
            SELECT 'Housing' as service_name,
                   COALESCE(SUM(housing_requested), 0) as total_requested,
                   COALESCE(SUM(housing_provided), 0) as total_provided,
                   CASE WHEN SUM(housing_requested) > 0 
                        THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND (housing_requested > 0 OR housing_provided > 0)
            
            UNION ALL
            
            SELECT 'Healthcare' as service_name,
                   COALESCE(SUM(healthcare_requested), 0) as total_requested,
                   COALESCE(SUM(healthcare_provided), 0) as total_provided,
                   CASE WHEN SUM(healthcare_requested) > 0 
                        THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND (healthcare_requested > 0 OR healthcare_provided > 0)
            
            UNION ALL
            
            SELECT 'Case Management' as service_name,
                   COALESCE(SUM(case_management_requested), 0) as total_requested,
                   COALESCE(SUM(case_management_provided), 0) as total_provided,
                   CASE WHEN SUM(case_management_requested) > 0 
                        THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND (case_management_requested > 0 OR case_management_provided > 0)
            
            UNION ALL
            
            SELECT 'Benefits' as service_name,
                   COALESCE(SUM(benefits_requested), 0) as total_requested,
                   COALESCE(SUM(benefits_provided), 0) as total_provided,
                   CASE WHEN SUM(benefits_requested) > 0 
                        THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND (benefits_requested > 0 OR benefits_provided > 0)
            
            UNION ALL
            
            SELECT 'Employment' as service_name,
                   COALESCE(SUM(employment_requested), 0) as total_requested,
                   COALESCE(SUM(employment_provided), 0) as total_provided,
                   CASE WHEN SUM(employment_requested) > 0 
                        THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND (employment_requested > 0 OR employment_provided > 0)
            
            UNION ALL
            
            SELECT 'Legal' as service_name,
                   COALESCE(SUM(legal_requested), 0) as total_requested,
                   COALESCE(SUM(legal_provided), 0) as total_provided,
                   CASE WHEN SUM(legal_requested) > 0 
                        THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND (legal_requested > 0 OR legal_provided > 0)
            
            UNION ALL
            
            SELECT 'Transportation' as service_name,
                   COALESCE(SUM(transportation_requested), 0) as total_requested,
                   COALESCE(SUM(transportation_provided), 0) as total_provided,
                   CASE WHEN SUM(transportation_requested) > 0 
                        THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND (transportation_requested > 0 OR transportation_provided > 0)
            
            UNION ALL
            
            SELECT 'Mental Health' as service_name,
                   COALESCE(SUM(mental_health_requested), 0) as total_requested,
                   COALESCE(SUM(mental_health_provided), 0) as total_provided,
                   CASE WHEN SUM(mental_health_requested) > 0 
                        THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND (mental_health_requested > 0 OR mental_health_provided > 0)
            
            UNION ALL
            
            SELECT 'Education' as service_name,
                   COALESCE(SUM(education_requested), 0) as total_requested,
                   COALESCE(SUM(education_provided), 0) as total_provided,
                   CASE WHEN SUM(education_requested) > 0 
                        THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND (education_requested > 0 OR education_provided > 0)

            UNION ALL

            SELECT 'Occupational Therapy' as service_name,
                   COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                   COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                   CASE WHEN SUM(occupational_therapy_requested) > 0 
                        THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                        ELSE 0 END as completion_rate,
                   COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
            FROM contacts 
            WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
            AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
          `
        }
        break

      default:
        // Default to This Month
        serviceData = await sql`
          SELECT 'Food' as service_name,
                 COALESCE(SUM(food_requested), 0) as total_requested,
                 COALESCE(SUM(food_provided), 0) as total_provided,
                 CASE WHEN SUM(food_requested) > 0 
                      THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (food_requested > 0 OR food_provided > 0)
          
          UNION ALL
          
          SELECT 'Housing' as service_name,
                 COALESCE(SUM(housing_requested), 0) as total_requested,
                 COALESCE(SUM(housing_provided), 0) as total_provided,
                 CASE WHEN SUM(housing_requested) > 0 
                      THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (housing_requested > 0 OR housing_provided > 0)
          
          UNION ALL
          
          SELECT 'Healthcare' as service_name,
                 COALESCE(SUM(healthcare_requested), 0) as total_requested,
                 COALESCE(SUM(healthcare_provided), 0) as total_provided,
                 CASE WHEN SUM(healthcare_requested) > 0 
                      THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (healthcare_requested > 0 OR healthcare_provided > 0)
          
          UNION ALL
          
          SELECT 'Case Management' as service_name,
                 COALESCE(SUM(case_management_requested), 0) as total_requested,
                 COALESCE(SUM(case_management_provided), 0) as total_provided,
                 CASE WHEN SUM(case_management_requested) > 0 
                      THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (case_management_requested > 0 OR case_management_provided > 0)
          
          UNION ALL
          
          SELECT 'Benefits' as service_name,
                 COALESCE(SUM(benefits_requested), 0) as total_requested,
                 COALESCE(SUM(benefits_provided), 0) as total_provided,
                 CASE WHEN SUM(benefits_requested) > 0 
                      THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (benefits_requested > 0 OR benefits_provided > 0)
          
          UNION ALL
          
          SELECT 'Employment' as service_name,
                 COALESCE(SUM(employment_requested), 0) as total_requested,
                 COALESCE(SUM(employment_provided), 0) as total_provided,
                 CASE WHEN SUM(employment_requested) > 0 
                      THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (employment_requested > 0 OR employment_provided > 0)
          
          UNION ALL
          
          SELECT 'Legal' as service_name,
                 COALESCE(SUM(legal_requested), 0) as total_requested,
                 COALESCE(SUM(legal_provided), 0) as total_provided,
                 CASE WHEN SUM(legal_requested) > 0 
                      THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (legal_requested > 0 OR legal_provided > 0)
          
          UNION ALL
          
          SELECT 'Transportation' as service_name,
                 COALESCE(SUM(transportation_requested), 0) as total_requested,
                 COALESCE(SUM(transportation_provided), 0) as total_provided,
                 CASE WHEN SUM(transportation_requested) > 0 
                      THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (transportation_requested > 0 OR transportation_provided > 0)
          
          UNION ALL
          
          SELECT 'Mental Health' as service_name,
                 COALESCE(SUM(mental_health_requested), 0) as total_requested,
                 COALESCE(SUM(mental_health_provided), 0) as total_provided,
                 CASE WHEN SUM(mental_health_requested) > 0 
                      THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (mental_health_requested > 0 OR mental_health_provided > 0)
          
          UNION ALL
          
          SELECT 'Education' as service_name,
                 COALESCE(SUM(education_requested), 0) as total_requested,
                 COALESCE(SUM(education_provided), 0) as total_provided,
                 CASE WHEN SUM(education_requested) > 0 
                      THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (education_requested > 0 OR education_provided > 0)

          UNION ALL

          SELECT 'Occupational Therapy' as service_name,
                 COALESCE(SUM(occupational_therapy_requested), 0) as total_requested,
                 COALESCE(SUM(occupational_therapy_provided), 0) as total_provided,
                 CASE WHEN SUM(occupational_therapy_requested) > 0 
                      THEN ROUND((SUM(occupational_therapy_provided)::decimal / SUM(occupational_therapy_requested) * 100), 1)
                      ELSE 0 END as completion_rate,
                 COALESCE(SUM(occupational_therapy_requested) - SUM(occupational_therapy_provided), 0) as service_gap
          FROM contacts 
          WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)
          AND (occupational_therapy_requested > 0 OR occupational_therapy_provided > 0)
        `
        break
    }

    // Get trends based on the selected period
    let trendData = []
    let trendInterval = "month"
    let trendLimit = 6

    // Determine trend granularity based on period
    if (period === "Today" || period === "Yesterday") {
      trendInterval = "hour"
      trendLimit = 24
    } else if (period === "This Week" || period === "Last Week") {
      trendInterval = "day"
      trendLimit = 7
    } else if (period === "Last 3 Months") {
      trendInterval = "month"
      trendLimit = 3
    } else {
      trendInterval = "month"
      trendLimit = 6
    }

    if (trendInterval === "hour") {
      trendData = await sql`
        SELECT 
          EXTRACT(HOUR FROM contact_date) as period_label,
          DATE_TRUNC('hour', contact_date) as period_date,
          SUM(
            food_requested + housing_requested + healthcare_requested + 
            case_management_requested + benefits_requested + employment_requested + 
            legal_requested + transportation_requested + mental_health_requested + 
            education_requested + occupational_therapy_requested
          ) as total_requested,
          SUM(
            food_provided + housing_provided + healthcare_provided + 
            case_management_provided + benefits_provided + employment_provided + 
            legal_provided + transportation_provided + mental_health_provided + 
            education_provided + occupational_therapy_provided
          ) as total_provided
        FROM contacts 
        WHERE ${
          period === "Today"
            ? sql`DATE(contact_date) = CURRENT_DATE`
            : sql`DATE(contact_date) = CURRENT_DATE - INTERVAL '1 day'`
        }
        GROUP BY DATE_TRUNC('hour', contact_date), EXTRACT(HOUR FROM contact_date)
        ORDER BY period_date ASC
        LIMIT ${trendLimit}
      `
    } else if (trendInterval === "day") {
      trendData = await sql`
        SELECT 
          TO_CHAR(DATE_TRUNC('day', contact_date), 'Dy') as period_label,
          DATE_TRUNC('day', contact_date) as period_date,
          SUM(
            food_requested + housing_requested + healthcare_requested + 
            case_management_requested + benefits_requested + employment_requested + 
            legal_requested + transportation_requested + mental_health_requested + 
            education_requested + occupational_therapy_requested
          ) as total_requested,
          SUM(
            food_provided + housing_provided + healthcare_provided + 
            case_management_provided + benefits_provided + employment_provided + 
            legal_provided + transportation_provided + mental_health_provided + 
            education_provided + occupational_therapy_provided
          ) as total_provided
        FROM contacts 
        WHERE ${
          period === "This Week"
            ? sql`DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE)`
            : sql`DATE_TRUNC('week', contact_date) = DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')`
        }
        GROUP BY DATE_TRUNC('day', contact_date)
        ORDER BY period_date ASC
        LIMIT ${trendLimit}
      `
    } else {
      // Monthly trends (existing logic)
      const monthsBack = period === "Last 3 Months" ? 3 : 6
      trendData = await sql`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', contact_date), 'Mon') as period_label,
          DATE_TRUNC('month', contact_date) as period_date,
          SUM(
            food_requested + housing_requested + healthcare_requested + 
            case_management_requested + benefits_requested + employment_requested + 
            legal_requested + transportation_requested + mental_health_requested + 
            education_requested + occupational_therapy_requested
          ) as total_requested,
          SUM(
            food_provided + housing_provided + healthcare_provided + 
            case_management_provided + benefits_provided + employment_provided + 
            legal_provided + transportation_provided + mental_health_provided + 
            education_provided + occupational_therapy_provided
          ) as total_provided
        FROM contacts 
        WHERE contact_date >= CURRENT_DATE - INTERVAL '${monthsBack} months'
        AND contact_date <= CURRENT_DATE
        GROUP BY DATE_TRUNC('month', contact_date)
        ORDER BY period_date DESC
        LIMIT ${trendLimit}
      `
    }

    // Calculate completion rates for trend data
    const trendsWithRates = trendData.reverse().map((row) => ({
      month: row.period_label || row.month,
      requested: Number(row.total_requested) || 0,
      provided: Number(row.total_provided) || 0,
      completionRate:
        row.total_requested > 0 ? Math.round((Number(row.total_provided) / Number(row.total_requested)) * 100) : 0,
    }))

    // Format service data
    const formattedServiceData = serviceData
      .filter((row) => Number(row.total_requested) > 0 || Number(row.total_provided) > 0)
      .map((row) => ({
        name: row.service_name,
        requested: Number(row.total_requested) || 0,
        provided: Number(row.total_provided) || 0,
        gap: Number(row.service_gap) || 0,
        completionRate: Number(row.completion_rate) || 0,
        impact: Number(row.completion_rate) >= 80 ? "high" : Number(row.completion_rate) >= 60 ? "medium" : "low",
      }))
      .sort((a, b) => b.requested - a.requested) // Sort by demand

    return NextResponse.json({
      services: formattedServiceData,
      trends: trendsWithRates,
      period: period,
      summary: {
        totalRequested: formattedServiceData.reduce((sum, s) => sum + s.requested, 0),
        totalProvided: formattedServiceData.reduce((sum, s) => sum + s.provided, 0),
        totalGap: formattedServiceData.reduce((sum, s) => sum + s.gap, 0),
        overallCompletionRate:
          formattedServiceData.length > 0
            ? Math.round(
                formattedServiceData.reduce((sum, s) => sum + (s.requested > 0 ? s.completionRate : 0), 0) /
                  formattedServiceData.filter((s) => s.requested > 0).length,
              )
            : 0,
      },
    })
  } catch (error) {
    console.error("Failed to fetch services impact data:", error)
    return NextResponse.json({ error: "Failed to fetch services impact data" }, { status: 500 })
  }
}
