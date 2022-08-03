import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName } from "./actions";
import { executeListDeploysCommand } from "../services/executors/listDeploysExecutor";
import { TeamsUser } from "./teams";

export class ListDeploysAction implements Action {
  readonly actionName = ActionName.LIST_DEPLOYS;
  readonly triggeredBy: TeamsUser;
  readonly deploymentProject: string;
  readonly env: string;

  constructor(command: string, triggeredBy: TeamsUser) {
    const listDeploysCommand = new Command()
      .name(this.actionName)
      .description("List the top three deployments in a service environment.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      )
      .requiredOption("-e, --env <env>", "env name, e.g. dev", trim);
    listDeploysCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: listDeploysCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listDeploysCommand.parse(commandInput);
    const options = listDeploysCommand.opts();

    this.deploymentProject = options.service!;
    this.env = options.env!;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeListDeploysCommand(this);
  }
}
