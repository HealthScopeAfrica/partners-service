import { Router, Request, Response } from "express";

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

export default router;
