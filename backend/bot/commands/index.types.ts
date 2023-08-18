import { Context, MiddlewareFn } from "telegraf";

export type CommandType = {
  public: boolean;
  command: string;
  help: string;
  run: MiddlewareFn<Context>;
};
