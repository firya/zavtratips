import express, { Request, Response } from "express";
import { updateStreams } from "../cron/updateStreams";

export const streamsRouter = express.Router();
streamsRouter.post("/updateTable", async (req: Request, res: Response) => {
  await updateStreams();

  res.send("Success");
});
