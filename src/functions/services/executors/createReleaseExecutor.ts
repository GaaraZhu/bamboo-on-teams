import { Response } from "lambda-api";
import axios from "axios";
import { CreateReleaseAction } from "../../models/createReleaseAction";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";

export const executeCreateReleaseCommand = async (
  action: CreateReleaseAction,
  response: Response
): Promise<void> => {
  const project = await getDeploymentProject(action.deploymentProject);
  response
    .status(200)
    .json(await createRelease(project.id, action.buildKey, action.releaseName));
};

const createRelease = async (
  projectId: string,
  buildKey: string,
  release: string
): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/project/${projectId}/version`;
  const payload = JSON.stringify({
    planResultKey: buildKey,
    name: release,
  });
  const { data } = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return {
    id: data.id,
    name: data.name,
    planBranchName: data.planBranchName,
    creationDate: new Date(data.creationDate).toLocaleString(),
  };
};
