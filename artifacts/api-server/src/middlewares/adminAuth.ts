import { OAuth2Client } from "google-auth-library";
import type { NextFunction, Request, Response } from "express";

const DEFAULT_ADMIN_EMAIL = "officialperfectdev@gmail.com";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function getAllowedAdminEmails(): Set<string> {
  const configured = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
  return new Set(
    configured
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getEmailsFromPayload(payload: unknown): string[] {
  const emails: string[] = [];
  const addEmail = (value: unknown) => {
    if (typeof value === "string" && value.trim()) {
      emails.push(value.trim().toLowerCase());
    }
  };

  if (!isRecord(payload)) return emails;

  for (const key of ["email", "emailAddress", "email_address", "primaryEmailAddress", "primary_email_address"]) {
    addEmail(payload[key]);
  }

  if (Array.isArray(payload.emailAddresses)) {
    for (const item of payload.emailAddresses) {
      if (typeof item === "string") {
        addEmail(item);
      } else if (isRecord(item)) {
        addEmail(item.emailAddress ?? item.email_address ?? item.email);
      }
    }
  }

  if (Array.isArray(payload.emails)) {
    for (const item of payload.emails) {
      if (typeof item === "string") {
        addEmail(item);
      } else if (isRecord(item)) {
        addEmail(item.emailAddress ?? item.email_address ?? item.email);
      }
    }
  }

  return emails;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  // First, accept a server-side session cookie if present
  const sessionCookie = req.cookies?.session;
  const SESSION_SECRET = process.env.SESSION_SECRET ?? "";
  if (sessionCookie && SESSION_SECRET) {
    try {
      const jwt = await import("jsonwebtoken");
      const decoded = jwt.verify(sessionCookie, SESSION_SECRET) as { email?: string } | null;
      const email = decoded?.email?.toLowerCase();
      const allowedEmails = getAllowedAdminEmails();
      if (email && allowedEmails.has(email)) {
        next();
        return;
      }
    } catch (err) {
      // fall through to id token verification
      console.warn("Invalid session cookie", err);
    }
  }

  // Fallback: accept Bearer ID token
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!GOOGLE_CLIENT_ID) {
    res.status(500).json({ error: "Server configuration error" });
    return;
  }

  try {
    const ticket = await oauthClient.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    if (!payload) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const allowedEmails = getAllowedAdminEmails();
    const claimEmails = getEmailsFromPayload(payload);
    if (claimEmails.some((email) => allowedEmails.has(email))) {
      next();
      return;
    }

    res.status(403).json({ error: "Forbidden" });
  } catch (error) {
    console.error("requireAdmin error", error);
    res.status(401).json({ error: "Unauthorized" });
  }
}
