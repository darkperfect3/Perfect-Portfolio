---
name: Express req.params typing gotcha
description: req.params values type as string | string[], causing drizzle eq() overload errors
---

Express's `ParamsDictionary` types each route param value as `string | string[]` (to account for repeated query-string-style params), not just `string`. Destructuring `const { id } = req.params` and passing it straight into a drizzle `eq(column, id)` call fails typecheck with a confusing "no overload matches" error that looks like a schema/column issue but isn't.

**Why:** Wasted a debug cycle blaming the drizzle schema/column definition and rebuilding lib declarations before realizing the actual value came from `req.params`.

**How to apply:** When passing a route param into a typed query builder (drizzle, zod, etc.), coerce explicitly: `const id = String(req.params.id);` instead of destructuring directly.
