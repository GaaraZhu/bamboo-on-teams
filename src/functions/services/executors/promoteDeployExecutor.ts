import { getEnvironment } from "./listEnvironmentsExecutor";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { PromoteDeployAction } from "../../models/promoteDeployAction";
import { listDeploys } from "./listDeploysExecutor";
import { deployRelease } from "./deployReleaseExecutor";
import { axiosPost } from "../axiosService";
import { DeployResult } from "./deployLatestBuildExecutor";
import {
  CheckerInputType,
  DeployReleaseJobCheckerInput,
} from "../../api/handlers/statusChecker";
import { startCheckerExecution } from "../stepFunctionService";
import {
  executeOperationCheck,
  prodEnvCheck,
  viewOperationCheck,
} from "../../utils";
import { getConfig } from "../config";

export const executePromoteDeployCommand = async (
  action: PromoteDeployAction,
  isBatch = false
): Promise<any> => {
  prodEnvCheck(action.targetEnv, action.triggeredBy);
  const project = await getDeploymentProject(action.service);
  const sourceEnv = await getEnvironment(project.id, action.sourceEnv);
  viewOperationCheck(sourceEnv.operations);
  const lastSuccessDeploy = (await listDeploys(sourceEnv.id))?.find(
    (d: any) => d.deploymentState === "SUCCESS"
  );
  if (!lastSuccessDeploy || !lastSuccessDeploy.release?.id) {
    throw {
      status: 400,
      message: `No success deployment in environment ${action.sourceEnv} to promote`,
    };
  }
  const targetEnv = await getEnvironment(project.id, action.targetEnv);
  executeOperationCheck(targetEnv.operations);
  const deployment = await deployRelease(
    targetEnv,
    lastSuccessDeploy.release.id
  );
  const deployResult: DeployResult = {
    service: action.service,
    environment: action.targetEnv,
    build: {
      release: lastSuccessDeploy.release.name,
    },
    deployment: {
      id: deployment.deploymentResultId,
      link: deployment.link.href,
    },
  };

  // start async job status checker and push the result to MS Teams
  // NOTE: batch job has its own status checking logic for final notification push
  if (!isBatch) {
    const checkerInput: DeployReleaseJobCheckerInput = {
      type: CheckerInputType.DEPLOY_RELEASE,
      resultKey: deployment.deploymentResultId,
      resultUrl: deployment.link.href,
      service: action.service,
      release: lastSuccessDeploy.release.name,
      environment: action.targetEnv,
      triggeredBy: action.triggeredBy,
    };
    await startCheckerExecution(deployment.deploymentResultId, checkerInput);
  }
  return deployResult;
};

export const deploy = async (
  envId: string,
  releaseId: string
): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/queue/deployment/?environmentId=${envId}&versionId=${releaseId}`;
  const { data } = await axiosPost(url, undefined, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
      "Content-Type": "application/json",
    },
  });

  return data;
};
