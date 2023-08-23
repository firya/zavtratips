import cron from "node-cron";
import { updateConfig } from "./updateConfig";
import { updateStreams } from "./updateStreams";
import { updateRecommendations } from "./updateRecommendations";
import { updatePodcasts } from "./updatePodcasts";
import { downloadStreamList } from "./downloadStreams";

export const cronJobs = () => {
  cron.schedule("0 0 * * *", updateConfig);
  cron.schedule("0 0 * * *", updateStreams);
  cron.schedule("0 0 * * *", updatePodcasts);
  cron.schedule("*/30 * * * *", updateRecommendations);
  cron.schedule("0 23 * * *", downloadStreamList);
};
