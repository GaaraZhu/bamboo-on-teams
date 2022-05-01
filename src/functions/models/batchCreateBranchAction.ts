import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { TeamsUser } from "./teams";
import { executeBatchCreateBranchCommand } from "../services/executors/batchCreateBranchExecutor";

export class BatchCreateBranchAction implements Action {
  readonly actionName = ActionName.BATCH_CREATE_BRANCH;
  readonly triggeredBy: TeamsUser;
  services: string[];
  vcsBranch: string;

  constructor(command: string, triggeredBy: TeamsUser) {
    const batchCreateBranchAction = new Command()
      .name(this.actionName)
      .description("Batch create branch plan(s).")
      .usage("[options]")
      .requiredOption(
        "-s, --services <services>",
        "service names separated by comma without spaces, e.g. customers-v1,accounts-v1",
        trim
      )
      .requiredOption(
        "-b, --vcs-branch <vcsBranch>",
        "vcsBranch name, e.g. master",
        trim
      );
    batchCreateBranchAction.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: batchCreateBranchAction.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    batchCreateBranchAction.parse(commandInput);
    this.services = batchCreateBranchAction.opts().services.split(",");
    this.vcsBranch = batchCreateBranchAction.opts().vcsBranch!;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeBatchCreateBranchCommand(this);
  }
}
