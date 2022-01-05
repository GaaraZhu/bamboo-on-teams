import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";
import { Action, ActionName } from "./actions";
import { Response } from "lambda-api";
import { executeListDeploysCommand } from "../services/executors/listDeploysExecutor";

export class ListDeploysAction implements Action {
  readonly actionName = ActionName.LIST_DEPLOYS;
  readonly deploymentProject: string;
  readonly env: string;

  constructor(command: string) {
    const listDeploysCommand = new Command()
      .name(this.actionName)
      .usage("[options]")
      .option(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        emptyCheck
      )
      .option("-e, --env <env>", "env name, e.g. dev", emptyCheck);
    listDeploysCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listDeploysCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listDeploysCommand.parse(commandInput);
    const options = listDeploysCommand.opts();

    this.deploymentProject = options.service!;
    this.env = options.env!;
  }

  async process(response: Response): Promise<void> {
    return await executeListDeploysCommand(this, response);
  }
}
