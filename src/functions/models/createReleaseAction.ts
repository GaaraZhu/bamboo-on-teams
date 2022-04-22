import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { executeCreateReleaseCommand } from "../services/executors/createReleaseExecutor";
import { TeamsUser } from "./teams";

export class CreateReleaseAction implements Action {
  readonly actionName = ActionName.CREATE_RELEASE;
  readonly triggeredBy: TeamsUser;
  deploymentProject: string;
  buildKey: string;
  releaseName: string;

  constructor(command: string, triggeredBy: TeamsUser) {
    const buildCommand = new Command()
      .name(this.actionName)
      .description("Create a release for a service build.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      )
      .requiredOption(
        "-b, --build <build>",
        "build key, e.g. API-CCV28-1",
        trim
      )
      .requiredOption(
        "-r, --release <release>",
        "release name, e.g. v1.0.0",
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
    const options = buildCommand.opts();
    this.deploymentProject = options.service;
    this.buildKey = options.build;
    this.releaseName = options.release;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeCreateReleaseCommand(this);
  }
}
