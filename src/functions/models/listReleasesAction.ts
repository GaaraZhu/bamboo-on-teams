import { Command, CommanderError } from "commander";
import { CommandParser } from "../services/commandParser";
import { Action, ActionName } from "./actions";

export class ListReleasesAction implements Action {
  readonly name = ActionName.LIST_RELEASES;
  readonly deploymentProject: string;
  readonly planBranch: string;

  constructor(command: string) {
    const listBranchesCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option("-s, --service <service>", "service name, e.g. customers-v1")
      .option(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. release-1.0.0"
      );
    listBranchesCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listBranchesCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listBranchesCommand.parse(commandInput);
    const options = listBranchesCommand.opts();
    if (
      CommandParser.isEmpty(options.service) ||
      CommandParser.isEmpty(options.branch)
    ) {
      throw {
        message: listBranchesCommand.helpInformation(),
      };
    }
    this.deploymentProject = options.service!;
    this.planBranch = options.branch!;
  }
}
