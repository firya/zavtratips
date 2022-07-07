import { Composer } from "telegraf";

export default {
	help: "/myid — Return your telegram id",
	run: Composer.command("/myid", async (ctx) => {
		const id = "```" + ctx.update.message.from.id + "```";
		ctx.replyWithMarkdownV2(`Your id: ${id}`);
	}),
};
