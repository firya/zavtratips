import { Context } from "telegraf";
import { publicCommands } from "../constants";
import { DB } from "../../db";
import { getAccountById } from "../../db/accounts";

export const botPermissions =
  () => async (ctx: Context, next: () => Promise<void>) => {
    if (ctx.channelPost || ctx.message) {
      if (ctx.state?.command) {
        if (!publicCommands.includes(ctx.state.command.command)) {
          // @ts-expect-error poor typing
          const { id } = ctx.update.message.from;

          const pool = DB.getInstance();
          const userData = await getAccountById(pool, id);

          if (!userData || userData.role !== "admin") {
            ctx.reply(`You have no permission to use this command`);
            return;
          }
        }
      }
    }
    return next();
  };
