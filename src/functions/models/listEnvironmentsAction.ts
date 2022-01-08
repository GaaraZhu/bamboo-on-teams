import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";
import { Action, ActionName } from "./actions";
import { Response } from "lambda-api";
import { executeListEnvironmentsCommand } from "../services/executors/listEnvironmentsExecutor";

export class ListEnvironmentsAction implements Action {
  readonly actionName = ActionName.LIST_ENVS;
  readonly deploymentProject: string;

  constructor(command: string) {
    const listEnvsCommand = new Command()
      .name(this.actionName)
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        emptyCheck
      );
    listEnvsCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listEnvsCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listEnvsCommand.parse(commandInput);
    this.deploymentProject = listEnvsCommand.opts().service!;
  }

  async process(response: Response): Promise<void> {
    return await executeListEnvironmentsCommand(this, response);
  }
}
