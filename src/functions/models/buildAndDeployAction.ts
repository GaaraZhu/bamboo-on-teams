import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { TeamsUser } from "./teams";
import { executeBuildAndDeployCommand } from "../services/executors/buildAndDeployExecutor";

export class BuildAndDeployAction implements Action {
  readonly actionName = ActionName.BUILD_AND_DEPLOY;
  readonly triggeredBy: TeamsUser;
  service: string;
  branch: string;
  env: string;

  constructor(command: string, triggeredBy: TeamsUser) {
    const buildAndDeployCommand = new Command()
      .name(this.actionName)
      .description(
        "Build a service from a Bamboo branch and deploy it to an environment."
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
    buildAndDeployCommand.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: buildAndDeployCommand.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    buildAndDeployCommand.parse(commandInput);
    this.service = buildAndDeployCommand.opts().service;
    this.branch = buildAndDeployCommand.opts().branch;
    this.env = buildAndDeployCommand.opts().env;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeBuildAndDeployCommand(this);
  }
}
