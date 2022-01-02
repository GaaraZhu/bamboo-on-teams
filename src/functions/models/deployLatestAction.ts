import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { isEmpty } from "../utils";

export class DeployLatestAction implements Action {
  readonly name = ActionName.DEPLOY_LATEST;
  service: string;
  branch: string;
  env: string;

  constructor(command: string) {
    const deployLatestCommand = new Command()
      .name(this.name)
      .usage("[options]")
      .option("-s, --service <service>", "service name, e.g. customers-v1")
      .option("-b, --branch <branch>", "bamboo branch name, e.g. master")
      .option("-e, --env <env>", "env name, e.g. dev");
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
    if (
      isEmpty(options.service) ||
      isEmpty(options.branch) ||
      isEmpty(options.env)
    ) {
      throw {
        message: deployLatestCommand.helpInformation(),
      };
    }

    this.service = options.service;
    this.branch = options.branch;
    this.env = options.env;
  }
}
