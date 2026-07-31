import { Router, Request, Response } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import { profileCollection, getNextSequence } from "@workspace/db";

const router = Router();


router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    let profile = await profileCollection.findOne();
    if (!profile) {
      const id = await getNextSequence("profile");
      const inserted = {
        id,
        _id: id,
        name: "Your Name",
        title: "Full Stack Developer",
        bio: "Passionate developer building great products.",
        photoUrl: null,
        email: null,
        location: null,
        githubUrl: null,
        linkedinUrl: null,
        whatsappUrl: null,
        cvUrl: null,
        skills: ["React", "Node.js", "TypeScript", "MongoDB"],
        updatedAt: new Date(),
      };
      await profileCollection.insertOne(inserted);
      profile = inserted;
    }
    res.json(profile);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const profile = await profileCollection.findOne();
    if (!profile) {
      const id = await getNextSequence("profile");
      const inserted = {
        id,
        _id: id,
        ...body,
        updatedAt: new Date(),
      };
      await profileCollection.insertOne(inserted);
      res.json(inserted);
      return;
    }
    const updated = await profileCollection.findOneAndUpdate(
      { id: profile.id },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: "after", includeResultMetadata: false },
    );
    if (!updated) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
