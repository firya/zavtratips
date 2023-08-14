import { Telegraf } from "telegraf";

import {
	// adduser,
	// removeuser,
	// userlist,
	// init,
	myid,
	// forceload,
	// updaterows,
	// help,
} from "./commands";
// import inline from "./inline";

// import setupWebApp from "./webapp";
// import commandParts from "./middlewares/commandParts";
// import botPermissions from "./middlewares/botPermissions";


export const telegramBotInit = () => {
	const token = process.env.TELEGRAM_TOKEN;
	const hostURL = process.env.NODE_ENV === 'dev' ? 'https://3710d3fbe8986c.lhr.life' : process.env.HOST_URL;

	if (!token) throw new Error("TELEGRAM_TOKEN must be provided!");
	if (!hostURL) throw new Error("HOST_URL must be provided!");

	const bot = new Telegraf(token, {handlerTimeout: 9_000_000});

	const secretPath = `/telegraf/${bot.secretPathComponent()}`;

	// Bot.use(commandParts());
	// Bot.use(botPermissions());

	try {
		bot.telegram.setWebhook(`${hostURL}${secretPath}`);
		// setupWebApp();
		console.log(`bot successfully set up webhook`);
	} catch (e) {
		console.log(e);
	}

	bot.use(
		// inline,
		// init.run,
		myid.run,
		// adduser.run,
		// removeuser.run,
		// userlist.run,
		// forceload.run,
		// updaterows.run,
		// help
	);

	return { bot, secretPath };
}
