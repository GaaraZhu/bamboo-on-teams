import { Action, ActionName, JobType } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Response } from "lambda-api";
import { executePromoteReleaseCommand } from "../services/executors/promoteReleaseExecutor";

export class PromoteReleaseAction implements Action {
  readonly actionName = ActionName.PROMOTE_RELEASE;
  readonly type = JobType.DEPLOYMENT;
  readonly triggeredBy: string;
  service: string;
  sourceEnv: string;
  targetEnv: string;

  constructor(command: string, triggeredBy: string) {
    const promoteReleaseCommand = new Command()
      .name(this.actionName)
      .usage("[options]")
      .description("promote the release from one environment to another.")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      )
      .requiredOption(
        "-se, --source-env <sourceEnv>",
        "source environment name, e.g. dev",
        trim
      )
      .requiredOption(
        "-te, --target-env <targetEnv>",
        "target environment name, e.g. test",
        trim
      );
    promoteReleaseCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: promoteReleaseCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    promoteReleaseCommand.parse(commandInput);
    const options = promoteReleaseCommand.opts();

    this.service = options.service;
    this.sourceEnv = options.sourceEnv;
    this.targetEnv = options.targetEnv;
    this.triggeredBy = triggeredBy;
  }

  async process(response: Response): Promise<void> {
    return await executePromoteReleaseCommand(this, response);
  }
}
