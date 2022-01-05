import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";
import { Response } from "lambda-api";
import { executeCreateReleaseCommand } from "../services/executors/createReleaseExecutor";

export class CreateReleaseAction implements Action {
  readonly actionName = ActionName.CREATE_RELEASE;
  deploymentProject: string;
  buildKey: string;
  releaseName: string;

  constructor(command: string) {
    const buildCommand = new Command()
      .name(this.actionName)
      .usage("[options]")
      .option(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        emptyCheck
      )
      .option("-b, --build <build>", "build key, e.g. API-CCV28-1", emptyCheck)
      .option(
        "-r, --release <release>",
        "release name, e.g. v1.0.0",
        emptyCheck
      );
    buildCommand.exitOverride((_: CommanderError) => {
      throw {
        message: buildCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    buildCommand.parse(commandInput);
    const options = buildCommand.opts();
    this.deploymentProject = options.service;
    this.buildKey = options.build;
    this.releaseName = options.release;
  }

  async process(response: Response): Promise<void> {
    return await executeCreateReleaseCommand(this, response);
  }
}
