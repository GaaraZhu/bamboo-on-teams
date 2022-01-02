import { Response } from "lambda-api";
import axios from "axios";
import { DeployAction } from "../../models/deployAction";
import { getEnvironment } from "./listEnvironmentsExecutor";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { getRelease } from "./listReleasesExecutor";
import { prodEnvCheck } from "../../utils";

export const executeDeployCommand = async (
  action: DeployAction,
  response: Response
): Promise<void> => {
  prodEnvCheck(action.env);

  const project = await getDeploymentProject(action.deploymentProject);
  const env = await getEnvironment(project.id, action.env);
  const release = await getRelease(project.id, action.releaseName);
  response.status(200).json(await deploy(env.id, release.id));
};

export const deploy = async (
  envId: string,
  releaseId: string
): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/queue/deployment/?environmentId=${envId}&versionId=${releaseId}`;
  const { data } = await axios.post(url, undefined, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return data;
};
