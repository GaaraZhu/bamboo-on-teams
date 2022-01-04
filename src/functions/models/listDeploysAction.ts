import { Command, CommanderError } from "commander";
import { isEmpty } from "../utils";
import { Action, ActionName } from "./actions";

export class ListDeploysAction implements Action {
  readonly name = ActionName.LIST_DEPLOYS;
  readonly deploymentProject: string;
  readonly env: string;

  constructor(command: string) {
    const listDeploysCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option("-s, --service <service>", "service name, e.g. customers-v1")
      .option("-e, --env <env>", "env name, e.g. dev");
    listDeploysCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listDeploysCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listDeploysCommand.parse(commandInput);
    const options = listDeploysCommand.opts();
    if (isEmpty(options.service) || isEmpty(options.env)) {
      throw {
        message: listDeploysCommand.helpInformation(),
      };
    }
    this.deploymentProject = options.service!;
    this.env = options.env!;
  }
}
