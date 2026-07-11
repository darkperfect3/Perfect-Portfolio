---
name: Multi-provider AI relay fallback
description: Pattern used when OpenRouter/managed AI integration isn't available and user supplies raw provider API keys
---

When a user wants AI features but declines the OpenRouter/managed integration path (e.g. won't upgrade account), and instead supplies raw API keys for multiple providers (Mistral, Qwen, DeepSeek, etc.), build a small dedicated workspace lib (e.g. `@workspace/integrations-ai-relay`) that tries each provider's OpenAI-compatible chat-completions endpoint in priority order via raw `fetch`, with a per-provider timeout, and only throws if all providers fail.

**Why:** Keeps provider-specific fetch/auth logic out of route handlers and gives natural resilience (one provider being down/rate-limited doesn't take down AI features).

**How to apply:** Reuse this pattern whenever a user provides several raw LLM API keys instead of a single managed integration and wants automatic failover.
