import { Router, Request, Response } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import { projectsCollection, getNextSequence } from "@workspace/db";

const router = Router();


router.get("/featured", async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await projectsCollection.find({ featured: true }).sort({ order: 1 }).toArray();
    res.json(projects);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query.featured === "true") {
      filter.featured = true;
    }
    if (req.query.category) {
      filter.category = String(req.query.category);
    }

    const projects = await projectsCollection.find(filter).sort({ order: 1 }).toArray();
    res.json(projects);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = await getNextSequence("projects");
    const inserted = {
      id,
      _id: id,
      createdAt: new Date(),
      featured: req.body.featured ?? false,
      order: req.body.order ?? 0,
      technologies: Array.isArray(req.body.technologies) ? req.body.technologies : [],
      ...req.body,
    };
    await projectsCollection.insertOne(inserted);
    res.status(201).json(inserted);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    const project = await projectsCollection.findOne({ id });
    if (!project) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(project);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:id", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id));
    const updated = await projectsCollection.findOneAndUpdate(
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
    await projectsCollection.deleteOne({ id });
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
