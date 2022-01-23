import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName, JobType } from "./actions";
import { Response } from "lambda-api";
import { executeCreateBranchCommand } from "../services/executors/createPlanBranchExecutor";

export class CreateBranchAction implements Action {
  readonly actionName = ActionName.CREATE_BRANCH;
  readonly type = JobType.BUILD;
  readonly triggeredBy: string;
  readonly planName: string;
  readonly vscBranch: string;

  constructor(command: string, triggeredBy: string) {
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
        "-b, --branch <branch>",
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
    this.planName = createBranchCommand.opts().service!;
    this.vscBranch = createBranchCommand.opts().branch!;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeCreateBranchCommand(this);
  }
}
