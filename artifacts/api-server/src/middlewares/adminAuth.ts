import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

const DEFAULT_ADMIN_EMAIL = "officialperfectdev@gmail.com";

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

function collectClaimEmails(claims: unknown): string[] {
  if (!isRecord(claims)) return [];

  const emails: string[] = [];
  const addEmail = (value: unknown) => {
    if (typeof value === "string" && value.trim()) {
      emails.push(value.trim().toLowerCase());
    }
  };

  for (const key of ["email", "emailAddress", "email_address", "primaryEmailAddress", "primary_email_address"]) {
    addEmail(claims[key]);
  }

  for (const key of ["emailAddresses", "emails"]) {
    const value = claims[key];
    if (!Array.isArray(value)) continue;
    for (const item of value) {
      if (typeof item === "string") {
        addEmail(item);
      } else if (isRecord(item)) {
        addEmail(item.emailAddress ?? item.email_address ?? item.email);
      }
    }
  }

  return emails;
}

async function getPrimaryUserEmail(userId: string): Promise<string | null> {
  const user = await clerkClient.users.getUser(userId);
  const primaryEmail = user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  );
  return (primaryEmail ?? user.emailAddresses[0])?.emailAddress?.toLowerCase() ?? null;
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  const claims = auth.sessionClaims as unknown;
  const claimUserId = isRecord(claims) ? claims.userId ?? claims.sub : undefined;
  const userId = auth.userId ?? (typeof claimUserId === "string" ? claimUserId : null);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const allowedEmails = getAllowedAdminEmails();
  const claimEmails = collectClaimEmails(claims);
  if (claimEmails.some((email) => allowedEmails.has(email))) {
    next();
    return;
  }

  try {
    const primaryEmail = await getPrimaryUserEmail(userId);
    if (primaryEmail && allowedEmails.has(primaryEmail)) {
      next();
      return;
    }
  } catch {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.status(403).json({ error: "Forbidden" });
}