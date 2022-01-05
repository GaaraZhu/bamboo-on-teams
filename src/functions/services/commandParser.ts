import {
  Action,
  actionLookup,
  ActionName,
  sanitizeActionName,
} from "../models/actions";

export class CommandParser {
  public static build = (): CommandParser => new CommandParser();

  public async parse(command: string): Promise<Action> {
    const actionName = sanitizeActionName(command.split(" ")[0]);
    if (!actionName) {
      throw Error(`Supported commands: ${Object.values(ActionName)}`);
    }

    const action = actionLookup[actionName];
    if (!action) {
      throw Error("Internal error: no action found in the lookup table");
    }

    return new action(command);
  }
}
