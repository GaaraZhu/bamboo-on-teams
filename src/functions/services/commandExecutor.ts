import { Action, ActionName } from "../models/actions";
import { Response } from "lambda-api";
import { ListPlansAction } from "../models/listPlansCommand";
import { executeListPlans } from "./executors/listPlanExecutor";
import { executeListPlanBranches } from "./executors/listPlanBranchesExecutor";
import { ListPlanBranchesAction } from "../models/listPlanBranchesAction";
import { executeListPlanBranchBuilds } from "./executors/listPlanBranchBuildsExecutor";
import { ListPlanBranchBuildsAction } from "../models/listPlanBranchBuildsAction";
import { executeBuild } from "./executors/buildExecutor";
import { BuildAction } from "../models/buildAction";
import { LastBuildAction } from "../models/lastBuildAction";
import { executeLastBuild } from "./executors/lastBuildExecutor";
import { ListProjectsAction } from "../models/listDeploymentProjects";
import { executeListDeploymentProjects } from "./executors/listDeploymentProjectsExecutor";

export class CommandExecutor {
  public static build = (): CommandExecutor => new CommandExecutor();

  public async process(action: Action, response: Response): Promise<void> {
    switch (action.name) {
      case ActionName.LIST_PLANS:
        await executeListPlans(action as ListPlansAction, response);
        break;
      case ActionName.LIST_PLAN_BRANCHES:
        await executeListPlanBranches(
          action as ListPlanBranchesAction,
          response
        );
        break;
      case ActionName.LIST_PLAN_BRANCH_BUILDS:
        await executeListPlanBranchBuilds(
          action as ListPlanBranchBuildsAction,
          response
        );
        break;
      case ActionName.BUILD:
        await executeBuild(action as BuildAction, response);
        break;
      case ActionName.LAST_PLAN_BRANCH_BUILD:
        await executeLastBuild(action as LastBuildAction, response);
        break;
      case ActionName.LIST_DEPLOY_PROJECTS:
        await executeListDeploymentProjects(
          action as ListProjectsAction,
          response
        );
        break;
      default:
        throw Error(`Supported commands: ${Object.values(ActionName)}`);
    }
  }
}
