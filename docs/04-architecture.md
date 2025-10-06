# Architecture Overview

## System Architecture

ReVive IMPACT is built as a modern full-stack web application using Next.js 14 with the App Router architecture.

## High-Level Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Components (Client & Server Components)         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  App Router      │  │  API Routes      │                │
│  │  (Pages)         │  │  (/api/*)        │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Server Actions & Route Handlers                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Neon PostgreSQL                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables: clients, contacts, providers, ot_*, etc.   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Directory Structure

\`\`\`
revive-impact/
├── app/                      # Next.js App Router
│   ├── api/                  # API route handlers
│   │   ├── contacts/         # Contact management
│   │   ├── clients/          # Client management
│   │   ├── checkins/         # Check-in records
│   │   ├── goals/            # Goal tracking
│   │   ├── outreach/         # Outreach program
│   │   └── analytics/        # Analytics endpoints
│   ├── contact-log/          # Contact log page
│   ├── dashboard/            # Dashboard page
│   ├── reports/              # Reports page
│   ├── outreach/             # Outreach page
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── header.tsx            # Global header
│   ├── contact-table.tsx     # Contact table
│   ├── client-drawer.tsx     # Client details drawer
│   └── ...                   # Other components
├── hooks/                    # Custom React hooks
│   ├── use-contacts.ts       # Contact data fetching
│   ├── use-database.ts       # Database utilities
│   └── ...                   # Other hooks
├── lib/                      # Utility libraries
│   ├── db.ts                 # Database connection
│   ├── utils.ts              # Helper functions
│   └── date-utils.ts         # Date utilities
├── scripts/                  # Database scripts
│   ├── 00-complete-database-schema.sql
│   └── ...                   # Migration scripts
├── docs/                     # Documentation
└── public/                   # Static assets
\`\`\`

## Key Components

### 1. App Router (app/)

Next.js 14 App Router with:
- **Server Components** by default (better performance)
- **Client Components** for interactivity (`"use client"`)
- **Route Handlers** for API endpoints
- **Layouts** for shared UI structure

### 2. API Routes (app/api/)

RESTful API endpoints organized by resource:

**Contacts API** (`/api/contacts`)
- GET: Fetch contacts with filtering
- POST: Create new contact
- PUT: Update contact
- DELETE: Delete contact

**Clients API** (`/api/clients`)
- GET: Fetch client list
- GET /:name: Fetch client details
- POST: Create new client

**Check-ins API** (`/api/checkins`, `/api/ot-checkins`)
- Manage service delivery records
- Track occupational therapy sessions

**Goals API** (`/api/goals`, `/api/ot-goals`)
- Create and track client goals
- Record progress updates

**Analytics API** (`/api/analytics`)
- Overview statistics
- Service trends
- Client growth metrics

### 3. Components (components/)

**UI Components** (`components/ui/`)
- shadcn/ui component library
- Accessible, customizable components
- Tailwind CSS styling

**Feature Components**
- `header.tsx`: Global navigation
- `contact-table.tsx`: Main contact list
- `client-drawer.tsx`: Client details panel
- `action-bar.tsx`: Filtering and actions
- `services-panel.tsx`: Service selection

### 4. Hooks (hooks/)

Custom React hooks for data fetching and state management:

**use-contacts.ts**
- Fetches contact data with SWR
- Handles filtering and pagination
- Provides loading and error states

**use-database.ts**
- Database connection utilities
- Query helpers

**use-recently-viewed.ts**
- Tracks recently viewed clients
- Local storage persistence

### 5. Database Layer (lib/db.ts)

Database connection and query utilities:

\`\`\`typescript
import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)
\`\`\`

Uses Neon's serverless driver for:
- Connection pooling
- Automatic scaling
- Low latency queries

## Data Flow

### 1. Contact Log Page

\`\`\`
User visits /contact-log
    ↓
Server Component renders initial UI
    ↓
Client Component hydrates with interactivity
    ↓
useContacts hook fetches data from /api/contacts
    ↓
API route queries Neon database
    ↓
Data returned and cached with SWR
    ↓
ContactTable component renders data
\`\`\`

### 2. Creating a Contact

\`\`\`
User fills out Quick Check-in form
    ↓
Form submission triggers POST to /api/contacts
    ↓
API route validates data
    ↓
INSERT query to Neon database
    ↓
Success response returned
    ↓
SWR revalidates and updates UI
    ↓
Toast notification shown
\`\`\`

### 3. Client Details

\`\`\`
User clicks client name
    ↓
ClientDrawer opens
    ↓
Parallel API calls:
  - /api/clients/:name (basic info)
  - /api/checkins/by-client/:name (contact history)
  - /api/goals/by-client/:name (goals)
    ↓
Data rendered in tabs
    ↓
User can update services, add notes, etc.
\`\`\`

## State Management

### Server State (SWR)

Used for data fetching and caching:
- Automatic revalidation
- Optimistic updates
- Error retry logic
- Cache invalidation

### Client State (React useState)

Used for UI state:
- Form inputs
- Modal open/close
- Filter selections
- Tab navigation

### URL State (Next.js Router)

Used for shareable state:
- Current tab
- Filter parameters
- Search queries

## Authentication

Currently uses simple login page. Can be extended with:
- Stack Auth integration
- OAuth providers
- Role-based access control

## Performance Optimizations

1. **Server Components**: Reduce client-side JavaScript
2. **SWR Caching**: Minimize redundant API calls
3. **Database Indexes**: Fast query performance
4. **Connection Pooling**: Efficient database connections
5. **Image Optimization**: Next.js automatic image optimization

## Security Considerations

1. **SQL Injection Prevention**: Parameterized queries
2. **CORS**: Configured for same-origin
3. **Environment Variables**: Secrets not in code
4. **HIPAA Compliance**: Neon HIPAA-compliant database
5. **Input Validation**: Server-side validation

## Scalability

**Horizontal Scaling**
- Cloud Run auto-scales based on traffic
- Stateless application design
- Database connection pooling

**Vertical Scaling**
- Increase Cloud Run memory/CPU
- Neon auto-scales compute

**Caching Strategy**
- SWR client-side caching
- Database query result caching
- Static asset CDN (Vercel/Cloud CDN)
