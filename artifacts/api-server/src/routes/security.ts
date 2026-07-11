import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, securityAlertsTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const router = Router();

const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

router.post("/log-attempt", async (req: Request, res: Response): Promise<void> => {
  try {
    const { attemptedEmail, attemptedPassword } = req.body;
    if (!attemptedEmail || !attemptedPassword) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      null;
    const userAgent = (req.headers["user-agent"] as string) || null;

    const inserted = await db
      .insert(securityAlertsTable)
      .values({ attemptedEmail, attemptedPassword, ipAddress, userAgent })
      .returning();
    res.status(201).json(inserted[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/alerts", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await db
      .select()
      .from(securityAlertsTable)
      .orderBy(desc(securityAlertsTable.createdAt));
    res.json(alerts);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
