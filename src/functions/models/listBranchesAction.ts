import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName } from "./actions";
import { executeListBranchesCommand } from "../services/executors/listPlanBranchesExecutor";
import { TeamsUser } from "./teams";

export class ListBranchesAction implements Action {
  readonly actionName = ActionName.LIST_BRANCHES;
  readonly triggeredBy: TeamsUser;
  readonly planName: string;

  constructor(command: string, triggeredBy: TeamsUser) {
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
        status: 400,
        message: listBranchesCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    listBranchesCommand.parse(commandInput);
    this.planName = listBranchesCommand.opts().service!;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeListBranchesCommand(this);
  }
}
