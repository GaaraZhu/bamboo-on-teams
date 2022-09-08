import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { executeBatchDeployCommand } from "../services/executors/batchDeployExecutor";
import { TeamsUser } from "./teams";

export class BatchDeployAction implements Action {
  readonly actionName = ActionName.BATCH_DEPLOY;
  readonly triggeredBy: TeamsUser;
  services: string[];
  branch: string;
  env: string;

  constructor(command: string, triggeredBy: TeamsUser) {
    const batchDeployCommand = new Command()
      .name(this.actionName)
      .description("Batch deploy services.")
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
      )
      .requiredOption("-e, --env <env>", "env name, e.g. dev", trim);
    batchDeployCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: batchDeployCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    batchDeployCommand.parse(commandInput);
    this.services = batchDeployCommand.opts().services.split(",");
    this.branch = batchDeployCommand.opts().branch;
    this.env = batchDeployCommand.opts().env;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeBatchDeployCommand(this);
  }
}
