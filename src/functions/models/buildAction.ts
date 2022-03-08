import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { executeBuildCommand } from "../services/executors/buildExecutor";

export class BuildAction implements Action {
  readonly actionName = ActionName.BUILD;
  readonly triggeredBy: string;
  services: string[];
  branch: string;

  constructor(command: string, triggeredBy: string) {
    const buildCommand = new Command()
      .name(this.actionName)
      .description("Trigger branch build for service(s).")
      .usage("[options]")
      .requiredOption(
        "-s, --services <services>",
        "service names separated by comma without spaces, e.g. customers-v1,accounts-v1",
        trim
      )
      .requiredOption(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. master",
        trim
      );
    buildCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: buildCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    buildCommand.parse(commandInput);
    this.services = buildCommand.opts().services.split(",");
    this.branch = buildCommand.opts().branch;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeBuildCommand(this);
  }
}
