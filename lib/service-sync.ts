// Helper function to sync JSONB services to integer columns
export function syncServicesToIntegerColumns(servicesRequested: any[], servicesProvided: any[]) {
  const updates: Record<string, number> = {}

  // Service name mappings
  const serviceMap: Record<string, string> = {
    "Case Management": "case_management",
    Occupational: "occupational_therapy",
    Food: "food",
    Healthcare: "healthcare",
    Housing: "housing",
    Employment: "employment",
    Benefits: "benefits",
    Legal: "legal",
    Transportation: "transportation",
    Childcare: "childcare",
    "Mental Health": "mental_health",
    "Substance Abuse": "substance_abuse",
    Education: "education",
  }

  // Set all to 0 first
  Object.values(serviceMap).forEach((col) => {
    updates[`${col}_requested`] = 0
    updates[`${col}_provided`] = 0
  })

  // Set requested services to 1
  if (Array.isArray(servicesRequested)) {
    servicesRequested.forEach((service) => {
      const column = serviceMap[service]
      if (column) updates[`${column}_requested`] = 1
    })
  }

  // Set provided services to 1
  if (Array.isArray(servicesProvided)) {
    servicesProvided.forEach((serviceObj) => {
      const service = typeof serviceObj === "string" ? serviceObj : serviceObj?.service
      const column = serviceMap[service]
      if (column) updates[`${column}_provided`] = 1
    })
  }

  return updates
}

// Helper function to build SQL SET clause for integer columns
export function buildIntegerColumnsSql(updates: Record<string, number>): string {
  const setParts = Object.entries(updates).map(([column, value]) => `${column} = ${value}`)
  return setParts.join(", ")
}
