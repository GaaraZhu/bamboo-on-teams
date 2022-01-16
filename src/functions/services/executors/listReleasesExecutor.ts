import { Response } from "lambda-api";
import axios from "axios";
import { ListReleasesAction } from "../../models/listReleasesAction";
import { getDeploymentProject } from "./listDeploymentProjectsExecutor";
import { statusCheck } from "../../utils";

export const executeListReleasesCommand = async (
  action: ListReleasesAction,
  response: Response
): Promise<void> => {
  const project = await getDeploymentProject(action.deploymentProject);
  response
    .status(200)
    .json(
      (await listReleases(project.id)).filter(
        (r: any) =>
          r.planBranchName.toUpperCase() === action.planBranch.toUpperCase()
      )
    );
};

export const getRelease = async (
  projectId: string,
  releaseName: string
): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/project/${projectId}/versions?name=${releaseName}`;
  const { data, status, statusText } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  statusCheck(status, statusText);

  return {
    id: data.id,
    name: data.name,
    planBranchName: data.planBranchName,
    creationDate: data.creationDate
      ? new Date(data.creationDate).toLocaleString()
      : "",
  };
};

const listReleases = async (projectId: string): Promise<any> => {
  const url = `https://${process.env.BAMBOO_HOST_URL}/rest/api/latest/deploy/project/${projectId}/versions`;
  const { data, status, statusText } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${process.env.BAMBOO_API_TOKEN}`,
    },
  });

  statusCheck(status, statusText);

  return data.versions.map((r: any) => ({
    id: r.id,
    name: r.name,
    planBranchName: r.planBranchName,
    creationDate: r.creationDate
      ? new Date(r.creationDate).toLocaleString()
      : "",
  }));
};
