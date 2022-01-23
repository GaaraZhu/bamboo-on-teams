import { Command, CommanderError } from "commander";
import { Action, ActionName } from "./actions";
import { executeListDeploymentProjectsCommand } from "../services/executors/listDeploymentProjectsExecutor";

export class ListDeploymentProjectsAction implements Action {
  readonly actionName = ActionName.LIST_DEPLOY_PROJECTS;
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

  async process(): Promise<any> {
    return await executeListDeploymentProjectsCommand(this);
  }
}
