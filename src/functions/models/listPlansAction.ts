import { Command, CommanderError } from "commander";
import { Action, ActionName } from "./actions";

export class ListPlansAction implements Action {
  readonly name = ActionName.LIST_PLANS;
  readonly project;

  constructor() {
    const listPlansCommand = new Command().name(this.name);
    listPlansCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listPlansCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", "."];
    listPlansCommand.parse(commandInput);
    this.project = process.env.BAMBOO_PROJECT_ID!;
  }
}
