import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";
import { Action, ActionName } from "./actions";

export class ListBranchesAction implements Action {
  readonly name = ActionName.LIST_BRANCHES;
  readonly planName: string;

  constructor(command: string) {
    const listBranchesCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        emptyCheck
      );
    listBranchesCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listBranchesCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listBranchesCommand.parse(commandInput);
    this.planName = listBranchesCommand.opts().service!;
  }
}
