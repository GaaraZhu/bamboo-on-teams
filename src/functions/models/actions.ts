export enum ActionName {
  BUILD = "build",
  LIST_PLANS = "list-plans",
  LIST_BRANCHES = "list-branches",
  LIST_BUILDS = "list-builds",
  DESC_BUILD = "desc-build",
  DEPLOY = "deploy",
  DEPLOY_LATEST = "deploy-latest",
  LIST_DEPLOY_PROJECTS = "list-deploy-projects",
  CREATE_RELEASE = "create-release",
  LIST_RELEASES = "list-releases",
  LIST_ENVS = "list-envs",
}

export const sanitizeAction = (actionValue: string): ActionName | undefined => {
  return Object.values(ActionName).find(
    (name) => name.toUpperCase() === actionValue.toUpperCase()
  );
};

export interface Action {
  name: ActionName;
}
