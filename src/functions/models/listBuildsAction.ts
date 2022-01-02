import { Command, CommanderError } from "commander";
import { isEmpty } from "../utils";
import { Action, ActionName } from "./actions";

export class ListBuildsAction implements Action {
  readonly name = ActionName.LIST_BUILDS;
  readonly planName: string;
  readonly branchName: string;

  constructor(command: string) {
    const listBuildsCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option("-s, --service <service>", "service name, e.g. customers-v1")
      .option(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. release-1.0.0"
      );
    listBuildsCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listBuildsCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    listBuildsCommand.parse(commandInput);
    const options = listBuildsCommand.opts();
    if (isEmpty(options.service) || isEmpty(options.branch)) {
      throw {
        message: listBuildsCommand.helpInformation(),
      };
    }

    this.planName = options.service;
    this.branchName = options.branch;
  }
}
