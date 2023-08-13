import cron from "node-cron";
import { updateConfig } from "./updateConfig";
import {updateStreams} from "./updateStreams";
import {updateRecommendations} from "./updateRecommendations";

export const cronJobs = () => {
    cron.schedule('0 0 * * *', updateConfig);
    cron.schedule('0 0 * * *', updateStreams);
    cron.schedule('*/30 * * * *', updateRecommendations);
}