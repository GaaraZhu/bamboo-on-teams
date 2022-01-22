import { Response } from "lambda-api";
import { DeployReleaseAction } from "../../models/deployReleaseAction";
import { getEnvironment } from "./listEnvironmentsExecutor";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { getRelease } from "./listReleasesExecutor";
import { prodEnvCheck, startCheckerExecution } from "../../utils";
import { axiosPost } from "../axiosService";
import {
  CheckerInputType,
  DeployReleaseJobCheckerInput,
} from "../../api/handlers/statusChecker";

export const executeDeployReleaseCommand = async (
  action: DeployReleaseAction,
  response: Response
): Promise<void> => {
  prodEnvCheck(action.env);

  const project = await getDeploymentProject(action.service);
  const env = await getEnvironment(project.id, action.env);
  const release = await getRelease(project.id, action.releaseName);
  const deployment = await deployRelease(env.id, release.id);
  response.status(200).json(deployment);

  // start async job status checker and push the result to MS Teams
  const checkerInput: DeployReleaseJobCheckerInput = {
    type: CheckerInputType.DEPLOY_RELEASE,
    resultKey: deployment.deploymentResultId,
    resultUrl: deployment.link.href,
    service: action.service,
    release: action.releaseName,
    environment: action.env,
    triggeredBy: action.triggeredBy,
  };
  await startCheckerExecution(deployment.deploymentResultId, checkerInput);
};

export const deployRelease = async (
  envId: string,
  releaseId: string
): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/queue/deployment/?environmentId=${envId}&versionId=${releaseId}`;
  const { data } = await axiosPost(url, undefined, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return data;
};
