import { Action, ActionName } from "../models/actions";
import { Response } from "lambda-api";
import { ListPlansAction } from "../models/listPlansAction";
import { executeListPlansCommand } from "./executors/listPlansExecutor";
import { executeListBranchesCommand } from "./executors/listPlanBranchesExecutor";
import { ListBranchesAction } from "../models/listBranchesAction";
import { executeListBuildsCommand } from "./executors/listBuildsExecutor";
import { ListBuildsAction } from "../models/listBuildsAction";
import { executeBuildCommand } from "./executors/buildExecutor";
import { BuildAction } from "../models/buildAction";
import { DescBuildAction } from "../models/descBuildAction";
import { executeDescBuildCommand } from "./executors/descBuildExecutor";
import { ListProjectsAction } from "../models/listDeploymentProjects";
import { executeListDeploymentProjectsCommand } from "./executors/listDeploymentProjectsExecutor";
import { executeCreateReleaseCommand } from "./executors/createReleaseExecutor";
import { CreateReleaseAction } from "../models/createReleaseAction";
import { executeListEnvironmentsCommand } from "./executors/listEnvironmentsExecutor";
import { ListReleasesAction } from "../models/listReleasesAction";
import { ListEnvironmentsAction } from "../models/listEnvironmentsAction";
import { executeListReleasesCommand } from "./executors/listReleasesExecutor";
import { executeDeployReleaseCommand } from "./executors/deployReleaseExecutor";
import { DeployReleaseAction } from "../models/deployReleaseAction";
import { executeDeployLatestCommand } from "./executors/deployLatestBuildExecutor";
import { DeployLatestBuildAction } from "../models/deployLatestBuildAction";
import { executeListDeploysCommand } from "./executors/listDeploysExecutor";
import { ListDeploysAction } from "../models/listDeploysAction";
import { executePromoteReleaseCommand } from "./executors/promoteReleaseExecutor";
import { PromoteReleaseAction } from "../models/promoteReleaseAction";

export class CommandExecutor {
  public static build = (): CommandExecutor => new CommandExecutor();

  public async process(action: Action, response: Response): Promise<void> {
    switch (action.name) {
      case ActionName.LIST_PLANS:
        await executeListPlansCommand(action as ListPlansAction, response);
        break;
      case ActionName.LIST_BRANCHES:
        await executeListBranchesCommand(
          action as ListBranchesAction,
          response
        );
        break;
      case ActionName.LIST_BUILDS:
        await executeListBuildsCommand(action as ListBuildsAction, response);
        break;
      case ActionName.BUILD:
        await executeBuildCommand(action as BuildAction, response);
        break;
      case ActionName.DESC_BUILD:
        await executeDescBuildCommand(action as DescBuildAction, response);
        break;
      case ActionName.LIST_DEPLOY_PROJECTS:
        await executeListDeploymentProjectsCommand(
          action as ListProjectsAction,
          response
        );
        break;
      case ActionName.CREATE_RELEASE:
        await executeCreateReleaseCommand(
          action as CreateReleaseAction,
          response
        );
        break;
      case ActionName.LIST_RELEASES:
        await executeListReleasesCommand(
          action as ListReleasesAction,
          response
        );
        break;
      case ActionName.LIST_ENVS:
        await executeListEnvironmentsCommand(
          action as ListEnvironmentsAction,
          response
        );
        break;
      case ActionName.DEPLOY_RELEASE:
        await executeDeployReleaseCommand(action as DeployReleaseAction, response);
        break;
      case ActionName.DEPLOY_LATEST_BUILD:
        await executeDeployLatestCommand(
          action as DeployLatestBuildAction,
          response
        );
        break;
      case ActionName.LIST_DEPLOYS:
        await executeListDeploysCommand(action as ListDeploysAction, response);
        break;
      case ActionName.PROMOTE_RELEASE:
        await executePromoteReleaseCommand(
          action as PromoteReleaseAction,
          response
        );
        break;
      default:
        throw Error(`Supported commands: ${Object.values(ActionName)}`);
    }
  }
}
