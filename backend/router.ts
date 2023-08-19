import { Express, Request, Response } from "express";
import { telegramBotInit } from "./bot";
import { apiRouter } from "./api";

export const router = (app: Express) => {
  const { bot, secretPath } = telegramBotInit();

  app.use(bot.webhookCallback(secretPath));

  app.use("/api", apiRouter);

  app.get("/", (req: Request, res: Response) => {
    res.send("Get out! You are not welcome here");
  });
};
