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
- **Database**: MongoDB (native driver)
- **Auth**: Clerk
- **AI**: Relay AI using Mistral, Qwen and DeepSeek (`lib/integrations-ai-relay`)
- **Validation**: Zod (`zod/v4`)
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- **Build**: esbuild (ESM bundle output for api-server)

## Architecture

```
artifacts/
  api-server/       Express API, Clerk proxy middleware, object storage support
  portfolio/        React+Vite frontend (public + admin)
lib/
  db/               MongoDB connection + collection models
  api-spec/         OpenAPI spec + orval codegen config
  api-client-react/ Generated React Query hooks + API client utilities
  api-zod/          Generated Zod schemas and API types
  integrations-ai-relay/  LLM relay and image proxy helpers
  integrations-gemini-ai/ Gemini-compatible AI helper utilities
  object-storage-web/     Uppy-based browser upload components
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

Backend
- `CLERK_SECRET_KEY` — Clerk secret API key
- `MONGODB_URI` — MongoDB connection string
- `GOOGLE_APPLICATION_CREDENTIALS` — path to Google Cloud service account JSON (optional)
- `GOOGLE_CLOUD_PROJECT` / `GCLOUD_PROJECT` / `GOOGLE_PROJECT_ID` — Google project ID for cloud storage
- `GOOGLE_CLOUD_KEYFILE_JSON` — alternative JSON credentials payload
- `USE_LOCAL_OBJECT_STORAGE` — `true` or `false` (defaults to `false`)
- `LOG_LEVEL` — `info`, `debug`, etc.
- `PORT` — backend port (default: `3000`)

Frontend
- `VITE_CLERK_PUBLISHABLE_KEY` or `CLERK_PUBLISHABLE_KEY` — Clerk publishable key

## Deployment

### Frontend (Netlify)
- Build command: `pnpm --filter @workspace/portfolio run build`
- Publish directory: `artifacts/portfolio/dist/public`
- `netlify.toml` is included at repository root

### Backend (Render)
- `render.yaml` is included at repository root
- Build command: `pnpm --filter @workspace/api-server run build`
- Start command: `pnpm --filter @workspace/api-server run start`
- Required environment variables: `CLERK_SECRET_KEY`, `MONGODB_URI`, `LOG_LEVEL`, `USE_LOCAL_OBJECT_STORAGE`

## Design

- Dark mode by default (`class="dark"` on `<html>`)
- Primary accent: vivid cyan `hsl(190 90% 50%)`
- Fonts: Space Grotesk (headings) + Inter (body)
- Framer Motion page transitions and scroll-triggered animations
- Recharts for admin analytics dashboard

## Run

- `cd artifacts/api-server && pnpm dev` - Start Backend
- `cd artifacts/portfolio && pnpm dev` - Start Frontend
- `artifacts/portfolio/dist/public` production# Perfect-Portfolio
