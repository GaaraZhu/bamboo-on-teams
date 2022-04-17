import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { executeBatchBuildCommand } from "../services/executors/batchBuildExecutor";
import { executeReleaseCommand } from "../services/executors/releaseExecutor";

export class ReleaseAction implements Action {
  readonly actionName = ActionName.RELEASE;
  readonly triggeredBy: string;
  services: string[][];
  branch: string;
  env: string;

  constructor(command: string, triggeredBy: string) {
    const releaseAction = new Command()
      .name(this.actionName)
      .description(
        "Deploy services in sequential batches for releases with dependencies."
      )
      .usage("[options]")
      .requiredOption(
        "-s, --services <services>",
        "service names separated by comma without spaces and use semi-collon for different batches, e.g. customers-v1,accounts-v1;transactions-v1",
        trim
      )
      .requiredOption(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. master",
        trim
      )
      .requiredOption("-e, --env <env>", "env name, e.g. dev", trim);
    releaseAction.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: releaseAction.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    releaseAction.parse(commandInput);
    this.services = releaseAction
      .opts()
      .services.split(";")
      ?.map((s: string) => s.split(","));
    this.branch = releaseAction.opts().branch;
    this.env = releaseAction.opts().env;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeReleaseCommand(this);
  }
}
