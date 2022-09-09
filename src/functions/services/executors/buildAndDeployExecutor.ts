import { BatcherExecutionInput, startExecution } from "../stepFunctionService";
import { ActionName } from "../../models/actions";
import { BuildAndDeployAction } from "../../models/buildAndDeployAction";
import { getBranch } from "./listPlanBranchesExecutor";
import { prodEnvCheck } from "../../utils";
import {
  getDeploymentProject,
  validateDeploymentProjects,
} from "./listDeploymentProjectsExecutor";
import { TeamsUser } from "../../models/teams";

export const executeBuildAndDeployCommand = async (
  action: BuildAndDeployAction
): Promise<any> => {
  // check environment availability
  prodEnvCheck(action.env, action.triggeredBy);

  if (action.services.length === 1) {
    const service = action.services[0];
    // check service and branch for build step
    await getBranch(service, action.branch);

    // check deployment project
    await getDeploymentProject(service);

    // start batcher step function for batch build
    const input: BatcherExecutionInput = getBuildAndDeployExecutionInput(
      service,
      action.branch,
      action.env,
      action.triggeredBy
    );
    await startExecution(input, process.env.BUILD_AND_DEPLOYER_ARN);
  } else {
    // check deployment projects
    await validateDeploymentProjects(action.services);
    // start batchBuildAndDeploy step function
    const input: BatcherExecutionInput[] = [];
    action.services.forEach((s: string) => {
      input.push(
        getBuildAndDeployExecutionInput(
          s,
          action.branch,
          action.env,
          action.triggeredBy
        )
      );
    });
    await startExecution(input, process.env.BATCH_BUILD_AND_DEPLOYER_ARN);
  }
};

const getBuildAndDeployExecutionInput = (
  service: string,
  branch: string,
  environment: string,
  triggeredBy: TeamsUser
): BatcherExecutionInput => {
  return {
    commands: [
      {
        command: `${ActionName.BUILD} -s ${service} -b ${branch}`,
        service: service,
        branch: branch,
        triggeredBy: {
          id: triggeredBy.id,
          name: triggeredBy.name,
        },
      },
      {
        command: `${ActionName.DEPLOY} -s ${service} -b ${branch} -e ${environment}`,
        service: service,
        branch: branch,
        environment: environment,
        triggeredBy: {
          id: triggeredBy.id,
          name: triggeredBy.name,
        },
      },
    ],
  };
};
