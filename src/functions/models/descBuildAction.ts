import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Response } from "lambda-api";
import { executeDescBuildCommand } from "../services/executors/descBuildExecutor";

export class DescBuildAction implements Action {
  readonly actionName = ActionName.DESC_BUILD;
  build: string;

  constructor(command: string) {
    const lastBuildCommand = new Command()
      .name(this.actionName)
      .description("Describe a build.")
      .usage("[options]")
      .requiredOption(
        "-b, --build <build>",
        "build key, e.g. API-CCV28-1",
        trim
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
    this.build = lastBuildCommand.opts().build;
  }

  async process(response: Response): Promise<void> {
    return await executeDescBuildCommand(this, response);
  }
}
