import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Action, ActionName } from "./actions";
import { executeSearchPlansCommand } from "../services/executors/searchPlansExecutor";

export class SearchPlansAction implements Action {
  readonly actionName = ActionName.SEARCH_PLANS;
  readonly triggeredBy: string;
  readonly planName: string;

  constructor(command: string, triggeredBy: string) {
    const searchPlanCommand = new Command()
      .name(this.actionName)
      .description("Search build plans.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "wildcard service name, e.g. customers",
        trim
      );
    searchPlanCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: searchPlanCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    searchPlanCommand.parse(commandInput);
    this.planName = searchPlanCommand.opts().service!;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeSearchPlansCommand(this);
  }
}