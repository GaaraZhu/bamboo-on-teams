import { Action, ActionName, JobType } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Response } from "lambda-api";
import { executeBuildCommand } from "../services/executors/buildExecutor";

export class BuildAction implements Action {
  readonly actionName = ActionName.BUILD;
  readonly type = JobType.BUILD;
  readonly triggeredBy: string;
  service: string;
  branch: string;

  constructor(command: string, triggeredBy: string) {
    const buildCommand = new Command()
      .name(this.actionName)
      .description("Trigger a branch build for a service.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      )
      .requiredOption(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. master",
        trim
      );
    buildCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: buildCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    buildCommand.parse(commandInput);
    this.service = buildCommand.opts().service;
    this.branch = buildCommand.opts().branch;
    this.triggeredBy = triggeredBy;
  }

  async process(response: Response): Promise<void> {
    return await executeBuildCommand(this, response);
  }
}
