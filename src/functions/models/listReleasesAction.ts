import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName } from "./actions";
import { executeListReleasesCommand } from "../services/executors/listReleasesExecutor";
import { TeamsUser } from "./teams";

export class ListReleasesAction implements Action {
  readonly actionName = ActionName.LIST_RELEASES;
  readonly triggeredBy: TeamsUser;
  readonly deploymentProject: string;
  readonly planBranch: string;

  constructor(command: string, triggeredBy: TeamsUser) {
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
        "bamboo branch name, e.g. master",
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

  async process(): Promise<any> {
    return await executeListReleasesCommand(this);
  }
}
