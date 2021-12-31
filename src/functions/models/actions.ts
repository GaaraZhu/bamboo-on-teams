export enum ActionName {
  BUILD = "build",
  DEPLOY = "deploy",
  LIST_PLANS = "list-plans",
  LIST_PLAN_BRANCHES = "list-branches",
  LIST_PLAN_BRANCH_BUILDS = "list-builds",
}

export const sanitizeAction = (actionValue: string): ActionName | undefined => {
  return Object.values(ActionName).find(
    (name) => name.toUpperCase() === actionValue.toUpperCase()
  );
};

export interface Action {
  name: ActionName;
}
