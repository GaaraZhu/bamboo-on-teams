import { Command, CommanderError } from "commander";
import { isEmpty } from "../utils";
import { Action, ActionName } from "./actions";

export class ListEnvironmentsAction implements Action {
  readonly name = ActionName.LIST_ENVS;
  readonly deploymentProject: string;

  constructor(command: string) {
    const listEnvsCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option("-s, --service <service>", "service name, e.g. customers-v1");
    listEnvsCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listEnvsCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listEnvsCommand.parse(commandInput);
    const options = listEnvsCommand.opts();
    if (isEmpty(options.service)) {
      throw {
        message: listEnvsCommand.helpInformation(),
      };
    }
    this.deploymentProject = options.service!;
  }
}
