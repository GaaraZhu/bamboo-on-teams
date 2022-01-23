import { Command, CommanderError } from "commander";
import { Action, ActionName, JobType } from "./actions";
import { Response } from "lambda-api";
import { executeListDeploymentProjectsCommand } from "../services/executors/listDeploymentProjectsExecutor";

export class ListDeploymentProjectsAction implements Action {
  readonly actionName = ActionName.LIST_DEPLOY_PROJECTS;
  readonly type = JobType.Deploy;
  readonly triggeredBy: string;

  constructor(triggeredBy: string) {
    const listProjectsCommand = new Command()
      .name(this.actionName)
      .description("List deployment projects.");
    listProjectsCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: listProjectsCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", "."];
    listProjectsCommand.parse(commandInput);
    this.triggeredBy = triggeredBy;
  }

  async process(response: Response): Promise<void> {
    return await executeListDeploymentProjectsCommand(this, response);
  }
}
