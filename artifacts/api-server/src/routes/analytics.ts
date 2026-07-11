import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, pageViewsTable, contactMessagesTable, projectsTable } from "@workspace/db";
import { eq, count, countDistinct, sql } from "drizzle-orm";

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

router.post("/track", async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, referrer } = req.body;
    if (!page) {
      res.status(400).json({ error: "page is required" });
      return;
    }
    const visitorId = req.headers["x-visitor-id"] as string | undefined;
    await db.insert(pageViewsTable).values({ page, referrer: referrer || null, visitorId: visitorId || null });
    res.json({ ok: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalViewsResult] = await db.select({ count: count() }).from(pageViewsTable);
    const [uniqueVisitorsResult] = await db.select({ count: countDistinct(pageViewsTable.visitorId) }).from(pageViewsTable);
    const [unreadMessagesResult] = await db.select({ count: count() }).from(contactMessagesTable).where(eq(contactMessagesTable.read, false));
    const [totalMessagesResult] = await db.select({ count: count() }).from(contactMessagesTable);
    const [totalProjectsResult] = await db.select({ count: count() }).from(projectsTable);

    const topPages = await db
      .select({ page: pageViewsTable.page, views: count(pageViewsTable.id) })
      .from(pageViewsTable)
      .groupBy(pageViewsTable.page)
      .orderBy(sql`count(${pageViewsTable.id}) desc`)
      .limit(5);

    const viewsByDay = await db
      .select({
        date: sql<string>`DATE(${pageViewsTable.createdAt})`,
        views: count(pageViewsTable.id),
      })
      .from(pageViewsTable)
      .groupBy(sql`DATE(${pageViewsTable.createdAt})`)
      .orderBy(sql`DATE(${pageViewsTable.createdAt}) asc`)
      .limit(30);

    res.json({
      totalViews: totalViewsResult.count,
      uniqueVisitors: uniqueVisitorsResult.count,
      unreadMessages: unreadMessagesResult.count,
      totalMessages: totalMessagesResult.count,
      totalProjects: totalProjectsResult.count,
      topPages,
      viewsByDay,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
