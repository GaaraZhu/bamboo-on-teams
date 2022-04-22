import { Command, CommanderError } from "commander";
import { Action, ActionName } from "./actions";
import { executeHelpCommand } from "../services/executors/helpExecutor";
import { TeamsUser } from "./teams";

export class HelpAction implements Action {
  readonly actionName = ActionName.HELP;
  readonly triggeredBy: TeamsUser;

  constructor(command: string, triggeredBy: TeamsUser) {
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
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeHelpCommand(this);
  }
}
