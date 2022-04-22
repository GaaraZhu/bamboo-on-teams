import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { executeDeployBuildCommand } from "../services/executors/deployBuildExecutor";
import { TeamsUser } from "./teams";

export class DeployBuildAction implements Action {
  readonly actionName = ActionName.DEPLOY_BUILD;
  readonly triggeredBy: TeamsUser;
  service: string;
  env: string;
  buildKey: string;

  constructor(command: string, triggeredBy: TeamsUser) {
    const deployBuildCommand = new Command()
      .name(this.actionName)
      .description("Deploy a service build to an environment.")
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      )
      .requiredOption("-e, --env <env>", "env name, e.g. dev", trim)
      .requiredOption(
        "-b, --build-key <buildKey>",
        "bamboo build key, e.g. API-CPV1-30",
        trim
      );
    deployBuildCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
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
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeDeployBuildCommand(this);
  }
}
