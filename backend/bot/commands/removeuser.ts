import { Composer } from "telegraf";
import { CommandType } from "./index.types";
import { removeAccountById } from "../../db/accounts";
import { setupWebAppForId } from "../webapp";

const command: string = "removeuser";

export const removeuser: CommandType = {
  public: true,
  command,
  help: `/${command} — remove user by telegram id`,
  run: Composer.command(command, async (ctx) => {
    const args = ctx.state.command.splitArgs;

    if (!args.length) {
      ctx.reply("RTFM (/help)");
      return;
    }

    try {
      await removeAccountById(String(args[0]));

      await setupWebAppForId(ctx, true);
      ctx.reply("👍");
    } catch (e) {
      // @ts-expect-error send error
      ctx.reply(e?.message || "something went wrong");
    }
  }),
};
