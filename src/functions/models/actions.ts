export enum ActionNames {
  BUILD = "build",
  DEPLOY = "deploy",
  LIST_PLANS = "list-plans",
  LIST_PLAN_BRANCHES = "list-branches",
  LIST_PLAN_BRANCH_BUILDS = "list-builds",
}

export interface Action {
  action: ActionNames;
}
