import express from "express";
import { podcastsRouter } from "./podcasts";
import { recommendationsRouter } from "./recommendations";
import { configRouter } from "./config";
import { imdbRouter } from "./imdb";
import { rawgRouter } from "./rawg";

export const apiRouter = express.Router();

apiRouter.use("/podcasts", podcastsRouter);
apiRouter.use("/recommendations", recommendationsRouter);
apiRouter.use("/config", configRouter);
apiRouter.use("/imdb", imdbRouter);
apiRouter.use("/rawg", rawgRouter);
