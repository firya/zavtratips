import { Composer } from "telegraf";

import { updateAllRows } from "../../libs/googlespreadsheet";

export default {
	help: "/updaterows — Update all rows in spreadsheet",
	run: Composer.command("/updaterows", async (ctx) => {
		const args = ctx.state.command.splitArgs;

		await updateAllRows(
			process.env.GOOGLE_SPREADSHEET_URL,
			"Рекомендации",
			args[0],
			args[1]
		);

		ctx.reply("👍");
	}),
};
