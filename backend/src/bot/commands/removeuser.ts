import { Composer } from "telegraf";
import Users from "../../models/users";
import setupWebApp from "../webapp";

export default {
	help: "/removeuser <id> — Remove user by telegram id",
	run: Composer.command("/removeuser", async (ctx) => {
		const args = ctx.state.command.splitArgs;

		try {
			await Users.deleteOne({
				id: args[0],
			});

			setupWebApp([args[0]], false);

			ctx.reply("👍");
		} catch (e) {
			ctx.reply(e._message);
		}
	}),
};
