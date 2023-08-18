import { Context, Telegraf } from "telegraf";
import { getAccountList } from "../db/accounts";
import { DB } from "../db";
import { localhostURL, webAppURL } from "./constants";

export const setupWebApp = async (bot: Telegraf) => {
  const hostURL =
    process.env.NODE_ENV === "dev" ? localhostURL : process.env.HOST_URL;
  const pool = DB.getInstance();
  const userList = await getAccountList(pool);

  if (userList) {
    for (const { telegram_id } of userList) {
      try {
        await bot.telegram.setChatMenuButton({
          chatId: Number(telegram_id),
          menuButton: {
            type: "web_app",
            text: "Edit",
            web_app: {
              url: `${hostURL}${webAppURL}`,
            },
          },
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
};

export const setupWebAppForId = async (
  ctx: Context,
  remove: boolean = false,
) => {
  const hostURL =
    process.env.NODE_ENV === "dev" ? localhostURL : process.env.HOST_URL;
  try {
    await ctx.setChatMenuButton(
      remove
        ? { type: "default" }
        : {
            type: "web_app",
            text: "Edit",
            web_app: {
              url: `${hostURL}${webAppURL}`,
            },
          },
    );
  } catch (e) {
    console.log(e);
  }
};
