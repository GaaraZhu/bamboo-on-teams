import { Action, ActionName } from "../models/actions";
import { Response } from "lambda-api";
import { ListPlansAction } from "../models/listPlansCommand";
import { executeListPlans } from "./executors/listPlanExecutor";
import { executeListPlanBranches } from "./executors/listPlanBranchesExecutor";
import { ListPlanBranchesAction } from "../models/listPlanBranchesAction";

export class CommandExecutor {
  public static build = (): CommandExecutor => new CommandExecutor();

  public async process(action: Action, response: Response): Promise<void> {
    switch (action.name) {
      case ActionName.LIST_PLANS:
        await executeListPlans(action as ListPlansAction, response);
        break;
      case ActionName.LIST_PLAN_BRANCHES:
        await executeListPlanBranches(
          action as ListPlanBranchesAction,
          response
        );
        break;
      default:
        throw Error(`Supported commands: ${Object.values(ActionName)}`);
    }
  }
}
