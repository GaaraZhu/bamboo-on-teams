import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";

export class DescBuildAction implements Action {
  readonly name = ActionName.DESC_BUILD;
  key: string;

  constructor(command: string) {
    const lastBuildCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .requiredOption(
        "-k, --key <key>",
        "build key, e.g. API-CCV28-1",
        emptyCheck
      );
    lastBuildCommand.exitOverride((_: CommanderError) => {
      throw {
        message: lastBuildCommand.helpInformation(),
      };
    }); //to avoid process.exit
    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    lastBuildCommand.parse(commandInput);
    this.key = lastBuildCommand.opts().key;
  }
}
