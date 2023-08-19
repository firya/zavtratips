import express, { Request, Response } from "express";
import { getRecommendationByPodcast } from "../db/recommendation";

export const recommendationsRouter = express.Router();

recommendationsRouter.get("/:podcast", async (req: Request, res: Response) => {
  const podcast = req.params.podcast as string;
  if (!podcast) return res.json({ not_found: true });

  const result = await getRecommendationByPodcast(podcast);
  res.json(result);
});
