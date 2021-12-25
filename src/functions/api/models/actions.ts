import { CommandService } from "../services/commandService";

export enum ActionNames {
  BUILD = "BUILD",
  DEPLOY = "DEPLOY",
  LIST_PLAN = "LIST_PLAN",
  LIST_PLAN_BRANCHES = "LIST_PLAN_BRANCHES",
  LIST_PLAN_BRANCH_BUILDS = "LIST_PLAN_BRANCH_BUILDS",
}

export interface Action {
  usage(): string
}

export class BuildAction implements Action {
  readonly action = ActionNames.BUILD;
  service: string;
  branch: string;

  public usage(): string {
    return  "Usage: build -service=[service] -branch=[branch]";
  }

  constructor(command: string) {
    const actionAndArgs = command.split(" ");
    if (actionAndArgs.length==1) {
      throw {
        message: this.usage(),
      };
    }
    const args = actionAndArgs.slice(1);
    const service = CommandService.extractArg("service", args);
    const branch = CommandService.extractArg("branch", args);
    if (CommandService.isEmpty(service) || CommandService.isEmpty(branch)) {
      throw {
        message: this.usage(),
      };
    }

    this.service = service!;
    this.branch = branch!;
  }
}

export class ListPlansAction {
  readonly action = ActionNames.LIST_PLAN;
  readonly usage = "Usage: list-plans";
  readonly project;

  constructor() {
    this.project = process.env.BAMBOO_PROJECT;
  }
}

export class ListPlanBranchesAction {
  readonly action = ActionNames.LIST_PLAN_BRANCHES;
  readonly usage = "Usage: list-branches -plan-key=[plan-key]";
  readonly planKey: string;

  constructor(planKey: string) {
    this.planKey = planKey;
  }
}

export class ListPlanBranchBuildsAction {
  readonly action = ActionNames.LIST_PLAN_BRANCH_BUILDS;
  readonly usage = "Usage: list-builds -branch-key=[branch-key]";
  readonly planBranchKey: string;

  constructor(planBranchKey: string) {
    this.planBranchKey = planBranchKey;
  }
}
