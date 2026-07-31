import { Router, Request, Response } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import { getNextSequence, pageViewsCollection, contactMessagesCollection, projectsCollection } from "@workspace/db";

const router = Router();


router.post("/track", async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, referrer } = req.body;
    if (!page) {
      res.status(400).json({ error: "page is required" });
      return;
    }

    const visitorId = req.headers["x-visitor-id"] as string | undefined;
    const id = await getNextSequence("page_views");

    await pageViewsCollection.insertOne({
      id,
      _id: id,
      page,
      referrer: referrer || null,
      visitorId: visitorId || null,
      createdAt: new Date(),
    });

    res.json({ ok: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const totalViews = await pageViewsCollection.countDocuments();
    const uniqueVisitors = await pageViewsCollection.distinct("visitorId", { visitorId: { $ne: null } });
    const unreadMessages = await contactMessagesCollection.countDocuments({ read: false });
    const totalMessages = await contactMessagesCollection.countDocuments();
    const totalProjects = await projectsCollection.countDocuments();

    const topPages = await pageViewsCollection
      .aggregate([
        { $group: { _id: "$page", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, page: "$_id", views: 1 } },
      ])
      .toArray();

    const viewsByDay = await pageViewsCollection
      .aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            views: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", views: 1 } },
      ])
      .toArray();

    res.json({
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      unreadMessages,
      totalMessages,
      totalProjects,
      topPages,
      viewsByDay,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
