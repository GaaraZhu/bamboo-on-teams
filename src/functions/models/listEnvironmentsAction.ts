import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName } from "./actions";
import { executeListEnvironmentsCommand } from "../services/executors/listEnvironmentsExecutor";
import { TeamsUser } from "./teams";

export class ListEnvironmentsAction implements Action {
  readonly actionName = ActionName.LIST_ENVS;
  readonly triggeredBy: TeamsUser;
  readonly deploymentProject: string;

  constructor(command: string, triggeredBy: TeamsUser) {
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

  async process(): Promise<any> {
    return await executeListEnvironmentsCommand(this);
  }
}
