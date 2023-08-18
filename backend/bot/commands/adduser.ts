import { Composer } from "telegraf";
import { CommandType } from "./index.types";
import { insertIntoAccountsTable } from "../../db/accounts";
import { DB } from "../../db";
import { setupWebAppForId } from "../webapp";

const command: string = "adduser";

export const adduser: CommandType = {
  public: true,
  command,
  help: `/${command} <id> <Admin | Moderator> — add user by telegram id`,
  run: Composer.command(command, async (ctx) => {
    const args = ctx.state.command.splitArgs;

    if (!args.length) {
      ctx.reply("RTFM (/help)");
      return;
    }

    try {
      const pool = DB.getInstance();
      await insertIntoAccountsTable(pool, [
        {
          telegram_id: args[0],
          role: args[1] || "moderator",
        },
      ]);
      await setupWebAppForId(ctx);
      ctx.reply("👍");
    } catch (e) {
      // @ts-expect-error send error
      ctx.reply(e?.message || "something went wrong");
    }
  }),
};
