import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, contactMessagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

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

router.get("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    let query = db.select().from(contactMessagesTable).$dynamic();
    if (req.query.read === "true") {
      query = query.where(eq(contactMessagesTable.read, true));
    } else if (req.query.read === "false") {
      query = query.where(eq(contactMessagesTable.read, false));
    }
    const msgs = await query.orderBy(desc(contactMessagesTable.createdAt));
    res.json(msgs);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, content } = req.body;
    if (!name || !email || !content) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const inserted = await db.insert(contactMessagesTable).values({
      name,
      email,
      subject: subject || null,
      content,
    }).returning();
    res.status(201).json(inserted[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/read", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    const updated = await db
      .update(contactMessagesTable)
      .set({ read: true })
      .where(eq(contactMessagesTable.id, id))
      .returning();
    if (!updated[0]) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(updated[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
