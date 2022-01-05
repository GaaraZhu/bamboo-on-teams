import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";

export class DeployLatestBuildAction implements Action {
  readonly name = ActionName.DEPLOY_LATEST_BUILD;
  service: string;
  branch: string;
  env: string;

  constructor(command: string) {
    const deployLatestCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        emptyCheck
      )
      .option(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. master",
        emptyCheck
      )
      .option("-e, --env <env>", "env name, e.g. dev", emptyCheck);
    deployLatestCommand.exitOverride((_: CommanderError) => {
      throw {
        message: deployLatestCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    deployLatestCommand.parse(commandInput);
    const options = deployLatestCommand.opts();
    this.service = options.service;
    this.branch = options.branch;
    this.env = options.env;
  }
}
