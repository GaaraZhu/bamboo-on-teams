import { BatchDeployAction } from "../../models/batchDeployAction";
import {
  BatchDeployerExecutionInput,
  startBatchDeployerExecution,
} from "../stepFunctionService";
import { listDeploymentProjects } from "./listDeploymentProjectsExecutor";
import { ActionName } from "../../models/actions";

export const executeBatchDeployCommand = async (
  action: BatchDeployAction
): Promise<any> => {
  const projects = await listDeploymentProjects();

  // validate incoming deployment project names
  action.services.forEach((service) => {
    const project = projects.find(
      (p: any) => p.name.toUpperCase() === service.toUpperCase()
    );
    if (!project) {
      throw {
        status: 400,
        message: `Unknown project provided ${service}, please use "search-projects" command to search the project first`,
      };
    }
  });

  // validate incoming branch

  // start batch deployer step function
  const input: BatchDeployerExecutionInput = {
    commands: action.services.map((service) => ({
      command: `${ActionName.DEPLOY_LATEST_BUILD} -s ${service} -b ${action.branch} -e ${action.env}`,
      service: service,
      branch: action.branch,
      environment: action.env,
      triggeredBy: action.triggeredBy,
    })),
  };
  await startBatchDeployerExecution(input);
};
