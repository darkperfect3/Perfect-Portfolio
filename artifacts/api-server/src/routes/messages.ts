import { Router, Request, Response } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import { contactMessagesCollection, getNextSequence } from "@workspace/db";

const router = Router();


router.get("/", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.read === "true") {
      filter.read = true;
    } else if (req.query.read === "false") {
      filter.read = false;
    }

    const msgs = await contactMessagesCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

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

    const id = await getNextSequence("contact_messages");
    const inserted = {
      id,
      _id: id,
      name,
      email,
      subject: subject || null,
      content,
      read: false,
      aiSummary: null,
      aiIntent: null,
      createdAt: new Date(),
    };

    await contactMessagesCollection.insertOne(inserted);
    res.status(201).json(inserted);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/read", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    const updated = await contactMessagesCollection.findOneAndUpdate(
      { id },
      { $set: { read: true } },
      { returnDocument: "after", includeResultMetadata: false },
    );

    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
