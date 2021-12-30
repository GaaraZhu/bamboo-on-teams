import { Command, CommanderError } from "commander";
import { CommandService } from "../services/commandService";
import { Action, ActionNames } from "./actions";

export class ListPlanBranchesAction implements Action {
  readonly action = ActionNames.LIST_PLAN_BRANCHES;
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
    if (CommandService.isEmpty(options.planKey)) {
      throw {
        message: listBranchesCommand.helpInformation(),
      };
    }
    this.planKey = options.planKey!;
  }
}
