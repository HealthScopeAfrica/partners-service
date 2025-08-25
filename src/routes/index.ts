import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";

const router = Router();

/* GET partner service health check */
router.get("/", (_req: Request, res: Response) => {
	res.json({
		service: "Healthscope Partner Service",
		status: "healthy",
		version: "1.0.0",
		timestamp: new Date().toISOString()
	});
});

// Authentication routes
router.use("/auth", authRoutes);

export default router;
