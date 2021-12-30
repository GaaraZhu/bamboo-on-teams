import { Command, CommanderError } from "commander";
import { CommandParser } from "../services/commandParser";
import { Action, ActionName } from "./actions";

export class ListPlanBranchBuildsAction implements Action {
  readonly action = ActionName.LIST_PLAN_BRANCH_BUILDS;
  readonly planBranchKey: string;

  constructor(command: string) {
    const listBuildsCommand = new Command()
      .name("list-builds")
      .usage("[options]")
      .option("-bk, --branchKey <branchKey>", "branch job identifier");
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
    if (CommandParser.isEmpty(options.branchKey)) {
      throw {
        message: listBuildsCommand.helpInformation(),
      };
    }

    this.planBranchKey = options.branchKey;
  }
}
