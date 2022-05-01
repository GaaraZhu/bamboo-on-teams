import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName } from "./actions";
import { executeCreateBranchCommand } from "../services/executors/createPlanBranchExecutor";
import { TeamsUser } from "./teams";

export class CreateBranchAction implements Action {
  readonly actionName = ActionName.CREATE_BRANCH;
  readonly triggeredBy: TeamsUser;
  readonly service: string;
  readonly vcsBranch: string;

  constructor(command: string, triggeredBy: TeamsUser) {
    const createBranchCommand = new Command()
      .name(this.actionName)
      .description("Create branch for a plan.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      )
      .requiredOption(
        "-b, --vcs-branch <vcsBranch>",
        "vcsBranch name, e.g. master",
        trim
      );
    createBranchCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: createBranchCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    createBranchCommand.parse(commandInput);
    this.service = createBranchCommand.opts().service!;
    this.vcsBranch = createBranchCommand.opts().vcsBranch!;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeCreateBranchCommand(this);
  }
}
