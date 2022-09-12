import { BatchDeployAction } from "../../models/batchDeployAction";
import { BatcherExecutionInput, startExecution } from "../stepFunctionService";
import { listDeploymentProjects } from "./listDeploymentProjectsExecutor";
import { ActionName } from "../../models/actions";
import { prodEnvCheck } from "../../utils";

export const executeBatchDeployCommand = async (
  action: BatchDeployAction
): Promise<any> => {
  prodEnvCheck(action.env, action.triggeredBy);

  const projects = await listDeploymentProjects();

  // validate incoming deployment project names
  const unknownServices: string[] = [];
  action.services.forEach((service) => {
    const project = projects.find(
      (p: any) => p.name.toUpperCase() === service.toUpperCase()
    );
    if (!project) {
      unknownServices.push(service);
    }
  });
  if (unknownServices.length > 0) {
    throw {
      status: 400,
      message: `Unknown project(s) provided ${unknownServices}, please use "search-projects" command to search the project first`,
    };
  }

  // start batcher step function for batch deploy
  const input: BatcherExecutionInput = {
    actionName: action.actionName,
    commands: action.services.map((service) => ({
      command: `${ActionName.DEPLOY} -s ${service} -b ${action.branch} -e ${action.env}`,
      service: service,
      branch: action.branch,
      environment: action.env,
      triggeredBy: {
        id: action.triggeredBy.id,
        name: action.triggeredBy.name,
      },
    })),
  };
  await startExecution(input);
};
