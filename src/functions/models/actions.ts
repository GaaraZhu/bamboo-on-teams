export enum ActionName {
  BUILD = "build",
  DEPLOY = "deploy",
  LIST_PLANS = "list-plans",
  LIST_BRANCHES = "list-branches",
  LIST_BUILDS = "list-builds",
  DESC_BUILD = "desc-build",
  LIST_DEPLOY_PROJECTS = "list-deploy-projects",
}

export const sanitizeAction = (actionValue: string): ActionName | undefined => {
  return Object.values(ActionName).find(
    (name) => name.toUpperCase() === actionValue.toUpperCase()
  );
};

export interface Action {
  name: ActionName;
}
