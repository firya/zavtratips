import * as commandList from "./commands";
import { typedObjectKeys } from "../utils";

export const publicCommands = typedObjectKeys(commandList).map(
  (key) => commandList[key].command,
);
