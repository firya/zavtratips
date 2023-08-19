import express, { Request, Response } from "express";
import { getConfig } from "../db/config";

export const configRouter = express.Router();

configRouter.get("/", async (req: Request, res: Response) => {
  const result = await getConfig();
  res.json(result);
});
