import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, profileTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    let profiles = await db.select().from(profileTable).limit(1);
    if (profiles.length === 0) {
      const inserted = await db.insert(profileTable).values({
        name: "Your Name",
        title: "Full Stack Developer",
        bio: "Passionate developer building great products.",
        skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
      }).returning();
      profiles = inserted;
    }
    res.json(profiles[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const profiles = await db.select().from(profileTable).limit(1);
    if (profiles.length === 0) {
      const inserted = await db.insert(profileTable).values({
        ...body,
        updatedAt: new Date(),
      }).returning();
      res.json(inserted[0]);
      return;
    }
    const updated = await db
      .update(profileTable)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(profileTable.id, profiles[0].id))
      .returning();
    res.json(updated[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
