import express, { Request, Response } from "express";
import { getConfig } from "../db/config";
import { updateConfig } from "../cron/updateConfig";

export const configRouter = express.Router();

configRouter.get("/", async (req: Request, res: Response) => {
  const result = await getConfig();
  res.json(result);
});

configRouter.post("/updateTable", async (req: Request, res: Response) => {
  await updateConfig();

  res.send("Success");
});
