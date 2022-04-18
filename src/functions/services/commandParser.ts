import {
  Action,
  actionLookup,
  ActionName,
  sanitizeActionName,
} from "../models/actions";

export class CommandParser {
  public static build = (): CommandParser => new CommandParser();

  public async parse(command: string, triggeredBy: string): Promise<Action> {
    const actionName = sanitizeActionName(command.split(" ")[0]);
    if (!actionName) {
      throw {
        status: 400,
        message: `Supported commands: ${Object.values(ActionName).join(", ")}`,
      };
    }

    const action = actionLookup[actionName];
    if (!action) {
      throw {
        status: 500,
        message: "Internal error: no action found in the lookup table",
      };
    }

    return new action(command, triggeredBy);
  }
}
