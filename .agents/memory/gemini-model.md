---
name: Gemini model naming
description: Which Gemini model string to use with the Replit Gemini AI integration in this project
---

Use `gemini-2.5-flash` when calling `ai.models.generateContent` (via `@workspace/integrations-gemini-ai`).

**Why:** `gemini-2.0-flash` returned an `UNSUPPORTED_MODEL` error from the integration, which surfaced as a generic 500 on any route calling it (admin AI chat, message analysis, suggestion endpoints), with no obvious error message pointing to the model name.

**How to apply:** When adding new AI routes/features in this project, default to `gemini-2.5-flash` unless the user asks for a specific different model. If a route relying on Gemini starts 500ing, check the model string first.
