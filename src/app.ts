import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import createError, { HttpError } from "http-errors";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import errorHandler from "./middlewares/errorHandler";
import connectDB from './config/db';

import indexRouter from "./routes/index";
//import readersRoutes from "./routes/users/readers.routes"; 
import partnerRoutes from "./routes/users/partner.routes";


const app = express();

const initDatabase = async () => {
    await connectDB();
};

initDatabase();

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
app.use("/api/v1/", indexRouter);
//app.use("/api/v1/", readersRoutes);
app.use("/api/v1", partnerRoutes);

// 404 handler
app.use((_req, _res, next) => {
	next(createError(404));
});

app.use(errorHandler);

export default app;
