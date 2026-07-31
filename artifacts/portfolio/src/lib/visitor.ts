const VISITOR_ID_KEY = "perfectdev_visitor_id";

function createVisitorId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getVisitorId(): string {
  const existing = localStorage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;

  const id = createVisitorId();
  localStorage.setItem(VISITOR_ID_KEY, id);
  return id;
}