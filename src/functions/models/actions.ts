import { Class } from "../utils";
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
import { PromoteDeployAction } from "./promoteDeployAction";
import { DeployBuildAction } from "./deployBuildAction";
import { CreateBranchAction } from "./createBranchAction";
import { HelpAction } from "./helpAction";
import { SearchPlansAction } from "./searchPlansAction";
import { SearchProjectsAction } from "./searchProjectsAction";
import { BatchDeployAction } from "./batchDeployAction";
import { BatchBuildAction } from "./batchBuildAction";
import { ReleaseAction } from "./releaseAction";
import { TeamsUser } from "./teams";
import { PromoteReleaseAction } from "./promoteReleaseAction";
import { BatchCreateBranchAction } from "./batchCreateBranchAction";
import { BuildAndDeployAction } from "./buildAndDeployAction";

export enum ActionName {
  HELP = "help",
  BUILD = "build",
  BATCH_BUILD = "batch-build",
  LIST_PLANS = "list-plans",
  LIST_BRANCHES = "list-branches",
  LIST_BUILDS = "list-builds",
  DESC_BUILD = "desc-build",
  BUILD_AND_DEPLOY = "build-and-deploy",
  DEPLOY_BUILD = "deploy-build",
  DEPLOY_RELEASE = "deploy-release",
  DEPLOY = "deploy",
  BATCH_DEPLOY = "batch-deploy",
  LIST_DEPLOY_PROJECTS = "list-projects",
  CREATE_RELEASE = "create-release",
  LIST_RELEASES = "list-releases",
  LIST_ENVS = "list-envs",
  LIST_DEPLOYS = "list-deploys",
  PROMOTE_DEPLOY = "promote-deploy",
  PROMOTE_RELEASE = "promote-release",
  CREATE_BRANCH = "create-branch",
  BATCH_CREATE_BRANCH = "batch-create-branch",
  RELEASE = "release",
  SEARCH_PLANS = "search-plans",
  SEARCH_PROJECTS = "search-projects",
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
  triggeredBy: TeamsUser;
  process(): Promise<any>;
}

export const actionLookup: Record<ActionName, Class<Action>> = {
  [ActionName.HELP]: HelpAction,
  [ActionName.BUILD]: BuildAction,
  [ActionName.BUILD_AND_DEPLOY]: BuildAndDeployAction,
  [ActionName.BATCH_BUILD]: BatchBuildAction,
  [ActionName.CREATE_RELEASE]: CreateReleaseAction,
  [ActionName.DEPLOY]: DeployLatestBuildAction,
  [ActionName.DEPLOY_RELEASE]: DeployReleaseAction,
  [ActionName.DESC_BUILD]: DescBuildAction,
  [ActionName.DEPLOY_BUILD]: DeployBuildAction,
  [ActionName.BATCH_DEPLOY]: BatchDeployAction,
  [ActionName.RELEASE]: ReleaseAction,
  [ActionName.LIST_BRANCHES]: ListBranchesAction,
  [ActionName.LIST_BUILDS]: ListBuildsAction,
  [ActionName.LIST_DEPLOY_PROJECTS]: ListDeploymentProjectsAction,
  [ActionName.LIST_DEPLOYS]: ListDeploysAction,
  [ActionName.LIST_ENVS]: ListEnvironmentsAction,
  [ActionName.LIST_PLANS]: ListPlansAction,
  [ActionName.LIST_RELEASES]: ListReleasesAction,
  [ActionName.PROMOTE_DEPLOY]: PromoteDeployAction,
  [ActionName.PROMOTE_RELEASE]: PromoteReleaseAction,
  [ActionName.CREATE_BRANCH]: CreateBranchAction,
  [ActionName.BATCH_CREATE_BRANCH]: BatchCreateBranchAction,
  [ActionName.SEARCH_PLANS]: SearchPlansAction,
  [ActionName.SEARCH_PROJECTS]: SearchProjectsAction,
};

export const actionGroupLookup: Record<JobType, ActionName[]> = {
  [JobType.BUILD]: [
    ActionName.LIST_PLANS,
    ActionName.LIST_BRANCHES,
    ActionName.LIST_BUILDS,
    ActionName.DESC_BUILD,
    ActionName.BUILD,
    ActionName.BATCH_BUILD,
    ActionName.CREATE_BRANCH,
  ],
  [JobType.Deploy]: [
    ActionName.LIST_DEPLOY_PROJECTS,
    ActionName.LIST_ENVS,
    ActionName.LIST_RELEASES,
    ActionName.LIST_DEPLOYS,
    ActionName.CREATE_RELEASE,
    ActionName.BUILD_AND_DEPLOY,
    ActionName.DEPLOY,
    ActionName.DEPLOY_RELEASE,
    ActionName.DEPLOY_BUILD,
    ActionName.BATCH_DEPLOY,
    ActionName.RELEASE,
    ActionName.PROMOTE_DEPLOY,
    ActionName.PROMOTE_RELEASE,
  ],
  [JobType.OTHERS]: [ActionName.HELP],
};
