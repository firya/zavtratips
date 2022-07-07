import Cron from "cron";

import { updateSheets } from "./spreadsheet";
import { updateAllRows } from "../libs/googlespreadsheet";

new Cron.CronJob(
	"*/30 * * * *",
	async () => {
		console.log("start update");
		await updateSheets();
		console.log("update completed");
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
