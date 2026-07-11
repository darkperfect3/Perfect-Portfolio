import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, projectsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

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

router.get("/featured", async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.featured, true))
      .orderBy(projectsTable.order);
    res.json(projects);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    let query = db.select().from(projectsTable).$dynamic();
    const conditions = [];
    if (req.query.featured === "true") {
      conditions.push(eq(projectsTable.featured, true));
    }
    if (req.query.category) {
      conditions.push(eq(projectsTable.category, req.query.category as string));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    const projects = await query.orderBy(projectsTable.order);
    res.json(projects);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const inserted = await db.insert(projectsTable).values(req.body).returning();
    res.status(201).json(inserted[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    const projects = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
    if (!projects[0]) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(projects[0]);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    const updated = await db.update(projectsTable).set(req.body).where(eq(projectsTable.id, id)).returning();
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

router.delete("/:id", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
