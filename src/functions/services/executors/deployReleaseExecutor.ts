import { DeployReleaseAction } from "../../models/deployReleaseAction";
import { Env, getEnvironment } from "./listEnvironmentsExecutor";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { getRelease } from "./listReleasesExecutor";
import { executeOperationCheck, isProdEnv, prodEnvCheck } from "../../utils";
import { axiosPost } from "../axiosService";
import {
  CheckerInputType,
  DeployReleaseJobCheckerInput,
} from "../../api/handlers/statusChecker";
import { startCheckerExecution } from "../stepFunctionService";
import { getConfig } from "../config";

export const executeDeployReleaseCommand = async (
  action: DeployReleaseAction
): Promise<any> => {
  prodEnvCheck(action.env, action.triggeredBy);

  const project = await getDeploymentProject(action.service);
  const env = await getEnvironment(project.id, action.env);
  executeOperationCheck(env.operations);
  const release = await getRelease(project.id, action.releaseName);
  const deployment = await deployRelease(env, release.id);

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

  return deployment;
};

export const deployRelease = async (
  env: Env,
  releaseId: string
): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/queue/deployment/?environmentId=${
    env.id
  }&versionId=${releaseId}`;
  let token = getConfig().bambooAPIToken;
  if (isProdEnv(env.name)) {
    const prodConfig = getConfig().prod;
    if (!prodConfig || !prodConfig.bambooAPIToken) {
      throw {
        status: 500,
        message: `Missing Bamboo API token for Production environment ${env.name}`,
      };
    }
    token = prodConfig.bambooAPIToken;
  }
  const { data } = await axiosPost(url, undefined, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return data;
};
