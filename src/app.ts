import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import createError, { HttpError } from "http-errors";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import mongoose from "mongoose";

import indexRouter from "./routes/index";
import usersRouter from "./routes/users";

const app = express();

// View engine setup
app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");

// Middlewares
app.use(helmet());
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, "..", "public")));

// Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);

// 404 handler
app.use((_req, _res, next) => {
	next(createError(404));
});

// Error handler
app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
	// Set locals, only providing errors in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	res.status(err.status || 500);
	const accept = req.headers["accept"] ?? "";
	if (accept.includes("application/json")) {
		res.json({ error: res.locals.message, status: err.status || 500 });
	} else {
		res.render("error", {
			message: res.locals.message,
			error: res.locals.error,
		});
	}
});

// MongoDB connection
const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/healthscope"; // placeholder mongodburi
mongoose
	.connect(MONGODB_URI)
	.then(() => {
		if (process.env.NODE_ENV !== "test") {
			// eslint-disable-next-line no-console
			console.log("MongoDB connected");
		}
	})
	.catch((error) => {
		// eslint-disable-next-line no-console
		console.error("MongoDB connection error:", error);
	});

export default app;
