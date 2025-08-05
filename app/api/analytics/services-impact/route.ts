// app/api/analytics/services-impact/route.ts
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") ?? "This Month"

    // Build WHERE clause based on period
    let whereClause = ""
    switch (period) {
      case "This Month":
        whereClause = "WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)"
        break
      case "Last Month":
        whereClause = "WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')"
        break
      case "This Year":
        whereClause = "WHERE EXTRACT(YEAR FROM contact_date) = EXTRACT(YEAR FROM CURRENT_DATE)"
        break
      default:
        whereClause = "WHERE DATE_TRUNC('month', contact_date) = DATE_TRUNC('month', CURRENT_DATE)"
    }

    // Build the complete SQL query as a string
    const serviceQuery = `
      SELECT 
        'Food' as service_name,
        COALESCE(SUM(food_requested), 0) as total_requested,
        COALESCE(SUM(food_provided), 0) as total_provided,
        CASE 
          WHEN SUM(food_requested) > 0 
          THEN ROUND((SUM(food_provided)::decimal / SUM(food_requested) * 100), 1)
          ELSE 0 
        END as completion_rate,
        COALESCE(SUM(food_requested) - SUM(food_provided), 0) as service_gap
      FROM contacts ${whereClause}
      AND (food_requested > 0 OR food_provided > 0)
      
      
      UNION ALL
      
      SELECT 
        'Housing' as service_name,
        COALESCE(SUM(housing_requested), 0) as total_requested,
        COALESCE(SUM(housing_provided), 0) as total_provided,
        CASE 
          WHEN SUM(housing_requested) > 0 
          THEN ROUND((SUM(housing_provided)::decimal / SUM(housing_requested) * 100), 1)
          ELSE 0 
        END as completion_rate,
        COALESCE(SUM(housing_requested) - SUM(housing_provided), 0) as service_gap
      FROM contacts ${whereClause}
      AND (housing_requested > 0 OR housing_provided > 0)
      
      UNION ALL
      
      SELECT 
        'Healthcare' as service_name,
        COALESCE(SUM(healthcare_requested), 0) as total_requested,
        COALESCE(SUM(healthcare_provided), 0) as total_provided,
        CASE 
          WHEN SUM(healthcare_requested) > 0 
          THEN ROUND((SUM(healthcare_provided)::decimal / SUM(healthcare_requested) * 100), 1)
          ELSE 0 
        END as completion_rate,
        COALESCE(SUM(healthcare_requested) - SUM(healthcare_provided), 0) as service_gap
      FROM contacts ${whereClause}
      AND (healthcare_requested > 0 OR healthcare_provided > 0)
      
      UNION ALL
      
      SELECT 
        'Case Management' as service_name,
        COALESCE(SUM(case_management_requested), 0) as total_requested,
        COALESCE(SUM(case_management_provided), 0) as total_provided,
        CASE 
          WHEN SUM(case_management_requested) > 0 
          THEN ROUND((SUM(case_management_provided)::decimal / SUM(case_management_requested) * 100), 1)
          ELSE 0 
        END as completion_rate,
        COALESCE(SUM(case_management_requested) - SUM(case_management_provided), 0) as service_gap
      FROM contacts ${whereClause}
      AND (case_management_requested > 0 OR case_management_provided > 0)
      
      UNION ALL
      
      SELECT 
        'Benefits' as service_name,
        COALESCE(SUM(benefits_requested), 0) as total_requested,
        COALESCE(SUM(benefits_provided), 0) as total_provided,
        CASE 
          WHEN SUM(benefits_requested) > 0 
          THEN ROUND((SUM(benefits_provided)::decimal / SUM(benefits_requested) * 100), 1)
          ELSE 0 
        END as completion_rate,
        COALESCE(SUM(benefits_requested) - SUM(benefits_provided), 0) as service_gap
      FROM contacts ${whereClause}
      AND (benefits_requested > 0 OR benefits_provided > 0)
      
      UNION ALL
      
      SELECT 
        'Employment' as service_name,
        COALESCE(SUM(employment_requested), 0) as total_requested,
        COALESCE(SUM(employment_provided), 0) as total_provided,
        CASE 
          WHEN SUM(employment_requested) > 0 
          THEN ROUND((SUM(employment_provided)::decimal / SUM(employment_requested) * 100), 1)
          ELSE 0 
        END as completion_rate,
        COALESCE(SUM(employment_requested) - SUM(employment_provided), 0) as service_gap
      FROM contacts ${whereClause}
      AND (employment_requested > 0 OR employment_provided > 0)
      
      UNION ALL
      
      SELECT 
        'Legal' as service_name,
        COALESCE(SUM(legal_requested), 0) as total_requested,
        COALESCE(SUM(legal_provided), 0) as total_provided,
        CASE 
          WHEN SUM(legal_requested) > 0 
          THEN ROUND((SUM(legal_provided)::decimal / SUM(legal_requested) * 100), 1)
          ELSE 0 
        END as completion_rate,
        COALESCE(SUM(legal_requested) - SUM(legal_provided), 0) as service_gap
      FROM contacts ${whereClause}
      AND (legal_requested > 0 OR legal_provided > 0)
      
      UNION ALL
      
      SELECT 
        'Transportation' as service_name,
        COALESCE(SUM(transportation_requested), 0) as total_requested,
        COALESCE(SUM(transportation_provided), 0) as total_provided,
        CASE 
          WHEN SUM(transportation_requested) > 0 
          THEN ROUND((SUM(transportation_provided)::decimal / SUM(transportation_requested) * 100), 1)
          ELSE 0 
        END as completion_rate,
        COALESCE(SUM(transportation_requested) - SUM(transportation_provided), 0) as service_gap
      FROM contacts ${whereClause}
      AND (transportation_requested > 0 OR transportation_provided > 0)
      
      UNION ALL
      
      SELECT 
        'Mental Health' as service_name,
        COALESCE(SUM(mental_health_requested), 0) as total_requested,
        COALESCE(SUM(mental_health_provided), 0) as total_provided,
        CASE 
          WHEN SUM(mental_health_requested) > 0 
          THEN ROUND((SUM(mental_health_provided)::decimal / SUM(mental_health_requested) * 100), 1)
          ELSE 0 
        END as completion_rate,
        COALESCE(SUM(mental_health_requested) - SUM(mental_health_provided), 0) as service_gap
      FROM contacts ${whereClause}
      AND (mental_health_requested > 0 OR mental_health_provided > 0)
      
      UNION ALL
      
      SELECT 
        'Education' as service_name,
        COALESCE(SUM(education_requested), 0) as total_requested,
        COALESCE(SUM(education_provided), 0) as total_provided,
        CASE 
          WHEN SUM(education_requested) > 0 
          THEN ROUND((SUM(education_provided)::decimal / SUM(education_requested) * 100), 1)
          ELSE 0 
        END as completion_rate,
        COALESCE(SUM(education_requested) - SUM(education_provided), 0) as service_gap
      FROM contacts ${whereClause}
      AND (education_requested > 0 OR education_provided > 0)
    `

    // Execute the service data query
    const serviceData = await sql(serviceQuery)

    // Get monthly trends for the past 6 months
    const trendQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', contact_date), 'Mon') as month,
        DATE_TRUNC('month', contact_date) as month_date,
        SUM(
          food_requested + housing_requested + healthcare_requested + 
          case_management_requested + benefits_requested + employment_requested + 
          legal_requested + transportation_requested + mental_health_requested + 
          education_requested
        ) as total_requested,
        SUM(
          food_provided + housing_provided + healthcare_provided + 
          case_management_provided + benefits_provided + employment_provided + 
          legal_provided + transportation_provided + mental_health_provided + 
          education_provided
        ) as total_provided
      FROM contacts 
      WHERE contact_date >= CURRENT_DATE - INTERVAL '6 months'
      AND contact_date <= CURRENT_DATE
      GROUP BY DATE_TRUNC('month', contact_date)
      ORDER BY month_date DESC
      LIMIT 6
    `

    const trendData = await sql(trendQuery)

    // Calculate completion rates for trend data
    const trendsWithRates = trendData.reverse().map(row => ({
      month: row.month,
      requested: Number(row.total_requested) || 0,
      provided: Number(row.total_provided) || 0,
      completionRate: row.total_requested > 0 
        ? Math.round((Number(row.total_provided) / Number(row.total_requested)) * 100)
        : 0
    }))

    // Format service data
    const formattedServiceData = serviceData
      .filter(row => Number(row.total_requested) > 0 || Number(row.total_provided) > 0)
      .map(row => ({
        name: row.service_name,
        requested: Number(row.total_requested) || 0,
        provided: Number(row.total_provided) || 0,
        gap: Number(row.service_gap) || 0,
        completionRate: Number(row.completion_rate) || 0,
        impact: Number(row.completion_rate) >= 80 ? 'high' : 
                Number(row.completion_rate) >= 60 ? 'medium' : 'low'
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
        overallCompletionRate: formattedServiceData.length > 0 
          ? Math.round(
              formattedServiceData.reduce((sum, s) => sum + (s.requested > 0 ? s.completionRate : 0), 0) / 
              formattedServiceData.filter(s => s.requested > 0).length
            )
          : 0
      }
    })

  } catch (error) {
    console.error("Failed to fetch services impact data:", error)
    return NextResponse.json(
      { error: "Failed to fetch services impact data" }, 
      { status: 500 }
    )
  }
}
