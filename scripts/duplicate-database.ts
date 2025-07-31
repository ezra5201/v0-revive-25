import { neon } from "@neondatabase/serverless"

// Source database (current)
const sourceDb = neon(process.env.SOURCE_DATABASE_URL || "")

// Target database (new)
const targetDb = neon(process.env.TARGET_DATABASE_URL || "")

async function duplicateDatabase() {
  try {
    console.log("🚀 Starting database duplication...")

    // Create tables in target database
    await targetDb`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        contact_date DATE NOT NULL,
        days_ago INTEGER NOT NULL,
        provider_name VARCHAR(255) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        food_accessed BOOLEAN DEFAULT FALSE,
        services_requested TEXT,
        services_provided TEXT,
        comments TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await targetDb`
      CREATE TABLE IF NOT EXISTS providers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await targetDb`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await targetDb`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("✅ Tables created in target database")

    // Copy providers
    const providers = await sourceDb`SELECT * FROM providers`
    for (const provider of providers) {
      await targetDb`
        INSERT INTO providers (name, active, created_at)
        VALUES (${provider.name}, ${provider.active}, ${provider.created_at})
        ON CONFLICT (name) DO NOTHING
      `
    }
    console.log(`✅ Copied ${providers.length} providers`)

    // Copy clients
    const clients = await sourceDb`SELECT * FROM clients`
    for (const client of clients) {
      await targetDb`
        INSERT INTO clients (name, category, active, created_at, updated_at)
        VALUES (${client.name}, ${client.category}, ${client.active}, ${client.created_at}, ${client.updated_at})
        ON CONFLICT (name) DO NOTHING
      `
    }
    console.log(`✅ Copied ${clients.length} clients`)

    // Copy contacts
    const contacts = await sourceDb`SELECT * FROM contacts`
    for (const contact of contacts) {
      await targetDb`
        INSERT INTO contacts (
          contact_date, days_ago, provider_name, client_name, category,
          food_accessed, services_requested, services_provided, comments,
          created_at, updated_at
        )
        VALUES (
          ${contact.contact_date}, ${contact.days_ago}, ${contact.provider_name},
          ${contact.client_name}, ${contact.category}, ${contact.food_accessed},
          ${contact.services_requested}, ${contact.services_provided},
          ${contact.comments}, ${contact.created_at}, ${contact.updated_at}
        )
      `
    }
    console.log(`✅ Copied ${contacts.length} contacts`)

    // Copy alerts
    const alerts = await sourceDb`SELECT * FROM alerts`
    for (const alert of alerts) {
      await targetDb`
        INSERT INTO alerts (client_name, alert_type, message, is_read, created_at)
        VALUES (${alert.client_name}, ${alert.alert_type}, ${alert.message}, ${alert.is_read}, ${alert.created_at})
      `
    }
    console.log(`✅ Copied ${alerts.length} alerts`)

    console.log("🎉 Database duplication completed successfully!")
  } catch (error) {
    console.error("❌ Database duplication failed:", error)
    throw error
  }
}

// Run the duplication
duplicateDatabase()
  .then(() => {
    console.log("✅ Duplication process completed")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Duplication process failed:", error)
    process.exit(1)
  })
