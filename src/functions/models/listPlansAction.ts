import { Command, CommanderError } from "commander";
import { Action, ActionName } from "./actions";
import { executeListPlansCommand } from "../services/executors/listPlansExecutor";

export class ListPlansAction implements Action {
  readonly actionName = ActionName.LIST_PLANS;
  readonly triggeredBy: string;

  constructor(triggeredBy: string) {
    const listPlansCommand = new Command()
      .name(this.actionName)
      .description("List bamboo plans.");
    listPlansCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: listPlansCommand.helpInformation(),
      };
    }); //to avoid process.exit

    const commandInput = [".", "."];
    listPlansCommand.parse(commandInput);
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeListPlansCommand(this);
  }
}
