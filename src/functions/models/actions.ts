import { Class } from "../utils";
import { Response } from "lambda-api";
import { BuildAction } from "./buildAction";
import { CreateReleaseAction } from "./createReleaseAction";
import { DeployLatestBuildAction } from "./deployLatestBuildAction";
import { DeployReleaseAction } from "./deployReleaseAction";
import { DescBuildAction } from "./descBuildAction";
import { ListBranchesAction } from "./listBranchesAction";
import { ListBuildsAction } from "./listBuildsAction";
import { ListDeploymentProjectsAction } from "./listDeploymentProjects";
import { ListDeploysAction } from "./listDeploysAction";
import { ListEnvironmentsAction } from "./listEnvironmentsAction";
import { ListPlansAction } from "./listPlansAction";
import { ListReleasesAction } from "./listReleasesAction";
import { PromoteReleaseAction } from "./promoteReleaseAction";
import { DeployBuildAction } from "./deployBuildAction";
import { createBranchAction } from "./createBranchAction";
import { HelpAction } from "./helpAction";

export enum ActionName {
  HELP = "help",
  BUILD = "build",
  LIST_PLANS = "list-plans",
  LIST_BRANCHES = "list-branches",
  LIST_BUILDS = "list-builds",
  DESC_BUILD = "desc-build",
  DEPLOY_BUILD = "deploy-build",
  DEPLOY_RELEASE = "deploy-release",
  DEPLOY_LATEST_BUILD = "deploy-latest",
  LIST_DEPLOY_PROJECTS = "list-projects",
  CREATE_RELEASE = "create-release",
  LIST_RELEASES = "list-releases",
  LIST_ENVS = "list-envs",
  LIST_DEPLOYS = "list-deploys",
  PROMOTE_RELEASE = "promote-release",
  CREATE_BRANCH = "create-branch",
}

export const sanitizeActionName = (
  actionValue: string
): ActionName | undefined => {
  return Object.values(ActionName).find(
    (name) => name.toUpperCase() === actionValue.toUpperCase()
  );
};

export enum JobType {
  BUILD,
  Deploy,
  OTHERS,
}

export interface Action {
  actionName: ActionName;
  triggeredBy: string;
  type: JobType;
  process(response: Response): Promise<void>;
}

export const actionLookup: Record<ActionName, Class<Action>> = {
  [ActionName.HELP]: HelpAction,
  [ActionName.BUILD]: BuildAction,
  [ActionName.CREATE_RELEASE]: CreateReleaseAction,
  [ActionName.DEPLOY_LATEST_BUILD]: DeployLatestBuildAction,
  [ActionName.DEPLOY_RELEASE]: DeployReleaseAction,
  [ActionName.DESC_BUILD]: DescBuildAction,
  [ActionName.DEPLOY_BUILD]: DeployBuildAction,
  [ActionName.LIST_BRANCHES]: ListBranchesAction,
  [ActionName.LIST_BUILDS]: ListBuildsAction,
  [ActionName.LIST_DEPLOY_PROJECTS]: ListDeploymentProjectsAction,
  [ActionName.LIST_DEPLOYS]: ListDeploysAction,
  [ActionName.LIST_ENVS]: ListEnvironmentsAction,
  [ActionName.LIST_PLANS]: ListPlansAction,
  [ActionName.LIST_RELEASES]: ListReleasesAction,
  [ActionName.PROMOTE_RELEASE]: PromoteReleaseAction,
  [ActionName.CREATE_BRANCH]: createBranchAction,
};

export const actionGroupLookup: Record<JobType, ActionName[]> = {
  [JobType.BUILD]: [
    ActionName.LIST_PLANS,
    ActionName.LIST_BRANCHES,
    ActionName.LIST_BUILDS,
    ActionName.DESC_BUILD,
    ActionName.BUILD,
    ActionName.CREATE_BRANCH,
  ],
  [JobType.Deploy]: [
    ActionName.LIST_DEPLOY_PROJECTS,
    ActionName.LIST_ENVS,
    ActionName.LIST_RELEASES,
    ActionName.LIST_DEPLOYS,
    ActionName.CREATE_RELEASE,
    ActionName.DEPLOY_LATEST_BUILD,
    ActionName.DEPLOY_RELEASE,
    ActionName.DEPLOY_BUILD,
    ActionName.PROMOTE_RELEASE,
  ],
  [JobType.OTHERS]: [ActionName.HELP],
};
