import { Command, CommanderError } from "commander";
import { CommandParser } from "../services/commandParser";
import { Action, ActionName } from "./actions";

export class ListPlanBranchBuildsAction implements Action {
  readonly name = ActionName.LIST_PLAN_BRANCH_BUILDS;
  readonly planBranchName: string;

  constructor(command: string) {
    const listBuildsCommand = new Command()
      .name("list-builds")
      .usage("[options]")
      .option(
        "-bn, --branchName <branchName>",
        "plan branch name, e.g. release-1.0.0"
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
    if (CommandParser.isEmpty(options.branchName)) {
      throw {
        message: listBuildsCommand.helpInformation(),
      };
    }

    this.planBranchName = options.branchName;
  }
}
