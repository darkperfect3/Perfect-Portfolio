---
name: api-server dev workflow is not a watcher
description: api-server's dev script runs a one-shot esbuild + start, so route/schema edits require a manual workflow restart
---

In this monorepo's `artifacts/api-server`, the `dev` script runs `pnpm run build && pnpm run start` once — it is not a file watcher. Editing route files, schema, or other server source will not take effect until the workflow is restarted, even though the portfolio (Vite) frontend hot-reloads automatically.

**Why:** Testing new API routes right after editing returned stale 404s that looked like a routing bug, when the real cause was the old build still running.

**How to apply:** After editing any `artifacts/api-server/src/**` file, restart the `artifacts/api-server: API Server` workflow before curl-testing or expecting the change to be live.
