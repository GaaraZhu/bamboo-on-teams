import { Command, CommanderError } from "commander";
import { Action, ActionName } from "./actions";
import { Response } from "lambda-api";
import { executeHelpCommand } from "../services/executors/helpExecutor";

export class HelpAction implements Action {
  readonly actionName = ActionName.HELP;
  readonly project;

  constructor() {
    const helpCommand = new Command()
      .name(this.actionName)
      .description("List bamboo plans.");
    helpCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: helpCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", "."];
    helpCommand.parse(commandInput);
    this.project = process.env.BAMBOO_PROJECT_ID!;
  }

  async process(response: Response): Promise<void> {
    return await executeHelpCommand(this, response);
  }
}
