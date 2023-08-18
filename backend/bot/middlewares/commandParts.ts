import { Context } from "telegraf";

const regex = /^\/([^@\s]+)@?(?:(\S+)|)\s?([\s\S]+)?$/i;

export const commandParts = () => (ctx: Context, next: () => Promise<void>) => {
  if (ctx.channelPost || ctx.message) {
    const messageText =
      ctx.updateType === "channel_post"
        ? // @ts-expect-error poor typing
          ctx.channelPost?.text
        : // @ts-expect-error poor typing
          ctx.message?.text;

    const parts = regex.exec(messageText);
    if (!parts) return next();

    ctx.state.command = {
      text: messageText,
      command: parts[1],
      bot: parts[2],
      args: parts[3],
      get splitArgs() {
        return !parts[3]
          ? []
          : parts[3].split(/\s+/).filter((arg) => arg.length);
      },
    };
  }
  return next();
};
