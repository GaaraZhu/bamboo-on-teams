import { Action, ActionNames, BuildAction } from "../models/actions";

const usage = "Supported commands: build, list-plans, list-branches, list-builds";

export class CommandService {
  public static build = (): CommandService => new CommandService();

  public async parse(command: string): Promise<Action> {
    const action = command.split(" ")[0];

    switch(action.toUpperCase()) {
      case ActionNames.BUILD:
        return new BuildAction(command);
      default:
        throw {
          message: usage,
        }
    }
  }

  public static isEmpty(value: string | undefined): boolean {
    return !value || /^ *$/.test(value);
  };

  public static extractArg(
    argName: string,
    args: string[]
  ): string | undefined {
    const argPrefix = `-${argName.toUpperCase()}=`;
    const argPrefixWithTwoDashes = `-${argPrefix}`;
    const argsInUppercase = args.map((a) => a.toUpperCase().replace(" ", ""));
    const keyAndValue = argsInUppercase.find(
      (a) => a.startsWith(argPrefix) || a.startsWith(argPrefixWithTwoDashes)
    );

    return keyAndValue?.includes("") ? keyAndValue.split("=")[1] : undefined;
  }
}
