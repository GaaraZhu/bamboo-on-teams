import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName } from "./actions";
import { Response } from "lambda-api";
import { executeListBranchesCommand } from "../services/executors/listPlanBranchesExecutor";

export class ListBranchesAction implements Action {
  readonly actionName = ActionName.LIST_BRANCHES;
  readonly planName: string;

  constructor(command: string) {
    const listBranchesCommand = new Command()
      .name(this.actionName)
      .description("List branch plans for a service.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      );
    listBranchesCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listBranchesCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listBranchesCommand.parse(commandInput);
    this.planName = listBranchesCommand.opts().service!;
  }

  async process(response: Response): Promise<void> {
    return await executeListBranchesCommand(this, response);
  }
}
