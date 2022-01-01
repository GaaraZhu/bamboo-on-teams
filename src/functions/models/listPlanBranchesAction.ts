import { Command, CommanderError } from "commander";
import { CommandParser } from "../services/commandParser";
import { Action, ActionName } from "./actions";

export class ListPlanBranchesAction implements Action {
  readonly name = ActionName.LIST_PLAN_BRANCHES;
  readonly planName: string;

  constructor(command: string) {
    const listBranchesCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option("-s, --service <service>", "service name, e.g. customers-v1");
    listBranchesCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listBranchesCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listBranchesCommand.parse(commandInput);
    const options = listBranchesCommand.opts();
    if (CommandParser.isEmpty(options.service)) {
      throw {
        message: listBranchesCommand.helpInformation(),
      };
    }
    this.planName = options.service!;
  }
}
