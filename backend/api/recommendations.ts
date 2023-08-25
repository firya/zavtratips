import express, { Request, Response } from "express";
import {
  deleteRowInRecommendationsTable,
  getRecommendationByPodcast,
  insertIntoRecommendationsTable,
  updateRowInRecommendationsTable,
} from "../db/recommendation";
import {
  addExcelRecommendation,
  prepareRecommendationData,
  removeExcelRecommendation,
  updateExcelRecommendation,
} from "../db/excel";
import { updateRecommendations } from "../cron/updateRecommendations";

export const recommendationsRouter = express.Router();

recommendationsRouter.get("/:podcast", async (req: Request, res: Response) => {
  const podcast = req.params.podcast as string;
  if (!podcast) return res.json({ not_found: true });

  const result = await getRecommendationByPodcast(podcast);
  res.json(result);
});

recommendationsRouter.post("/add", async ({ body }: Request, res: Response) => {
  if (!body.title || !body.podcast) {
    res.status(500).send("No body");
    return;
  }

  const recommendationData = prepareRecommendationData(body);
  const result = await addExcelRecommendation(recommendationData);

  if (!result) {
    res.status(500).send("Something went wrong");
    return;
  }

  recommendationData.row = result[0].rowNumber;
  await insertIntoRecommendationsTable([recommendationData]);

  res.send("Success");
});

recommendationsRouter.post(
  "/update/:row",
  async ({ body, params }: Request, res: Response) => {
    const row = Number(params.row);
    if (!row) {
      res.status(500).send("No body");
      return;
    }

    const recommendationData = prepareRecommendationData(body);
    const result = await updateExcelRecommendation(row, recommendationData);

    if (!result) {
      res.status(500).json({ error: "Something went wrong" });
      return;
    }

    recommendationData.row = row;
    await updateRowInRecommendationsTable(recommendationData);

    res.send("Success");
  },
);

recommendationsRouter.delete(
  "/remove/:row",
  async ({ params }: Request, res: Response) => {
    const row = Number(params.row);
    if (!row) {
      res.status(500).send("No body");
      return;
    }

    const result = await removeExcelRecommendation(row);

    if (!result) {
      res.status(500).json({ error: "Something went wrong" });
      return;
    }

    await deleteRowInRecommendationsTable(row);

    res.send("Success");
  },
);

recommendationsRouter.post(
  "/updateTable",
  async (req: Request, res: Response) => {
    await updateRecommendations();

    res.send("Success");
  },
);
