import { Composer } from "telegraf";
import { CommandType } from "./index.types";
import { getAccountList } from "../../db/accounts";

const command: string = "userlist";

export const userlist: CommandType = {
  public: true,
  command,
  help: `/${command} — show list of users`,
  run: Composer.command(command, async (ctx) => {
    try {
      const res = await getAccountList();

      if (!res) {
        ctx.reply("No users (it's impossible!)");
        return;
      }
      ctx.reply(
        res.map((user) => `${user.telegram_id} — ${user.role}`).join("\n"),
      );
    } catch (e) {
      // @ts-expect-error send error
      ctx.reply(e?.message || "something went wrong");
    }
  }),
};
