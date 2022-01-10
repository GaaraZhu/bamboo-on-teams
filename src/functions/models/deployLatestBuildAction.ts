import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";
import { Response } from "lambda-api";
import { executeDeployLatestCommand } from "../services/executors/deployLatestBuildExecutor";

export class DeployLatestBuildAction implements Action {
  readonly actionName = ActionName.DEPLOY_LATEST_BUILD;
  service: string;
  branch: string;
  env: string;

  constructor(command: string) {
    const deployLatestCommand = new Command()
      .name(this.actionName)
      .description(
        "Deploy the service with the latest build in a branch to an environment"
      )
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        emptyCheck
      )
      .requiredOption(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. master",
        emptyCheck
      )
      .requiredOption("-e, --env <env>", "env name, e.g. dev", emptyCheck);
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

  async process(response: Response): Promise<void> {
    return await executeDeployLatestCommand(this, response);
  }
}
