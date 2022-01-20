import { Response } from "lambda-api";
import { DeployReleaseAction } from "../../models/deployReleaseAction";
import { getEnvironment } from "./listEnvironmentsExecutor";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { getRelease } from "./listReleasesExecutor";
import { prodEnvCheck } from "../../utils";
import { axiosPost } from "../axiosService";

export const executeDeployReleaseCommand = async (
  action: DeployReleaseAction,
  response: Response
): Promise<void> => {
  prodEnvCheck(action.env);

  const project = await getDeploymentProject(action.deploymentProject);
  const env = await getEnvironment(project.id, action.env);
  const release = await getRelease(project.id, action.releaseName);
  response.status(200).json(await deployRelease(env.id, release.id));
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
