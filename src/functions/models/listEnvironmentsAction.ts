import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName, JobType } from "./actions";
import { Response } from "lambda-api";
import { executeListEnvironmentsCommand } from "../services/executors/listEnvironmentsExecutor";

export class ListEnvironmentsAction implements Action {
  readonly actionName = ActionName.LIST_ENVS;
  readonly type = JobType.Deploy;
  readonly triggeredBy: string;
  readonly deploymentProject: string;

  constructor(command: string, triggeredBy: string) {
    const listEnvsCommand = new Command()
      .name(this.actionName)
      .description("List available environments for a service.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      );
    listEnvsCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: listEnvsCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listEnvsCommand.parse(commandInput);
    this.deploymentProject = listEnvsCommand.opts().service!;
    this.triggeredBy = triggeredBy;
  }

  async process(response: Response): Promise<void> {
    return await executeListEnvironmentsCommand(this, response);
  }
}
