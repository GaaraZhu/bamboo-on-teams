import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { emptyCheck } from "../utils";
import { Response } from "lambda-api";
import { executeDeployBuildCommand } from "../services/executors/deployBuildExecutor";

export class DeployBuildAction implements Action {
  readonly actionName = ActionName.DEPLOY_BUILD;
  service: string;
  env: string;
  buildKey: string;

  constructor(command: string) {
    const deployBuildCommand = new Command()
      .name(this.actionName)
      .description("Deploy a service build to an environment")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        emptyCheck
      )
      .requiredOption("-e, --env <env>", "env name, e.g. dev", emptyCheck)
      .requiredOption(
        "-bk, --build-key <buildKey>",
        "bamboo build key, e.g. API-CPV1-30",
        emptyCheck
      );
    deployBuildCommand.exitOverride((_: CommanderError) => {
      throw {
        message: deployBuildCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    deployBuildCommand.parse(commandInput);
    const options = deployBuildCommand.opts();
    this.service = options.service;
    this.env = options.env;
    this.buildKey = options.buildKey;
  }

  async process(response: Response): Promise<void> {
    return await executeDeployBuildCommand(this, response);
  }
}
