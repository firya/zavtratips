import express, { Request, Response } from "express";
import {
  deleteRowInPodcastTable,
  findPodcasts,
  insertIntoPodcastsTable,
  updateRowInPodcastTable,
} from "../db/podcasts";
import {
  addExcelPodcast,
  preparePodcastData,
  removeExcelPodcast,
  updateExcelPodcast,
  updateExcelRecommendation,
} from "../db/excel";
import { updatePodcasts } from "../cron/updatePodcasts";
import {
  getRecommendationByPodcast,
  updateRowInRecommendationsTable,
} from "../db/recommendation";

export const podcastsRouter = express.Router();

podcastsRouter.get("/", async (req: Request, res: Response) => {
  const query = (req.query.query as string) || "";
  const page = Number(req.query.page as string) || undefined;
  const pagesize = Number(req.query.pagesize as string) || undefined;

  const result = await findPodcasts(query, page, pagesize);
  res.json(result);
});

podcastsRouter.post("/add", async ({ body }: Request, res: Response) => {
  if (!body.number || !body.podcast) {
    res.status(500).send("No body");
    return;
  }

  const podcastData = preparePodcastData(body);
  const result = await addExcelPodcast(podcastData);

  if (!result) {
    res.status(500).send("Something went wrong");
    return;
  }

  podcastData.row = result[0].rowNumber;
  await insertIntoPodcastsTable([podcastData]);

  res.send("Success");
});

podcastsRouter.post(
  "/update/:row",
  async ({ body, params }: Request, res: Response) => {
    const row = Number(params.row);
    if (!row) {
      res.status(500).send("No body");
      return;
    }

    const podcastData = preparePodcastData(body);
    const result = await updateExcelPodcast(row, podcastData);

    if (podcastData.date) {
      const recommendationList = await getRecommendationByPodcast(
        podcastData.podcastnumber,
      );
      if (recommendationList?.length) {
        for (const recommendation of recommendationList) {
          if (!recommendation.row || recommendation.date) continue;
          recommendation.date = podcastData.date;
          await updateExcelRecommendation(recommendation.row, recommendation);
          await updateRowInRecommendationsTable(recommendation);
        }
      }
    }

    if (!result) {
      res.status(500).json({ error: "Something went wrong" });
      return;
    }

    podcastData.row = row;
    await updateRowInPodcastTable(podcastData);

    res.send("Success");
  },
);

podcastsRouter.delete(
  "/remove/:row",
  async ({ params }: Request, res: Response) => {
    const row = Number(params.row);
    if (!row) {
      res.status(500).send("No body");
      return;
    }

    const result = await removeExcelPodcast(row);

    if (!result) {
      res.status(500).json({ error: "Something went wrong" });
      return;
    }

    await deleteRowInPodcastTable(row);

    res.send("Success");
  },
);

podcastsRouter.post("/updateTable", async (req: Request, res: Response) => {
  await updatePodcasts();

  res.send("Success");
});
