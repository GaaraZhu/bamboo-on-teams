export enum ActionName {
  BUILD = "build",
  DEPLOY = "deploy",
  LIST_PLANS = "list-plans",
  LIST_PLAN_BRANCHES = "list-branches",
  LIST_PLAN_BRANCH_BUILDS = "list-builds",
}

export const sanitizeAction = (actionValue: string): ActionName | undefined => {
  const enumValues = Object.values(ActionName);
  for (const sanitizedEnumValue of enumValues) {
    if (actionValue.toLowerCase() === sanitizedEnumValue.toLowerCase()) {
      return sanitizedEnumValue;
    }
  }
  return undefined;
};

export interface Action {
  name: ActionName;
}
