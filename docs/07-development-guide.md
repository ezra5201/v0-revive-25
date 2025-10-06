# Development Guide

## Local Development Setup

### Prerequisites

- Node.js 18.x or higher
- pnpm package manager
- PostgreSQL database (Neon recommended)
- Git

### Initial Setup

1. **Clone repository**
   \`\`\`bash
   git clone <repository-url>
   cd revive-impact
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   pnpm install
   \`\`\`

3. **Configure environment variables**
   
   Create `.env.local`:
   \`\`\`env
   DATABASE_URL=postgresql://...
   DATABASE_URL_UNPOOLED=postgresql://...
   PGHOST=your-host.neon.tech
   PGUSER=your-username
   PGPASSWORD=your-password
   PGDATABASE=your-database
   \`\`\`

4. **Set up database**
   \`\`\`bash
   # Run schema creation
   # Execute scripts/00-complete-database-schema.sql in Neon dashboard
   
   # Or use psql
   psql $DATABASE_URL < scripts/00-complete-database-schema.sql
   \`\`\`

5. **Seed data**
   \`\`\`bash
   # Start dev server
   pnpm dev
   
   # Visit setup endpoint
   curl http://localhost:3000/api/setup
   \`\`\`

6. **Start development server**
   \`\`\`bash
   pnpm dev
   \`\`\`

   Application runs at http://localhost:3000

## Development Workflow

### Branch Strategy

\`\`\`
main (production)
  ├── dev (development)
  │   ├── feature/contact-log-improvements
  │   ├── feature/outreach-map
  │   └── bugfix/client-drawer-issue
\`\`\`

**Branch naming:**
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent production fixes
- `refactor/` - Code refactoring

### Making Changes

1. **Create feature branch**
   \`\`\`bash
   git checkout -b feature/my-feature
   \`\`\`

2. **Make changes**
   - Edit files
   - Test locally
   - Add console.log for debugging

3. **Test changes**
   \`\`\`bash
   # Run dev server
   pnpm dev
   
   # Test in browser
   # Check console for errors
   \`\`\`

4. **Commit changes**
   \`\`\`bash
   git add .
   git commit -m "feat: add new feature"
   \`\`\`

5. **Push to remote**
   \`\`\`bash
   git push origin feature/my-feature
   \`\`\`

6. **Create pull request**
   - Open PR on GitHub
   - Request review
   - Address feedback

### Code Style

**TypeScript**
- Use TypeScript for all new files
- Define interfaces for data structures
- Avoid `any` type

**React Components**
- Use functional components
- Use hooks for state management
- Server Components by default, Client Components when needed

**Naming Conventions**
- Components: PascalCase (`ClientDrawer.tsx`)
- Files: kebab-case (`contact-table.tsx`)
- Functions: camelCase (`fetchContacts()`)
- Constants: UPPER_SNAKE_CASE (`MAX_RESULTS`)

**File Organization**
\`\`\`typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types/Interfaces
interface Props {
  clientName: string
}

// 3. Component
export function MyComponent({ clientName }: Props) {
  // 4. Hooks
  const [isOpen, setIsOpen] = useState(false)
  
  // 5. Functions
  const handleClick = () => {
    setIsOpen(true)
  }
  
  // 6. Render
  return (
    <div>
      <Button onClick={handleClick}>Open</Button>
    </div>
  )
}
\`\`\`

## Testing

### Manual Testing

1. **Test all tabs**
   - Today's Check-ins
   - All Contacts
   - CM
   - OT

2. **Test filtering**
   - Category filter
   - Provider filter
   - Location filter
   - Search

3. **Test CRUD operations**
   - Create contact
   - Update services
   - Delete contact
   - View client details

4. **Test responsive design**
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

### Debugging

**Browser DevTools**
\`\`\`javascript
// Add debug logs
console.log('[v0] Client data:', clientData)
console.log('[v0] API response:', response)
\`\`\`

**Network Tab**
- Check API requests
- Verify response data
- Check for errors

**React DevTools**
- Inspect component props
- Check component state
- Profile performance

### Database Debugging

\`\`\`sql
-- Check table contents
SELECT * FROM contacts LIMIT 10;

-- Check for missing data
SELECT COUNT(*) FROM contacts WHERE client_name IS NULL;

-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM contacts WHERE contact_date = CURRENT_DATE;
\`\`\`

## Adding New Features

### Adding a New API Endpoint

1. **Create route file**
   \`\`\`typescript
   // app/api/my-endpoint/route.ts
   import { NextResponse } from 'next/server'
   import { sql } from '@/lib/db'
   
   export async function GET() {
     try {
       const result = await sql`SELECT * FROM my_table`
       return NextResponse.json({ data: result })
     } catch (error) {
       console.error('[v0] Error:', error)
       return NextResponse.json(
         { error: 'Failed to fetch data' },
         { status: 500 }
       )
     }
   }
   \`\`\`

2. **Test endpoint**
   \`\`\`bash
   curl http://localhost:3000/api/my-endpoint
   \`\`\`

3. **Create hook for data fetching**
   \`\`\`typescript
   // hooks/use-my-data.ts
   import useSWR from 'swr'
   
   export function useMyData() {
     const { data, error, mutate } = useSWR('/api/my-endpoint')
     
     return {
       data: data?.data || [],
       isLoading: !error && !data,
       isError: error,
       mutate
     }
   }
   \`\`\`

### Adding a New Page

1. **Create page file**
   \`\`\`typescript
   // app/my-page/page.tsx
   export default function MyPage() {
     return (
       <div>
         <h1>My Page</h1>
       </div>
     )
   }
   \`\`\`

2. **Add to navigation**
   \`\`\`typescript
   // components/header.tsx
   const navigationItems = [
     // ... existing items
     { name: "MY PAGE", path: "/my-page" },
   ]
   \`\`\`

### Adding a New Component

1. **Create component file**
   \`\`\`typescript
   // components/my-component.tsx
   'use client'
   
   interface MyComponentProps {
     title: string
   }
   
   export function MyComponent({ title }: MyComponentProps) {
     return <div>{title}</div>
   }
   \`\`\`

2. **Use in page**
   \`\`\`typescript
   import { MyComponent } from '@/components/my-component'
   
   export default function Page() {
     return <MyComponent title="Hello" />
   }
   \`\`\`

## Database Migrations

### Creating a Migration

1. **Create migration file**
   \`\`\`sql
   -- scripts/02-add-new-column.sql
   ALTER TABLE contacts
   ADD COLUMN new_field VARCHAR(255);
   \`\`\`

2. **Test locally**
   \`\`\`bash
   psql $DATABASE_URL < scripts/02-add-new-column.sql
   \`\`\`

3. **Document migration**
   - Add to migration log
   - Update schema documentation

4. **Apply to production**
   - Run during maintenance window
   - Verify with database stats

## Performance Optimization

### Database Queries

**Use indexes:**
\`\`\`sql
CREATE INDEX idx_contacts_date ON contacts(contact_date);
\`\`\`

**Limit results:**
\`\`\`sql
SELECT * FROM contacts LIMIT 100;
\`\`\`

**Use specific columns:**
\`\`\`sql
-- Instead of SELECT *
SELECT id, client_name, contact_date FROM contacts;
\`\`\`

### React Performance

**Memoization:**
\`\`\`typescript
import { useMemo } from 'react'

const filteredData = useMemo(() => {
  return data.filter(item => item.active)
}, [data])
\`\`\`

**Lazy loading:**
\`\`\`typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./heavy-component'))
\`\`\`

## Deployment

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Build succeeds locally

### Deploy to Cloud Run

\`\`\`bash
# Build and deploy
gcloud run deploy revive-impact \
  --source . \
  --region us-central1

# Verify deployment
curl https://revive-impact-xxx.run.app
\`\`\`

### Post-deployment

1. **Verify application**
   - Check all pages load
   - Test critical features
   - Monitor error logs

2. **Run migrations**
   \`\`\`bash
   # If needed
   psql $PRODUCTION_DATABASE_URL < scripts/02-migration.sql
   \`\`\`

3. **Monitor metrics**
   - Request count
   - Error rate
   - Latency

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
