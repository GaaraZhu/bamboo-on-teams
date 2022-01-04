import { Action, ActionName, sanitizeAction } from "../models/actions";
import { BuildAction } from "../models/buildAction";
import { DescBuildAction } from "../models/descBuildAction";
import { ListProjectsAction } from "../models/listDeploymentProjects";
import { ListBuildsAction } from "../models/listBuildsAction";
import { ListBranchesAction } from "../models/listBranchesAction";
import { ListPlansAction } from "../models/listPlansAction";
import { CreateReleaseAction } from "../models/createReleaseAction";
import { ListReleasesAction } from "../models/listReleasesAction";
import { ListEnvironmentsAction } from "../models/listEnvironmentsAction";
import { DeployAction } from "../models/deployAction";
import { DeployLatestAction } from "../models/deployLatestAction";
import { ListDeploysAction } from "../models/listDeploysAction";

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
      case ActionName.CREATE_RELEASE:
        return new CreateReleaseAction(command);
      case ActionName.LIST_RELEASES:
        return new ListReleasesAction(command);
      case ActionName.LIST_ENVS:
        return new ListEnvironmentsAction(command);
      case ActionName.DEPLOY:
        return new DeployAction(command);
      case ActionName.DEPLOY_LATEST:
        return new DeployLatestAction(command);
      case ActionName.LIST_DEPLOYS:
        return new ListDeploysAction(command);
      default:
        throw Error(`Supported commands: ${Object.values(ActionName)}`);
    }
  }
}
