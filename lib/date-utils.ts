// Dynamic date utilities for the ReVive application
// The application operates in Chicago timezone (America/Chicago)

/**
 * Get the current date in Chicago timezone
 */
export function getChicagoToday(): Date {
  // Get current date in Chicago timezone
  const now = new Date()
  const chicagoTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }))
  chicagoTime.setHours(0, 0, 0, 0)
  return chicagoTime
}

/**
 * Get the current date and time in Chicago timezone
 */
export function getChicagoNow(): Date {
  // Get current date and time in Chicago timezone
  const now = new Date()
  return new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }))
}

/**
 * Format a date for display in the application
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })
}

/**
 * Calculate days ago from Chicago today
 */
export function calculateDaysAgo(contactDate: Date | string): number {
  const today = getChicagoToday()
  const contact = typeof contactDate === "string" ? new Date(contactDate) : contactDate
  contact.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - contact.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays) // Never negative
}

/**
 * Get today's date as a string in YYYY-MM-DD format
 */
export function getTodayString(): string {
  const today = getChicagoToday()
  return today.toISOString().split("T")[0]
}

/**
 * Check if a date is today in Chicago time
 */
export function isToday(date: Date | string): boolean {
  const todayString = getTodayString()
  const dateString = typeof date === "string" ? date : date.toISOString().split("T")[0]
  return dateString === todayString
}

/**
 * Get the maximum allowed date (today in Chicago)
 */
export function getMaxAllowedDate(): string {
  return getTodayString()
}

/**
 * Get a formatted string for today's date for display
 */
export function getTodayFormatted(): string {
  return formatDate(getChicagoToday())
}
