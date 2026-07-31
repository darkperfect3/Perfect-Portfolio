import { Router, Request, Response } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import { securityAlertsCollection, getNextSequence } from "@workspace/db";

const router = Router();


router.post("/log-attempt", async (req: Request, res: Response): Promise<void> => {
  try {
    const { attemptedEmail } = req.body;
    if (!attemptedEmail) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      null;
    const userAgent = (req.headers["user-agent"] as string) || null;

    const id = await getNextSequence("security_alerts");
    const inserted = {
      id,
      _id: id,
      attemptedEmail,
      attemptedPassword: "Redacted",
      ipAddress,
      userAgent,
      createdAt: new Date(),
    };
    await securityAlertsCollection.insertOne(inserted);
    res.status(201).json(inserted);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/alerts", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await securityAlertsCollection.find().sort({ createdAt: -1 }).toArray();
    res.json(alerts);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
