import express, { Request, Response } from "express";
import { searchRAWG } from "../libs/rawg";

export const rawgRouter = express.Router();

rawgRouter.get("/", async (req: Request, res: Response) => {
  const query = (req.query.query as string) || "";

  const result = await searchRAWG(query);
  res.json(result);
});
