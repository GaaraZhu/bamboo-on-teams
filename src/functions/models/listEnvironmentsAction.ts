import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";
import { Action, ActionName } from "./actions";

export class ListEnvironmentsAction implements Action {
  readonly name = ActionName.LIST_ENVS;
  readonly deploymentProject: string;

  constructor(command: string) {
    const listEnvsCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option(
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
}
