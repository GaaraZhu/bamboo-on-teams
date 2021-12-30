import { Command, CommanderError } from "commander";
import { CommandParser } from "../services/commandParser";
import { Action, ActionName } from "./actions";

export class ListPlanBranchesAction implements Action {
  readonly name = ActionName.LIST_PLAN_BRANCHES;
  readonly planKey: string;

  constructor(command: string) {
    const listBranchesCommand = new Command()
      .name("list-branches")
      .usage("[options]")
      .option("-pk, --planKey <planKey>", "the plan identifier");
    listBranchesCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listBranchesCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listBranchesCommand.parse(commandInput);
    const options = listBranchesCommand.opts();
    if (CommandParser.isEmpty(options.planKey)) {
      throw {
        message: listBranchesCommand.helpInformation(),
      };
    }
    this.planKey = options.planKey!;
  }
}
