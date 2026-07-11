# Workspace

## Overview

Premium professional portfolio platform built on a pnpm workspace monorepo. Features a public-facing portfolio and a private admin dashboard with AI-powered features.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + TailwindCSS v4 (artifact: `artifacts/portfolio`, preview: `/`)
- **API framework**: Express 5 (artifact: `artifacts/api-server`, preview: `/api`)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Clerk (Replit-managed, proxy middleware in api-server)
- **AI**: Google Gemini via Replit AI Integration (`lib/integrations-gemini-ai`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- **Build**: esbuild (CJS bundle for api-server)

## Architecture

```
artifacts/
  api-server/       Express API, Clerk proxy middleware, Gemini AI routes
  portfolio/        React+Vite frontend (public + admin)
lib/
  db/               Drizzle schema + migrations
  api-spec/         OpenAPI spec + orval codegen config
  api-client/       Generated React Query hooks (from orval)
  api-zod/          Generated Zod schemas (from orval)
  integrations-gemini-ai/  Gemini AI integration helpers
```

## Public Pages

- `/` — Hero section with seeded profile data, featured projects, skills
- `/projects` — Project gallery with category filtering (Framer Motion)
- `/projects/:id` — Individual project detail page
- `/timeline` — Alternating vertical timeline (work + education history)
- `/contact` — Contact form → saves to `contact_messages` table
- `/sign-in` — Clerk sign-in (themed, dark mode)
- `/sign-up` — Clerk sign-up (themed, dark mode)

## Admin Dashboard (protected by Clerk auth)

- `/admin` — Overview dashboard with Recharts analytics
- `/admin/profile` — Edit profile (bio, title, skills, links)
- `/admin/projects` — Full CRUD for projects
- `/admin/timeline` — Full CRUD for timeline entries
- `/admin/messages` — Inbox with AI analysis per message (Gemini)
- `/admin/ai` — AI assistant chat (Gemini streaming)

## API Routes

- `GET/PUT /api/profile`
- `GET/POST/PUT/DELETE /api/projects` (+ `/api/projects/featured`)
- `GET/POST/PUT/DELETE /api/timeline`
- `GET/POST /api/messages` (+ `/api/messages/:id/read`, `/api/messages/:id/analyze`)
- `GET /api/analytics/dashboard`, `POST /api/analytics/track`
- `POST /api/ai/chat`, `POST /api/ai/analyze-message/:id`

## DB Tables

- `profile` — personal info, skills, links
- `projects` — portfolio projects
- `timeline_entries` — work/education history
- `contact_messages` — contact form submissions
- `page_views` — analytics tracking

## Seeded Data

- Profile: Alex Moreau, Senior Full Stack Developer, Paris France
- Projects: CloudSync Dashboard, FinTrack Pro, DeepSearch Engine
- Timeline: 5 entries (TechCorp Paris → senior dev → etc.)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Environment Variables

- `CLERK_PUBLISHABLE_KEY` — auto-set by Replit Clerk integration
- `CLERK_SECRET_KEY` — auto-set by Replit Clerk integration
- `CLERK_PROXY_URL` — auto-set in production by Replit
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — stored in Replit secrets
- `AI_INTEGRATIONS_GEMINI_BASE_URL` — Replit Gemini AI proxy
- `AI_INTEGRATIONS_GEMINI_API_KEY` — Replit Gemini AI key

## Design

- Dark mode by default (`class="dark"` on `<html>`)
- Primary accent: vivid cyan `hsl(190 90% 50%)`
- Fonts: Space Grotesk (headings) + Inter (body)
- Framer Motion page transitions and scroll-triggered animations
- Recharts for admin analytics dashboard
