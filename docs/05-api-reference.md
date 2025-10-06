# API Reference

## Overview

ReVive IMPACT provides a RESTful API for managing contacts, clients, check-ins, goals, and outreach programs.

## Base URL

\`\`\`
Production: https://your-app.run.app
Development: http://localhost:3000
\`\`\`

## Authentication

Currently, the API does not require authentication. Future versions may implement:
- JWT tokens
- API keys
- OAuth 2.0

## Common Response Formats

### Success Response

\`\`\`json
{
  "success": true,
  "data": { ... }
}
\`\`\`

### Error Response

\`\`\`json
{
  "error": "Error message",
  "details": "Additional error details"
}
\`\`\`

## Contacts API

### GET /api/contacts

Fetch contacts with optional filtering.

**Query Parameters:**
- `tab` (string): Filter by tab - "today", "all", "cm", "ot"
- `category` (string): Filter by category
- `provider` (string): Filter by provider name
- `location` (string): Filter by location
- `search` (string): Search by client name

**Response:**
\`\`\`json
{
  "contacts": [
    {
      "id": 1,
      "client_name": "John Doe",
      "provider_name": "Jane Smith",
      "contact_date": "2025-01-15",
      "category": "CM",
      "location": "Main Office",
      "services": ["Housing", "Food"],
      "notes": "Client doing well"
    }
  ]
}
\`\`\`

### POST /api/contacts

Create a new contact record.

**Request Body:**
\`\`\`json
{
  "client_name": "John Doe",
  "provider_name": "Jane Smith",
  "contact_date": "2025-01-15",
  "category": "CM",
  "location": "Main Office",
  "services": ["Housing", "Food"],
  "notes": "Initial contact"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "contact": { ... }
}
\`\`\`

## Clients API

### GET /api/clients/:name

Fetch client details by name.

**Response:**
\`\`\`json
{
  "id": 1,
  "name": "John Doe",
  "dob": "1990-01-15",
  "gender": "Male",
  "phone": "555-0123",
  "email": "john@example.com",
  "address": "123 Main St",
  "status": "Active",
  "intake_date": "2024-01-01"
}
\`\`\`

## Check-ins API

### GET /api/checkins/by-client/:clientName

Fetch all check-ins for a specific client.

**Response:**
\`\`\`json
{
  "checkins": [
    {
      "id": 1,
      "client_name": "John Doe",
      "provider_name": "Jane Smith",
      "checkin_date": "2025-01-15",
      "services": ["Housing", "Food"],
      "notes": "Progress update"
    }
  ]
}
\`\`\`

### POST /api/checkins

Create a new check-in record.

**Request Body:**
\`\`\`json
{
  "client_name": "John Doe",
  "provider_name": "Jane Smith",
  "checkin_date": "2025-01-15",
  "services": ["Housing", "Food"],
  "notes": "Weekly check-in"
}
\`\`\`

## Goals API

### GET /api/goals/by-client/:clientName

Fetch all goals for a specific client.

**Response:**
\`\`\`json
{
  "goals": [
    {
      "id": 1,
      "client_name": "John Doe",
      "goal_text": "Secure stable housing",
      "target_date": "2025-06-01",
      "status": "In Progress",
      "progress_updates": [
        {
          "date": "2025-01-15",
          "note": "Applied for housing assistance"
        }
      ]
    }
  ]
}
\`\`\`

### POST /api/goals

Create a new goal.

**Request Body:**
\`\`\`json
{
  "client_name": "John Doe",
  "goal_text": "Secure stable housing",
  "target_date": "2025-06-01"
}
\`\`\`

### POST /api/goals/:goalId/progress

Add progress update to a goal.

**Request Body:**
\`\`\`json
{
  "note": "Client viewed apartment today",
  "date": "2025-01-15"
}
\`\`\`

## Analytics API

### GET /api/analytics/overview

Get overview statistics.

**Response:**
\`\`\`json
{
  "totalClients": 150,
  "activeClients": 120,
  "totalContacts": 1250,
  "contactsThisMonth": 85,
  "totalProviders": 7
}
\`\`\`

### GET /api/analytics/services/trends

Get service delivery trends.

**Query Parameters:**
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)

**Response:**
\`\`\`json
{
  "trends": [
    {
      "date": "2025-01-15",
      "Housing": 12,
      "Food": 18,
      "Transportation": 8
    }
  ]
}
\`\`\`

## Outreach API

### GET /api/outreach/clients

Fetch outreach clients.

**Response:**
\`\`\`json
{
  "clients": [
    {
      "id": 1,
      "name": "Jane Doe",
      "location": "Downtown",
      "last_contact": "2025-01-15",
      "services_received": ["Food", "Hygiene"]
    }
  ]
}
\`\`\`

### GET /api/outreach/locations

Fetch outreach locations.

**Response:**
\`\`\`json
{
  "locations": [
    {
      "id": 1,
      "name": "Downtown Park",
      "address": "123 Park Ave",
      "latitude": 41.8781,
      "longitude": -87.6298,
      "active": true
    }
  ]
}
\`\`\`

### GET /api/outreach/runs

Fetch outreach runs.

**Response:**
\`\`\`json
{
  "runs": [
    {
      "id": 1,
      "date": "2025-01-15",
      "staff": ["John Smith", "Jane Doe"],
      "locations": ["Downtown Park", "Main Street"],
      "clients_served": 25,
      "services_provided": {
        "Food": 25,
        "Hygiene": 18,
        "Clothing": 12
      }
    }
  ]
}
\`\`\`

## Filters API

### GET /api/filters

Get available filter options.

**Response:**
\`\`\`json
{
  "categories": ["CM", "OT", "CES", "Outreach"],
  "providers": ["Jane Smith", "John Doe"],
  "locations": ["Main Office", "Downtown", "Satellite Office"]
}
\`\`\`

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting. Future versions may implement:
- 100 requests per minute per IP
- 1000 requests per hour per API key
