import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName, JobType } from "./actions";
import { Response } from "lambda-api";
import { executeListReleasesCommand } from "../services/executors/listReleasesExecutor";

export class ListReleasesAction implements Action {
  readonly actionName = ActionName.LIST_RELEASES;
  readonly type = JobType.DEPLOYMENT;
  readonly triggeredBy: string;
  readonly deploymentProject: string;
  readonly planBranch: string;

  constructor(command: string, triggeredBy: string) {
    const listBranchesCommand = new Command()
      .name(this.actionName)
      .description("List the releases created from a service branch.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      )
      .requiredOption(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. release-1.0.0",
        trim
      );
    listBranchesCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: listBranchesCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listBranchesCommand.parse(commandInput);
    const options = listBranchesCommand.opts();

    this.deploymentProject = options.service!;
    this.planBranch = options.branch!;
    this.triggeredBy = triggeredBy;
  }

  async process(response: Response): Promise<void> {
    return await executeListReleasesCommand(this, response);
  }
}
