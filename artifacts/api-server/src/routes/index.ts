import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import projectsRouter from "./projects";
import timelineRouter from "./timeline";
import messagesRouter from "./messages";
import analyticsRouter from "./analytics";
import aiRouter from "./ai";
import chatRouter from "./chat";
import securityRouter from "./security";
import storageRouter from "./storage";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/profile", profileRouter);
router.use("/projects", projectsRouter);
router.use("/timeline", timelineRouter);
router.use("/messages", messagesRouter);
router.use("/analytics", analyticsRouter);
router.use("/ai", aiRouter);
router.use("/chat", chatRouter);
router.use("/security", securityRouter);
router.use(storageRouter);
router.use("/auth", authRouter);

export default router;
