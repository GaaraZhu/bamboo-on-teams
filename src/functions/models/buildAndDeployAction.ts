import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { TeamsUser } from "./teams";
import { executeBuildAndDeployCommand } from "../services/executors/buildAndDeployExecutor";

export class BuildAndDeployAction implements Action {
  readonly actionName = ActionName.BUILD_AND_DEPLOY;
  readonly triggeredBy: TeamsUser;
  services: string[];
  branch: string;
  env: string;

  constructor(command: string, triggeredBy: TeamsUser) {
    const buildAndDeployCommand = new Command()
      .name(this.actionName)
      .description(
        "Build service(s) from a vcs branch (will create Bamboo branch plan automatically if not exist) and deploy to an environment."
      )
      .usage("[options]")
      .requiredOption(
        "-s, --services <services>",
        "service names separated by comma without spaces, e.g. customers-v1,accounts-v1",
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
    this.services = buildAndDeployCommand.opts().services.split(",");
    this.branch = buildAndDeployCommand.opts().branch;
    this.env = buildAndDeployCommand.opts().env;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executeBuildAndDeployCommand(this);
  }
}
