import { Command, CommanderError } from "commander";
import { Action, ActionName } from "./actions";
import { executeSearchProjectCommand } from "../services/executors/searchProjectExecutor";
import { trim } from "../utils";

export class SearchProjectAction implements Action {
  readonly actionName = ActionName.SEARCH_PROJECT;
  readonly deploymentProject: string;
  readonly triggeredBy: string;

  constructor(command: string, triggeredBy: string) {
    const searchProjectCommand = new Command()
      .name(this.actionName)
      .description("Search deployment project.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "wildcard project name, e.g. customers",
        trim
      );
    searchProjectCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: searchProjectCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", ...command.split(" ")];
    searchProjectCommand.parse(commandInput);
    const options = searchProjectCommand.opts();
    this.deploymentProject = options.service!;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeSearchProjectCommand(this);
  }
}
