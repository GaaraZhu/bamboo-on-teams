import { CreateReleaseAction } from "../../models/createReleaseAction";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { axiosPost } from "../axiosService";
import { getConfig } from "../config";

export const executeCreateReleaseCommand = async (
  action: CreateReleaseAction
): Promise<any> => {
  const project = await getDeploymentProject(action.deploymentProject);
  return await createRelease(project.id, action.buildKey, action.releaseName);
};

export const createRelease = async (
  projectId: string,
  buildKey: string,
  release: string
): Promise<any> => {
  const url = `https://${
    getConfig().bambooHostUrl
  }/rest/api/latest/deploy/project/${projectId}/version`;
  const payload = JSON.stringify({
    planResultKey: buildKey,
    name: release,
  });
  const { data } = await axiosPost(url, payload, {
    headers: {
      Authorization: `Bearer ${getConfig().bambooAPIToken}`,
      "Content-Type": "application/json",
    },
  });

  return {
    id: data.id,
    name: data.name,
    planBranchName: data.planBranchName,
    creationDate: data.creationDate
      ? new Date(data.creationDate).toLocaleString()
      : "",
  };
};
