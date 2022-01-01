import { CommandParser } from "../services/commandParser";
import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";

export class DeployAction implements Action {
  readonly name = ActionName.DEPLOY;
  env: string;
  releaseName: string;
  deploymentProject: string;

  constructor(command: string) {
    const buildCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option(
        "-p, --project <project>",
        "deployment project name, e.g. customers-v1"
      )
      .option("-e, --env <env>", "env name, e.g. dev")
      .option("-r, --release <release>", "release name, e.g. v1.0.0");
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
    if (
      CommandParser.isEmpty(options.project) ||
      CommandParser.isEmpty(options.env) ||
      CommandParser.isEmpty(options.release)
    ) {
      throw {
        message: buildCommand.helpInformation(),
      };
    }

    this.deploymentProject = options.project;
    this.env = options.env;
    this.releaseName = options.release;
  }
}
