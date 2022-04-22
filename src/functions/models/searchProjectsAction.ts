import { Command, CommanderError } from "commander";
import { Action, ActionName } from "./actions";
import { executeSearchProjectsCommand } from "../services/executors/searchProjectsExecutor";
import { trim } from "../utils";
import { TeamsUser } from "./teams";

export class SearchProjectsAction implements Action {
  readonly actionName = ActionName.SEARCH_PROJECTS;
  readonly deploymentProject: string;
  readonly triggeredBy: TeamsUser;

  constructor(command: string, triggeredBy: TeamsUser) {
    const searchProjectCommand = new Command()
      .name(this.actionName)
      .description("Search deployment projects.")
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
    return await executeSearchProjectsCommand(this);
  }
}
