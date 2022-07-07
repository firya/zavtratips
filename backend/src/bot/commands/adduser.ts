import { Composer } from "telegraf";
import Users from "../../models/users";
import setupWebApp from "../webapp";

export default {
	help: "/adduser <id> <Admin | Moderator> — Add user by telegram id",
	run: Composer.command("/adduser", async (ctx) => {
		const args = ctx.state.command.splitArgs;

		try {
			await Users.create({
				id: args[0],
				status: args[1] || "moderator",
			});

			setupWebApp([args[0]]);

			ctx.reply("👍");
		} catch (e) {
			ctx.reply(e._message);
		}
	}),
};
