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

export enum ActionName {
  BUILD = "build",
  LIST_PLANS = "list-plans",
  LIST_BRANCHES = "list-branches",
  LIST_BUILDS = "list-builds",
  DESC_BUILD = "desc-build",
  DEPLOY_BUILD = "deploy-build",
  DEPLOY_RELEASE = "deploy-release",
  DEPLOY_LATEST_BUILD = "deploy-latest-build",
  LIST_DEPLOY_PROJECTS = "list-deploy-projects",
  CREATE_RELEASE = "create-release",
  LIST_RELEASES = "list-releases",
  LIST_ENVS = "list-envs",
  LIST_DEPLOYS = "list-deploys",
  PROMOTE_RELEASE = "promote-release",
}

export const sanitizeActionName = (
  actionValue: string
): ActionName | undefined => {
  return Object.values(ActionName).find(
    (name) => name.toUpperCase() === actionValue.toUpperCase()
  );
};

export interface Action {
  actionName: ActionName;
  process(response: Response): Promise<void>;
}

export const actionLookup: Record<ActionName, Class<Action>> = {
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
};
