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
import { DeployReleaseAction } from "../models/deployReleaseAction";
import { DeployLatestBuildAction } from "../models/deployLatestBuildAction";
import { ListDeploysAction } from "../models/listDeploysAction";
import { PromoteReleaseAction } from "../models/promoteReleaseAction";

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
      case ActionName.DEPLOY_RELEASE:
        return new DeployReleaseAction(command);
      case ActionName.DEPLOY_LATEST_BUILD:
        return new DeployLatestBuildAction(command);
      case ActionName.LIST_DEPLOYS:
        return new ListDeploysAction(command);
      case ActionName.PROMOTE_RELEASE:
        return new PromoteReleaseAction(command);
      default:
        throw Error(`Supported commands: ${Object.values(ActionName)}`);
    }
  }
}
