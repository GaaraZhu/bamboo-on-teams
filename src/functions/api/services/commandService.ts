import {
  Action,
  ActionNames,
  ListPlanBranchBuildsAction,
  ListPlanBranchesAction,
  ListPlansAction,
} from "../models/actions";
import { BuildAction } from "../models/buildAction";

const usage =
  "Supported commands: build, list-plans, list-branches, list-builds";

export class CommandService {
  public static build = (): CommandService => new CommandService();

  public async parse(command: string): Promise<Action> {
    const action = command.split(" ")[0];

    switch (action.toUpperCase()) {
      case ActionNames.BUILD:
        return new BuildAction(command);
      case ActionNames.LIST_PLANS:
        return new ListPlansAction();
      case ActionNames.LIST_PLAN_BRANCHES:
        return new ListPlanBranchesAction(command);
      case ActionNames.LIST_PLAN_BRANCH_BUILDS:
        return new ListPlanBranchBuildsAction(command);
      default:
        throw {
          message: usage,
        };
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
