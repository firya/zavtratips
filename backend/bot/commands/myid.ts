import { Composer } from "telegraf";
import { CommandType } from "./index.types";

const command: string = "myid";

export const myid: CommandType = {
  public: true,
  command,
  help: "/myid — Return your telegram id",
  run: Composer.command(command, async (ctx) => {
    const id = `\`\`\`${ctx.update.message.from.id}\`\`\``;
    await ctx.replyWithMarkdownV2(`Your id: ${id}`);
  }),
};
