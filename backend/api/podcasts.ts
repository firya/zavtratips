import express, { Request, Response } from "express";
import { findPodcasts } from "../db/podcasts";

export const podcastsRouter = express.Router();

podcastsRouter.get("/", async (req: Request, res: Response) => {
  const query = (req.query.query as string) || "";
  const page = Number(req.query.page as string) || undefined;
  const pagesize = Number(req.query.pagesize as string) || undefined;

  const result = await findPodcasts(query, page, pagesize);
  res.json(result);
});
