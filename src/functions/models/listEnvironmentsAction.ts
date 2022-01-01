import { Command, CommanderError } from "commander";
import { CommandParser } from "../services/commandParser";
import { Action, ActionName } from "./actions";

export class ListEnvironmentsAction implements Action {
  readonly name = ActionName.LIST_ENVS;
  readonly deploymentProject: string;

  constructor(command: string) {
    const listEnvsCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option(
        "-p, --project <project>",
        "deployment project name, e.g. customers-v1"
      );
    listEnvsCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listEnvsCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listEnvsCommand.parse(commandInput);
    const options = listEnvsCommand.opts();
    if (CommandParser.isEmpty(options.project)) {
      throw {
        message: listEnvsCommand.helpInformation(),
      };
    }
    this.deploymentProject = options.project!;
  }
}
