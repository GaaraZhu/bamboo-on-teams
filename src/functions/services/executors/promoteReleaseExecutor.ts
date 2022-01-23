import { getEnvironment } from "./listEnvironmentsExecutor";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { PromoteReleaseAction } from "../../models/promoteReleaseAction";
import { listDeploys } from "./listDeploysExecutor";
import { deployRelease } from "./deployReleaseExecutor";
import { axiosPost } from "../axiosService";
import { startCheckerExecution } from "../../utils";
import { DeployResult } from "./deployLatestBuildExecutor";
import {
  CheckerInputType,
  DeployReleaseJobCheckerInput,
} from "../../api/handlers/statusChecker";

export const executePromoteReleaseCommand = async (
  action: PromoteReleaseAction
): Promise<any> => {
  const project = await getDeploymentProject(action.service);
  const sourceEnv = await getEnvironment(project.id, action.sourceEnv);
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
  const deployment = await deployRelease(
    targetEnv.id,
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

  return deployResult;
};

export const deploy = async (
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
