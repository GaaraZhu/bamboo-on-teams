import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { Response } from "lambda-api";
import { executeDeployReleaseCommand } from "../services/executors/deployReleaseExecutor";

export class DeployReleaseAction implements Action {
  readonly actionName = ActionName.DEPLOY_RELEASE;
  env: string;
  releaseName: string;
  deploymentProject: string;

  constructor(command: string) {
    const buildCommand = new Command()
      .name(this.actionName)
      .description("Deploy a release to a service environment.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      )
      .requiredOption("-e, --env <env>", "env name, e.g. dev", trim)
      .requiredOption(
        "-r, --release <release>",
        "release name, e.g. v1.0.0",
        trim
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
    this.env = options.env;
    this.releaseName = options.release;
  }

  async process(response: Response): Promise<void> {
    return await executeDeployReleaseCommand(this, response);
  }
}
