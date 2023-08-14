import { Telegraf } from "telegraf";
import { getAccountList } from "../db/accounts";
import { DB } from "../db";

export const setupWebApp = async (bot: Telegraf, url: string) => {
  const pool = DB.getInstance();
  const userList = await getAccountList(pool);

  if (userList.rows.length > 0) {
    for (const { telegram_id } of userList.rows) {
      try {
        await bot.telegram.setChatMenuButton({
          chatId: telegram_id,
          menuButton: {
            type: "web_app",
            text: "Edit",
            web_app: {
              url: url,
            },
          },
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
};
