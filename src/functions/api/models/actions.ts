export enum Actions {
  BUILD = "BUILD",
  DEPLOY = "DEPLOY",
  LIST_PLAN = "LIST_PLAN",
  LIST_PLAN_BRANCHES = "LIST_PLAN_BRANCHES",
  LIST_PLAN_BRANCH_BUILDS = "LIST_PLAN_BRANCH_BUILDS",
}

export class BuildAction {
  readonly action: Actions.BUILD;
  service: string;
  branch: string;

  constructor(service: string, branch: string) {
    this.service = service;
    this.branch = branch;
  }
}

export class ListPlansAction {
  readonly action: Actions.LIST_PLAN;
  readonly project;

  constructor() {
    this.project = process.env.BAMBOO_PROJECT;
  }
}

export class ListPlanBranchesAction {
  readonly action: Actions.LIST_PLAN_BRANCHES;
  readonly planKey: string;

  constructor(planKey: string) {
    this.planKey = planKey;
  }
}

export class ListPlanBranchBuildsAction {
  readonly action: Actions.LIST_PLAN_BRANCH_BUILDS;
  readonly planBranchKey: string;

  constructor(planBranchKey: string) {
    this.planBranchKey = planBranchKey;
  }
}
