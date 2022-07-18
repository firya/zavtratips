import Cron from "cron";

import { updateSheets } from "./spreadsheet";
import { updateAllRows } from "../libs/googlespreadsheet";
import { updateConfig } from "./config";
import { updateStreamList } from "./youtube";

new Cron.CronJob(
  "*/5 * * * *",
  async () => {
    await updateSheets();
  },
  null,
  true,
  "Europe/Moscow"
);
new Cron.CronJob(
  "*/30 * * * *",
  async () => {
    updateConfig();
  },
  null,
  true,
  "Europe/Moscow"
);
new Cron.CronJob(
  "0 0 * * *",
  async () => {
    await updateStreamList();
  },
  null,
  true,
  "Europe/Moscow"
);
// new Cron.CronJob(
// 	"0 0 1 * *",
// 	async () => {
// 		console.log("start update");
// 		await updateAllRows(process.env.GOOGLE_SPREADSHEET_URL, "Рекомендации");

// 		console.log("update completed");
// 	},
// 	null,
// 	true,
// 	"Europe/Moscow"
// );
