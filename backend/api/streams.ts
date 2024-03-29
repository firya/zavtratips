import express, { Request, Response } from "express";
import { updateStreams } from "../cron/updateStreams";
import { downloadStreamList } from "../cron/downloadStreams";

export const streamsRouter = express.Router();
streamsRouter.post("/updateTable", async (req: Request, res: Response) => {
  await updateStreams();

  res.send("Success");
});
streamsRouter.post("/updateStreamList", async (req: Request, res: Response) => {
  await downloadStreamList();

  res.send("Success");
});
