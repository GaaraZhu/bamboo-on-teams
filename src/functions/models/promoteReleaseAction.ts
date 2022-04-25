import { Action, ActionName } from "./actions";
import { Command, CommanderError } from "commander";
import { trim } from "../utils";
import { TeamsUser } from "./teams";
import { executePromoteReleaseCommand } from "../services/executors/promoteReleaseExecutor";

export class PromoteReleaseAction implements Action {
  readonly actionName = ActionName.PROMOTE_RELEASE;
  readonly triggeredBy: TeamsUser;
  services: string[][];
  sourceEnv: string;
  targetEnv: string;

  constructor(command: string, triggeredBy: TeamsUser) {
    const promoteReleaseAction = new Command()
      .name(this.actionName)
      .description(
        "Promote the release deployments from one environment to another in sequential batches."
      )
      .usage("[options]")
      .requiredOption(
        "-s, --services <services>",
        "sequential service name batches separated by semi-collon and with comma to separate service names in each batch, e.g. customers-v1,accounts-v1;transactions-v1",
        trim
      )
      .requiredOption(
        "-se, --source-env <sourceEnv>",
        "source environment name, e.g. dev",
        trim
      )
      .requiredOption(
        "-te, --target-env <targetEnv>",
        "target environment name, e.g. test",
        trim
      );
    promoteReleaseAction.exitOverride((_: CommanderError) => {
      throw {
        status: 400,
        message: promoteReleaseAction.helpInformation(),
      };
    }); //to avoid process.exit

    // The default expectation is that the arguments are from node and have the application as argv[0]
    // and the script being run in argv[1], with user parameters after that.
    const commandInput = [".", ...command.split(" ")];
    promoteReleaseAction.parse(commandInput);
    this.services = promoteReleaseAction
      .opts()
      .services.split(";")
      ?.map((s: string) => s.split(","));
    this.sourceEnv = promoteReleaseAction.opts().sourceEnv;
    this.targetEnv = promoteReleaseAction.opts().targetEnv;
    this.triggeredBy = triggeredBy;
  }

  async process(): Promise<any> {
    return await executePromoteReleaseCommand(this);
  }
}
