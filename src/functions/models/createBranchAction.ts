import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName } from "./actions";
import { Response } from "lambda-api";
import { executeCreateBranchCommand } from "../services/executors/createPlanBranchExecutor";

export class createBranchAction implements Action {
  readonly actionName = ActionName.CREATE_BRANCH;
  readonly planName: string;
  readonly vscBranch: string;

  constructor(command: string) {
    const createBranchCommand = new Command()
      .name(this.actionName)
      .description("Create branch for a plan")
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
        message: createBranchCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    createBranchCommand.parse(commandInput);
    this.planName = createBranchCommand.opts().service!;
    this.vscBranch = createBranchCommand.opts().branch!;
  }

  async process(response: Response): Promise<void> {
    return await executeCreateBranchCommand(this, response);
  }
}
