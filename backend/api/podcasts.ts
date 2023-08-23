import express, { Request, Response } from "express";
import { findPodcasts } from "../db/podcasts";
import {
  addExcelPodcast,
  preparePodcastData,
  removeExcelPodcast,
  updateExcelPodcast,
} from "../db/excel";
import { updatePodcasts } from "../cron/updatePodcasts";

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

  const result = await addExcelPodcast(preparePodcastData(body));

  await updatePodcasts();

  if (!result) {
    res.status(500).send("Something went wrong");
    return;
  }

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

    const result = await updateExcelPodcast(row, preparePodcastData(body));

    await updatePodcasts();

    if (!result) {
      res.status(500).json({ error: "Something went wrong" });
      return;
    }

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

    await updatePodcasts();

    if (!result) {
      res.status(500).json({ error: "Something went wrong" });
      return;
    }

    res.send("Success");
  },
);
