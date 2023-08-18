import { Telegraf } from "telegraf";

import * as commandList from "./commands";
import { inline } from "./inline";

import { setupWebApp } from "./webapp";
import { commandParts } from "./middlewares/commandParts";
import { botPermissions } from "./middlewares/botPermissions";
import { typedObjectKeys } from "../utils";

export const telegramBotInit = () => {
  const token = process.env.TELEGRAM_TOKEN;
  const hostURL = process.env.HOST_URL;

  if (!token) throw new Error("TELEGRAM_TOKEN must be provided!");
  if (!hostURL) throw new Error("HOST_URL must be provided!");

  const bot = new Telegraf(token, { handlerTimeout: 9_000_000 });

  const secretPath = `/telegraf/${bot.secretPathComponent()}`;

  bot.use(commandParts());
  bot.use(botPermissions());

  try {
    bot.telegram.setWebhook(`${hostURL}${secretPath}`);
    setupWebApp(bot);
    console.log(`bot successfully set up webhook`);
  } catch (e) {
    console.log(e);
  }

  bot.use(
    inline,
    ...typedObjectKeys(commandList).map((command) => commandList[command].run),
  );

  return { bot, secretPath };
};
