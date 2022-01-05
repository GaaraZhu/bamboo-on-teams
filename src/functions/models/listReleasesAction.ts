import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";
import { Action, ActionName } from "./actions";
import { Response } from "lambda-api";
import { executeListReleasesCommand } from "../services/executors/listReleasesExecutor";

export class ListReleasesAction implements Action {
  readonly actionName = ActionName.LIST_RELEASES;
  readonly deploymentProject: string;
  readonly planBranch: string;

  constructor(command: string) {
    const listBranchesCommand = new Command()
      .name(this.actionName)
      .usage("[options]")
      .option(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        emptyCheck
      )
      .option(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. release-1.0.0",
        emptyCheck
      );
    listBranchesCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listBranchesCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listBranchesCommand.parse(commandInput);
    const options = listBranchesCommand.opts();

    this.deploymentProject = options.service!;
    this.planBranch = options.branch!;
  }

  async process(response: Response): Promise<void> {
    return await executeListReleasesCommand(this, response);
  }
}
