import { Command, CommanderError } from "commander";
import { Action, ActionName } from "./actions";

export class ListProjectsAction implements Action {
  readonly name = ActionName.LIST_DEPLOY_PROJECTS;

  constructor() {
    const listProjectsCommand = new Command().name(this.name);
    listProjectsCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listProjectsCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", "."];
    listProjectsCommand.parse(commandInput);
  }
}
