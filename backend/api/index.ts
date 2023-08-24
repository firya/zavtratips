import express from "express";
import { podcastsRouter } from "./podcasts";
import { recommendationsRouter } from "./recommendations";
import { configRouter } from "./config";
import { imdbRouter } from "./imdb";
import { rawgRouter } from "./rawg";
import { verifyTelegramWebAppData } from "../libs/telegram";

export const apiRouter = express.Router();

apiRouter.use("/", async (req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    next();
    return;
  }

  const initData = (req.query.initData as string) || "";
  console.log(initData);

  const result = await verifyTelegramWebAppData(initData);

  if (!result) {
    res.status(401).send("No initData");
    return;
  }
  next();
});

apiRouter.use("/podcasts", podcastsRouter);
apiRouter.use("/recommendations", recommendationsRouter);
apiRouter.use("/config", configRouter);
apiRouter.use("/imdb", imdbRouter);
apiRouter.use("/rawg", rawgRouter);
