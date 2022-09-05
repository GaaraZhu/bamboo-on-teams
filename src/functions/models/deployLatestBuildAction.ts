import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { executeDeployLatestCommand } from "../services/executors/deployLatestBuildExecutor";
import { TeamsUser } from "./teams";

export class DeployLatestBuildAction implements Action {
  readonly actionName = ActionName.DEPLOY;
  readonly triggeredBy: TeamsUser;
  service: string;
  branch: string;
  env: string;

  constructor(command: string, triggeredBy: TeamsUser) {
    const deployLatestCommand = new Command()
      .name(this.actionName)
      .description(
        "Deploy the service with the latest build in a branch to an environment."
      )
      .usage("[options]")
      .requiredOption(
        "-s, --service <service>",
        "service name, e.g. customers-v1",
        trim
      )
      .requiredOption(
        "-b, --branch <branch>",
        "bamboo branch name, e.g. master",
        trim
      )
      .requiredOption("-e, --env <env>", "env name, e.g. dev", trim);
    deployLatestCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
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
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeDeployLatestCommand(this);
  }
}
