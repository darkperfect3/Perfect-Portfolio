import { Router, Request, Response } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import { timelineCollection, getNextSequence } from "@workspace/db";

const router = Router();


router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const entries = await timelineCollection.find().sort({ order: 1 }).toArray();
    res.json(entries);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = await getNextSequence("timeline");
    const inserted = {
      id,
      _id: id,
      order: req.body.order ?? 0,
      ...req.body,
    };
    await timelineCollection.insertOne(inserted);
    res.status(201).json(inserted);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    const updated = await timelineCollection.findOneAndUpdate(
      { id },
      { $set: req.body },
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

router.delete("/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    await timelineCollection.deleteOne({ id });
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
