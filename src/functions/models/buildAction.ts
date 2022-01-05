import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";

export class BuildAction implements Action {
  readonly name = ActionName.BUILD;
  service: string;
  branch: string;

  constructor(command: string) {
    const buildCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        emptyCheck
      )
      .option(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. master",
        emptyCheck
      );
    buildCommand.exitOverride((_: CommanderError) => {
      throw {
        message: buildCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    buildCommand.parse(commandInput);
    this.service = buildCommand.opts().service;
    this.branch = buildCommand.opts().branch;
  }
}
