import { Response } from "lambda-api";
import axios from "axios";
import { getEnvironment } from "./listEnvironmentsExecutor";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { PromoteReleaseAction } from "../../models/promoteReleaseAction";
import { listDeploys } from "./listDeploysExecutor";
import { deployRelease } from "./deployReleaseExecutor";
import { statusCheck } from "../../utils";

export const executePromoteReleaseCommand = async (
  action: PromoteReleaseAction,
  response: Response
): Promise<void> => {
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
  response
    .status(200)
    .json(await deployRelease(targetEnv.id, lastSuccessDeploy.release.id));
};

export const deploy = async (
  envId: string,
  releaseId: string
): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/queue/deployment/?environmentId=${envId}&versionId=${releaseId}`;
  const { data, status, statusText } = await axios.post(url, undefined, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  statusCheck(status, statusText);

  return data;
};
