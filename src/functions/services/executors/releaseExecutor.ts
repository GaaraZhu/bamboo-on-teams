import { ActionName } from "../../models/actions";
import { ReleaseAction } from "../../models/releaseAction";
import { prodEnvCheck } from "../../utils";
import {
  ReleaserExecutionInput,
  startReleaserExecution,
} from "../stepFunctionService";
import { listDeploymentProjects } from "./listDeploymentProjectsExecutor";

export const executeReleaseCommand = async (
  action: ReleaseAction
): Promise<any> => {
  // 1. not allowed for Prod environment
  prodEnvCheck(action.env);

  // 2. validate incoming deployment project names
  const projects = await listDeploymentProjects();
  action.services.flat().forEach((service) => {
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

  // 3. start releaser step function
  const input: ReleaserExecutionInput = {
    batches: action.services.map((services: string[]) => ({
      commands: services.map((service) => ({
        command: `${ActionName.DEPLOY_LATEST_BUILD} -s ${service} -b ${action.branch} -e ${action.env}`,
        service: service,
        branch: action.branch,
        environment: action.env,
        triggeredBy: action.triggeredBy,
      })),
    })),
  };
  await startReleaserExecution(input);
};
