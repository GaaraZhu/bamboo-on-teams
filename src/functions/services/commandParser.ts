import { Action, ActionName, sanitizeAction } from "../models/actions";
import { BuildAction } from "../models/buildAction";
import { DescBuildAction } from "../models/descBuildAction";
import { ListProjectsAction } from "../models/listDeploymentProjects";
import { ListBuildsAction } from "../models/listBuildsAction";
import { ListBranchesAction } from "../models/listBranchesAction";
import { ListPlansAction } from "../models/listPlansAction";

export class CommandParser {
  public static build = (): CommandParser => new CommandParser();

  public async parse(command: string): Promise<Action> {
    const action = sanitizeAction(command.split(" ")[0]);
    switch (action) {
      case ActionName.BUILD:
        return new BuildAction(command);
      case ActionName.LIST_PLANS:
        return new ListPlansAction();
      case ActionName.LIST_BRANCHES:
        return new ListBranchesAction(command);
      case ActionName.LIST_BUILDS:
        return new ListBuildsAction(command);
      case ActionName.DESC_BUILD:
        return new DescBuildAction(command);
      case ActionName.LIST_DEPLOY_PROJECTS:
        return new ListProjectsAction();
      default:
        throw Error(`Supported commands: ${Object.values(ActionName)}`);
    }
  }

  public static isEmpty(value: string | undefined): boolean {
    return !value || /^ *$/.test(value);
  }
}
