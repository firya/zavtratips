import { Composer } from "telegraf";
import * as commandList from "./index";
import { DB } from "../../db";
import { getAccountById } from "../../db/accounts";
import { typedObjectKeys } from "../../utils";
import { CommandType } from "./index.types";

const command: string = "help";

export const help: CommandType = {
  public: true,
  command,
  help: "",
  run: Composer.command("help", async (ctx) => {
    try {
      const { id } = ctx.update.message.from;

      const pool = DB.getInstance();
      const userData = await getAccountById(pool, String(id));

      let helpText = "";
      if (!userData || userData.role !== "admin") {
        helpText = typedObjectKeys(commandList)
          .filter((command) => commandList[command].public)
          .map((command) => commandList[command].help)
          .join("\n");
      } else {
        helpText = typedObjectKeys(commandList)
          .map((command) => commandList[command].help)
          .join("\n");
      }

      ctx.reply(helpText);
    } catch (e) {
      // @ts-expect-error send error
      ctx.reply(e?.message || "something went wrong");
    }
  }),
};
