import { Router } from "express";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

const router = Router();

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL ?? "";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "";

function buildAuthUrl() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

router.get("/google", (_req: Request, res: Response) => {
  if (!CLIENT_ID || !CALLBACK_URL) {
    res.status(500).send("Google OAuth not configured");
    return;
  }
  res.redirect(buildAuthUrl());
});

router.get("/google/callback", async (req: Request, res: Response) => {
  const code = String(req.query.code ?? "");
  if (!code) {
    res.status(400).send("Missing code");
    return;
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !CALLBACK_URL || !SESSION_SECRET) {
    res.status(500).send("Server OAuth configuration incomplete");
    return;
  }

  try {
    const params = new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: CALLBACK_URL,
      grant_type: "authorization_code",
    });

    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text();
      console.error("Token exchange error", body);
      res.status(500).send("Token exchange failed");
      return;
    }

    const tokenJson = await tokenRes.json();
    const idToken = String(tokenJson.id_token ?? "");

    if (!idToken) {
      res.status(500).send("No id_token returned");
      return;
    }

    // Parse payload without verifying here (we verify in adminAuth when needed), but use it to set session
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      res.status(500).send("Invalid id_token");
      return;
    }

    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : null;
    if (!email) {
      res.status(500).send("No email in id_token");
      return;
    }

    // create a short-lived session JWT
    const sessionToken = jwt.sign({ email }, SESSION_SECRET, { expiresIn: "1h" });

    // set cookie
    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    // redirect to admin
    res.redirect("/admin");
  } catch (err) {
    console.error("/auth/google/callback error", err);
    res.status(500).send("Authentication failed");
  }
});

export default router;
