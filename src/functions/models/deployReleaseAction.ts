import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";

export class DeployReleaseAction implements Action {
  readonly name = ActionName.DEPLOY_RELEASE;
  env: string;
  releaseName: string;
  deploymentProject: string;

  constructor(command: string) {
    const buildCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        emptyCheck
      )
      .option("-e, --env <env>", "env name, e.g. dev", emptyCheck)
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
    this.env = options.env;
    this.releaseName = options.release;
  }
}
