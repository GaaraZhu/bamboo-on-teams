import { Command, CommanderError } from "commander";
import { Action, ActionName } from "./actions";
import { Response } from "lambda-api";
import { executeListPlansCommand } from "../services/executors/listPlansExecutor";

export class ListPlansAction implements Action {
  readonly actionName = ActionName.LIST_PLANS;
  readonly project;

  constructor() {
    const listPlansCommand = new Command()
      .name(this.actionName)
      .description("List bamboo plans.");
    listPlansCommand.exitOverride((_: CommanderError) => {
      throw {
        message: listPlansCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", "."];
    listPlansCommand.parse(commandInput);
    this.project = process.env.BAMBOO_PROJECT_ID!;
  }

  async process(response: Response): Promise<void> {
    return await executeListPlansCommand(this, response);
  }
}
