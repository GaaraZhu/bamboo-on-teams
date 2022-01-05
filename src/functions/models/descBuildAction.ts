import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";
import { Response } from "lambda-api";
import { executeDescBuildCommand } from "../services/executors/descBuildExecutor";

export class DescBuildAction implements Action {
  readonly actionName = ActionName.DESC_BUILD;
  key: string;

  constructor(command: string) {
    const lastBuildCommand = new Command()
      .name(this.actionName)
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

  async process(response: Response): Promise<void> {
    return await executeDescBuildCommand(this, response);
  }
}
