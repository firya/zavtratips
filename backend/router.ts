import express, { Express, Request, Response } from "express";
import { telegramBotInit } from "./bot";

export const router = (app: Express) => {
  const { bot, secretPath } = telegramBotInit();

  app.use("/webapp", express.static("../frontend/dist"));
  app.use("/webapp/*", express.static("../frontend/dist"));

  app.use(bot.webhookCallback(secretPath));

  app.get("/", (req: Request, res: Response) => {
    res.send("Get out! You are not welcome here");
  });

  app.get("/test", (req: Request, res: Response) => {
    res.send("Get out!");
  });
};
