import { Context, Telegraf } from "telegraf";
import { getAccountList } from "../db/accounts";
import { DB } from "../db";

export const setupWebApp = async (bot: Telegraf) => {
  const pool = DB.getInstance();
  const userList = await getAccountList(pool);

  if (!process.env.WEBAPP_URL) throw Error("WEBAPP_URL not set");

  if (userList) {
    for (const { telegram_id } of userList) {
      try {
        await bot.telegram.setChatMenuButton({
          chatId: Number(telegram_id),
          menuButton: {
            type: "web_app",
            text: "Edit",
            web_app: {
              url: process.env.WEBAPP_URL,
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
  if (!process.env.WEBAPP_URL) throw Error("WEBAPP_URL not set");

  try {
    await ctx.setChatMenuButton(
      remove
        ? { type: "default" }
        : {
            type: "web_app",
            text: "Edit",
            web_app: {
              url: process.env.WEBAPP_URL,
            },
          },
    );
  } catch (e) {
    console.log(e);
  }
};
