// Minimal file to satisfy the project's TypeScript config (used for typecheck)
export function _scriptsHealthCheck(): string {
  return "ok";
}

// Keep a tiny side-effect to make the file observable during manual runs
if (typeof process !== "undefined" && process.env.NODE_ENV !== "test") {
  // eslint-disable-next-line no-console
  console.log("scripts: index.ts loaded");
}
