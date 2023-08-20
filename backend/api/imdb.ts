import express, { Request, Response } from "express";
import { searchIMDB } from "../libs/imdb";

export const imdbRouter = express.Router();

imdbRouter.get("/", async (req: Request, res: Response) => {
  const query = (req.query.query as string) || "";

  const result = await searchIMDB(query);
  res.json(result);
});
