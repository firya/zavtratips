import { Telegraf } from "telegraf";
import { hostURL } from "../dev";
import {
	adduser,
	removeuser,
	userlist,
	init,
	myid,
	forceload,
	updaterows,
	help,
} from "./commands";
import inline from "./inline";

import setupWebApp from "./webapp";
import commandParts from "./middlewares/commandParts";
import botPermissions from "./middlewares/botPermissions";

const token = process.env.TELEGRAM_TOKEN;
if (token === undefined) {
	throw new Error("TELEGRAM_TOKEN must be provided!");
}

const Bot = new Telegraf(token);

Bot.use(commandParts());
Bot.use(botPermissions());

export const secretPath = `/telegraf/${Bot.secretPathComponent()}`;

try {
	Bot.telegram.setWebhook(`${hostURL}${secretPath}`);
	setupWebApp();
	console.log(`bot successfully set up webhook at ${hostURL}${secretPath}`);
} catch (e) {
	console.log(e);
}

Bot.use(
	inline,
	init.run,
	myid.run,
	adduser.run,
	removeuser.run,
	userlist.run,
	forceload.run,
	updaterows.run,
	help
);

export default Bot;
