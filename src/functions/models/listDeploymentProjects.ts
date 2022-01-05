import { Command, CommanderError } from "commander";
import { Action, ActionName } from "./actions";
import { Response } from "lambda-api";
import { executeListDeploymentProjectsCommand } from "../services/executors/listDeploymentProjectsExecutor";

export class ListDeploymentProjectsAction implements Action {
  readonly actionName = ActionName.LIST_DEPLOY_PROJECTS;

  constructor() {
    const listProjectsCommand = new Command().name(this.actionName);
    listProjectsCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listProjectsCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", "."];
    listProjectsCommand.parse(commandInput);
  }

  async process(response: Response): Promise<void> {
    return await executeListDeploymentProjectsCommand(this, response);
  }
}
