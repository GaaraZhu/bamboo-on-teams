import { CommandService } from "../services/commandService";

export enum ActionNames {
  BUILD = "build",
  DEPLOY = "deploy",
  LIST_PLANS = "list-plans",
  LIST_PLAN_BRANCHES = "list-branches",
  LIST_PLAN_BRANCH_BUILDS = "list-builds",
}

export interface Action {
  usage(): string;
}

export class BuildAction implements Action {
  readonly action = ActionNames.BUILD;
  service: string;
  branch: string;

  public usage(): string {
    return "Usage: build -service=[service] -branch=[branch]";
  }

  constructor(command: string) {
    const actionAndArgs = command.split(" ");
    if (actionAndArgs.length == 1) {
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

export class ListPlansAction implements Action {
  readonly action = ActionNames.LIST_PLANS;
  readonly project;

  public usage(): string {
    return "Usage: list-plans";
  }

  constructor() {
    this.project = process.env.BAMBOO_PROJECT;
  }
}

export class ListPlanBranchesAction implements Action {
  readonly action = ActionNames.LIST_PLAN_BRANCHES;
  readonly planKey: string;

  public usage(): string {
    return "Usage: list-branches -planKey=[planKey]";
  }

  constructor(command: string) {
    const actionAndArgs = command.split(" ");
    if (actionAndArgs.length == 1) {
      throw {
        message: this.usage(),
      };
    }
    const args = actionAndArgs.slice(1);
    const planKey = CommandService.extractArg("planKey", args);
    if (CommandService.isEmpty(planKey)) {
      throw {
        message: this.usage(),
      };
    }
    this.planKey = planKey!;
  }
}

export class ListPlanBranchBuildsAction implements Action {
  readonly action = ActionNames.LIST_PLAN_BRANCH_BUILDS;
  readonly planBranchKey: string;

  public usage(): string {
    return "Usage: list-builds -branchKey=[branchKey]";
  }

  constructor(command: string) {
    const actionAndArgs = command.split(" ");
    if (actionAndArgs.length == 1) {
      throw {
        message: this.usage(),
      };
    }
    const args = actionAndArgs.slice(1);
    const branchKey = CommandService.extractArg("branchKey", args);
    if (CommandService.isEmpty(branchKey)) {
      throw {
        message: this.usage(),
      };
    }
    this.planBranchKey = branchKey!;
  }
}
