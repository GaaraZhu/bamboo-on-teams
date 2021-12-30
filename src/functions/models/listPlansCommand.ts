import { Command, CommanderError } from "commander";
import { Action, ActionNames } from "./actions";

export class ListPlansAction implements Action {
  readonly action = ActionNames.LIST_PLANS;
  readonly project;

  constructor() {
    const listPlansCommand = new Command().name("list-plans");
    listPlansCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listPlansCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", "."];
    listPlansCommand.parse(commandInput);
    this.project = process.env.BAMBOO_PROJECT;
  }
}
