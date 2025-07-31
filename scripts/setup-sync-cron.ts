import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

/**
 * Sets up automated monthly sync with cron job configuration
 */
function setupSyncCron(): void {
  console.log("🔧 Setting up automated monthly sync...")

  // Create logs directory if it doesn't exist
  const logsDir = join(process.cwd(), "logs")
  if (!existsSync(logsDir)) {
    mkdirSync(logsDir, { recursive: true })
    console.log("✓ Created logs directory")
  }

  // Generate shell script for sync API call
  const shellScript = `#!/bin/bash

# Monthly Service Summary Sync Script
# Generated on: ${new Date().toISOString()}

# Configuration
API_URL="http://localhost:3000/api/admin/sync-services"
ADMIN_KEY="${process.env.ADMIN_API_KEY || "your-admin-key-here"}"
LOG_FILE="$(dirname "$0")/logs/monthly-sync.log"
ERROR_LOG="$(dirname "$0")/logs/sync-errors.log"

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log with timestamp
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to log errors
log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$ERROR_LOG"
}

# Start sync process
log_message "Starting monthly service summary sync..."

# Make API call
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -H "x-admin-key: $ADMIN_KEY" \\
  -d '{}' \\
  "$API_URL")

# Extract HTTP status and body
HTTP_STATUS=$(echo "$RESPONSE" | tr -d '\\n' | sed -e 's/.*HTTPSTATUS://')
BODY=$(echo "$RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')

# Check response
if [ "$HTTP_STATUS" -eq 200 ]; then
    log_message "Sync completed successfully"
    log_message "Response: $BODY"
else
    log_error "Sync failed with HTTP status: $HTTP_STATUS"
    log_error "Response: $BODY"
fi

# Log rotation - keep last 12 months of logs
find "$(dirname "$LOG_FILE")" -name "monthly-sync.log.*" -mtime +365 -delete 2>/dev/null || true
find "$(dirname "$ERROR_LOG")" -name "sync-errors.log.*" -mtime +365 -delete 2>/dev/null || true

# Rotate current logs if they're too large (>10MB)
if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt 10485760 ]; then
    mv "$LOG_FILE" "$LOG_FILE.$(date +%Y%m%d)"
    log_message "Log file rotated"
fi

if [ -f "$ERROR_LOG" ] && [ $(stat -f%z "$ERROR_LOG" 2>/dev/null || stat -c%s "$ERROR_LOG" 2>/dev/null || echo 0) -gt 10485760 ]; then
    mv "$ERROR_LOG" "$ERROR_LOG.$(date +%Y%m%d)"
    log_error "Error log file rotated"
fi

log_message "Monthly sync process completed"
`

  // Write shell script
  const scriptPath = join(process.cwd(), "sync-monthly-data.sh")
  writeFileSync(scriptPath, shellScript, { mode: 0o755 })
  console.log("✓ Created sync-monthly-data.sh")

  // Generate cron job instructions
  const cronInstructions = `
# AUTOMATED MONTHLY SYNC SETUP INSTRUCTIONS
# ========================================

## 1. Make the script executable (if not already):
chmod +x sync-monthly-data.sh

## 2. Test the script manually:
./sync-monthly-data.sh

## 3. Add to crontab (runs 1st of each month at 2 AM):
# Edit crontab:
crontab -e

# Add this line:
0 2 1 * * /path/to/your/project/sync-monthly-data.sh

## 4. Verify cron job was added:
crontab -l

## 5. Monitor logs:
tail -f logs/monthly-sync.log
tail -f logs/sync-errors.log

## ENVIRONMENT VARIABLES REQUIRED:
# Make sure these are set in your environment:
# - ADMIN_API_KEY: ${process.env.ADMIN_API_KEY ? "✓ Set" : "✗ Not set"}
# - DATABASE_URL: ${process.env.DATABASE_URL ? "✓ Set" : "✗ Not set"}

## LOG ROTATION:
# - Logs are automatically rotated when they exceed 10MB
# - Old logs are kept for 12 months then automatically deleted
# - Manual cleanup: find logs/ -name "*.log.*" -mtime +30 -delete

## TROUBLESHOOTING:
# - Check logs/sync-errors.log for error details
# - Verify API endpoint is accessible: curl -I http://localhost:3000/api/admin/sync-services
# - Test authentication: curl -H "x-admin-key: YOUR_KEY" http://localhost:3000/api/admin/sync-services
# - Check cron service: sudo service cron status (Linux) or launchctl list | grep cron (macOS)

Generated on: ${new Date().toISOString()}
`

  // Write instructions
  const instructionsPath = join(process.cwd(), "CRON_SETUP_INSTRUCTIONS.md")
  writeFileSync(instructionsPath, cronInstructions)
  console.log("✓ Created CRON_SETUP_INSTRUCTIONS.md")

  // Create initial log files
  const initialLogContent = `[${new Date().toISOString()}] Monthly sync log initialized\n`
  writeFileSync(join(logsDir, "monthly-sync.log"), initialLogContent)
  writeFileSync(join(logsDir, "sync-errors.log"), initialLogContent)
  console.log("✓ Initialized log files")

  console.log("\n🎉 Setup complete!")
  console.log("\nNext steps:")
  console.log("1. Review CRON_SETUP_INSTRUCTIONS.md")
  console.log("2. Set ADMIN_API_KEY environment variable")
  console.log("3. Test: ./sync-monthly-data.sh")
  console.log("4. Add to crontab: 0 2 1 * * /path/to/sync-monthly-data.sh")
  console.log("\nMonitor logs at:")
  console.log("- logs/monthly-sync.log")
  console.log("- logs/sync-errors.log")
}

// Run setup if called directly
if (require.main === module) {
  setupSyncCron()
}

export { setupSyncCron }
