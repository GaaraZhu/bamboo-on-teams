import { CommandParser } from "../services/commandParser";
import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";

export class DescBuildAction implements Action {
  readonly name = ActionName.DESC_BUILD;
  key: string;

  constructor(command: string) {
    const lastBuildCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option("-k, --key <key>", "build key, e.g. API-CCV28-1");
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
    if (CommandParser.isEmpty(options.key)) {
      throw {
        message: lastBuildCommand.helpInformation(),
      };
    }
    this.key = options.key;
  }
}
