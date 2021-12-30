import { Action, ActionName, sanitizeAction } from "../models/actions";
import { BuildAction } from "../models/buildAction";
import { ListPlanBranchBuildsAction } from "../models/listPlanBranchBuildsAction";
import { ListPlanBranchesAction } from "../models/listPlanBranchesAction";
import { ListPlansAction } from "../models/listPlansCommand";

export class CommandParser {
  public static build = (): CommandParser => new CommandParser();

  public async parse(command: string): Promise<Action> {
    const action = sanitizeAction(command.split(" ")[0]);
    switch (action) {
      case ActionName.BUILD:
        return new BuildAction(command);
      case ActionName.LIST_PLANS:
        return new ListPlansAction();
      case ActionName.LIST_PLAN_BRANCHES:
        return new ListPlanBranchesAction(command);
      case ActionName.LIST_PLAN_BRANCH_BUILDS:
        return new ListPlanBranchBuildsAction(command);
      default:
        throw Error(`Supported commands: ${Object.values(ActionName)}`);
    }
  }

  public static isEmpty(value: string | undefined): boolean {
    return !value || /^ *$/.test(value);
  }

  public static extractArg(
    argName: string,
    args: string[]
  ): string | undefined {
    const argPrefix = `-${argName.toLowerCase()}=`;
    const argPrefixWithTwoDashes = `-${argPrefix}`;
    const argsInUppercase = args.map((a) => a.toLowerCase().replace(" ", ""));
    const keyAndValue = argsInUppercase.find(
      (a) => a.startsWith(argPrefix) || a.startsWith(argPrefixWithTwoDashes)
    );

    return keyAndValue?.includes("") ? keyAndValue.split("=")[1] : undefined;
  }
}
