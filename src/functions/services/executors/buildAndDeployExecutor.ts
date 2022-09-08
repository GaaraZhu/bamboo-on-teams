import {
  BatcherExecutionInput,
  startBatcherExecution,
} from "../stepFunctionService";
import { ActionName } from "../../models/actions";
import { listPlans } from "./listPlansExecutor";
import { BuildAndDeployAction } from "../../models/buildAndDeployAction";
import { getBranch } from "./listPlanBranchesExecutor";
import { prodEnvCheck } from "../../utils";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";

export const executeBuildAndDeployCommand = async (
  action: BuildAndDeployAction
): Promise<any> => {
  // check environment availability
  prodEnvCheck(action.env, action.triggeredBy);

  // check service and branch for build step
  await getBranch(action.service, action.branch);

  // check deployment project
  await getDeploymentProject(action.service);

  // start batcher step function for batch build
  const input: BatcherExecutionInput = {
    commands: [
      {
        command: `${ActionName.BUILD} -s ${action.service} -b ${action.branch}`,
        service: action.service,
        branch: action.branch,
        triggeredBy: {
          id: action.triggeredBy.id,
          name: action.triggeredBy.name,
        },
      },
      {
        command: `${ActionName.DEPLOY} -s ${action.service} -b ${action.branch} -e ${action.env}`,
        service: action.service,
        branch: action.branch,
        environment: action.env,
        triggeredBy: {
          id: action.triggeredBy.id,
          name: action.triggeredBy.name,
        },
      },
    ],
  };
  await startBatcherExecution(input, process.env.BUILD_AND_DEPLOYER_ARN);
};
