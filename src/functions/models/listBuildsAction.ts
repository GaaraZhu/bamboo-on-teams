import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName, JobType } from "./actions";
import { Response } from "lambda-api";
import { executeListBuildsCommand } from "../services/executors/listBuildsExecutor";

export class ListBuildsAction implements Action {
  readonly actionName = ActionName.LIST_BUILDS;
  readonly type = JobType.BUILD;
  readonly triggeredBy: string;
  readonly planName: string;
  readonly branchName: string;

  constructor(command: string, triggeredBy: string) {
    const listBuildsCommand = new Command()
      .name(this.actionName)
      .description("List builds for a service in a branch plan.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      )
      .requiredOption(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. release-1.0.0"
      );
    listBuildsCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: listBuildsCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    listBuildsCommand.parse(commandInput);
    const options = listBuildsCommand.opts();
    this.planName = options.service;
    this.branchName = options.branch;
    this.triggeredBy = triggeredBy;
  }

  async process(response: Response): Promise<void> {
    return await executeListBuildsCommand(this, response);
  }
}
