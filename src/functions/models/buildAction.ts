import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { isEmpty } from "../utils";

export class BuildAction implements Action {
  readonly name = ActionName.BUILD;
  service: string;
  branch: string;

  constructor(command: string) {
    const buildCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option("-s, --service <service>", "service name, e.g. customers-v1")
      .option("-b, --branch <branch>", "bamboo branch name, e.g. master");
    buildCommand.exitOverride((_: CommanderError) => {
      throw {
        message: buildCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    buildCommand.parse(commandInput);
    const options = buildCommand.opts();
    if (isEmpty(options.service) || isEmpty(options.branch)) {
      throw {
        message: buildCommand.helpInformation(),
      };
    }

    this.service = options.service;
    this.branch = options.branch;
  }
}
