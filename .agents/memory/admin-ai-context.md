---
name: Admin AI shared context pattern
description: How the admin AI assistant gets access to live portfolio data (visitors, messages, projects, timeline) without function-calling
---

Instead of giving the AI tool/function-calling access to admin API routes, a single server-side context-builder function queries the DB directly (page views, messages, projects, timeline, profile) and formats it into a text block. That text block is injected into the system prompt for both the interactive chat endpoint and the dashboard-summary endpoint.

**Why:** Simpler and more reliable than wiring up function-calling for a Gemini-backed assistant that just needs read access to a handful of tables; avoids extra round-trips and tool-call parsing failures. Keeps the admin AI's "knowledge" always in sync with the latest DB state on every request.

**How to apply:** When extending what the admin AI can talk about, add the new data to the shared context builder (and its prompt-text formatter) rather than creating a new function-calling tool. If the data volume grows large, consider summarizing/aggregating before injecting into the prompt to control token usage.
