import * as commandList from "./commands";
import { typedObjectKeys } from "../utils";

export const publicCommands = typedObjectKeys(commandList).map(
  (key) => commandList[key].command,
);
export const localhostURL = "https://5652bbbef991cb.lhr.life";
export const webAppURL = "/webapp";
