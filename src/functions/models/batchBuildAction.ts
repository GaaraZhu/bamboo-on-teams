import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { executeBatchBuildCommand } from "../services/executors/batchBuildExecutor";
import { TeamsUser } from "./teams";

export class BatchBuildAction implements Action {
  readonly actionName = ActionName.BATCH_BUILD;
  readonly triggeredBy: TeamsUser;
  services: string[];
  branch: string;

  constructor(command: string, triggeredBy: TeamsUser) {
    const batchBuildCommand = new Command()
      .name(this.actionName)
      .description("Batch build services.")
      .usage("[options]")
      .requiredOption(
        "-s, --services <services>",
        "service names separated by comma without spaces, e.g. customers-v1,accounts-v1",
        trim
      )
      .requiredOption(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. master",
        trim
      );
    batchBuildCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: batchBuildCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    batchBuildCommand.parse(commandInput);
    this.services = batchBuildCommand.opts().services.split(",");
    this.branch = batchBuildCommand.opts().branch;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeBatchBuildCommand(this);
  }
}
