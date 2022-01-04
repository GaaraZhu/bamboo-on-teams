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

export const sanitizeAction = (actionValue: string): ActionName | undefined => {
  return Object.values(ActionName).find(
    (name) => name.toUpperCase() === actionValue.toUpperCase()
  );
};

export interface Action {
  name: ActionName;
}
