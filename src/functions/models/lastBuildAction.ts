import { CommandParser } from "../services/commandParser";
import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";

export class LastBuildAction implements Action {
  readonly name = ActionName.LAST_PLAN_BRANCH_BUILD;
  service: string;
  branch: string;

  constructor(command: string) {
    const lastBuildCommand = new Command()
      .name("last-build")
      .usage("[options]")
      .option("-s, --service <service>", "service name, e.g. customers-v1")
      .option("-b, --branch <branch>", "bamboo branch name, e.g. master");
    lastBuildCommand.exitOverride((_: CommanderError) => {
      throw {
        message: lastBuildCommand.helpInformation(),
      };
    }); //to avoid process.exit
    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    lastBuildCommand.parse(commandInput);
    const options = lastBuildCommand.opts();
    if (
      CommandParser.isEmpty(options.service) ||
      CommandParser.isEmpty(options.branch)
    ) {
      throw {
        message: lastBuildCommand.helpInformation(),
      };
    }
    this.service = options.service;
    this.branch = options.branch;
  }
}
