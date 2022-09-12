import { ActionName } from "../../models/actions";
import { ReleaseAction } from "../../models/releaseAction";
import { prodEnvCheck } from "../../utils";
import { ReleaserExecutionInput, startExecution } from "../stepFunctionService";
import { listDeploymentProjects } from "./listDeploymentProjectsExecutor";

export const executeReleaseCommand = async (
  action: ReleaseAction
): Promise<any> => {
  // 1. Prod environment availablity check
  prodEnvCheck(action.env, action.triggeredBy);

  // 2. validate incoming deployment project names
  const projects = await listDeploymentProjects();
  const unknownServices: string[] = [];
  action.services.flat().forEach((service) => {
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

  // 3. start releaser step function
  const input: ReleaserExecutionInput = {
    batches: action.services.map((services: string[]) => ({
      actionName: action.actionName,
      commands: services.map((service) => ({
        command: `${ActionName.DEPLOY} -s ${service} -b ${action.branch} -e ${action.env}`,
        service: service,
        branch: action.branch,
        environment: action.env,
        triggeredBy: {
          id: action.triggeredBy.id,
          name: action.triggeredBy.name,
        },
      })),
    })),
  };
  await startExecution(input, process.env.RELEASER_ARN);
};
