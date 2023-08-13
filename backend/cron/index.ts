import cron from "node-cron";
import { updateConfig } from "./updateConfig";
import {updateStreams} from "./updateStreams";

export const cronJobs = () => {
    cron.schedule('0 0 * * *', updateConfig);
    cron.schedule('0 0 * * *', updateStreams);
}